import db from '../config/db.js';
import { extractResumeStructure, generateTailoredResume } from '../services/geminiService.js';

// 1. Handle Master Resume Upload
export const uploadMasterResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    console.log(`📄 Received file: ${req.file.originalname} (${req.file.size} bytes)`);

    // --- MASSIVE UPGRADE ---
    // We bypass local parsing completely and send the raw file directly to Gemini.
    // Gemini 2.5 natively reads PDFs and understands layouts/tables better than raw text.
    const structuredResume = await extractResumeStructure(req.file);

    // --- MYSQL DATABASE INTEGRATION ---
    const userId = 1; // Hardcoding userId to 1 for testing

    const query = `
      INSERT INTO master_resumes (user_id, resume_json) 
      VALUES (?, ?) 
      ON DUPLICATE KEY UPDATE resume_json = ?
    `;
    
    const jsonString = JSON.stringify(structuredResume);
    
    // Save to database
    await db.execute(query, [userId, jsonString, jsonString]);
    console.log("✅ Master resume successfully parsed by Gemini and saved to MySQL.");
    // -----------------------------------

    res.status(200).json(structuredResume);
  } catch (error) {
    console.error('❌ Error parsing resume:', error);
    res.status(500).json({ error: 'Failed to parse resume file.' });
  }
};

// 2. Handle Job Description Optimization
export const optimizeResume = async (req, res) => {
  try {
    const { 
      masterResume, 
      jobDescription, 
      companyName = "Unknown Company", 
      jobTitle = "Unknown Title" 
    } = req.body;

    if (!masterResume || !jobDescription) {
      return res.status(400).json({ error: 'Missing master resume or job description.' });
    }

    // Call Gemini to tailor the resume based on the Job Description
    const optimizedResume = await generateTailoredResume(masterResume, jobDescription);

    // --- MYSQL DATABASE INTEGRATION ---
    const userId = 1; 
    const matchScore = 92; 
    
    const query = `
      INSERT INTO applications (user_id, company_name, job_title, job_description, match_score, tailored_resume_json)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    const jsonString = JSON.stringify(optimizedResume);
    
    const [result] = await db.execute(query, [
      userId, 
      companyName, 
      jobTitle, 
      jobDescription, 
      matchScore, 
      jsonString
    ]);
    
    console.log("✅ Application successfully saved to MySQL. Record ID:", result.insertId);
    // -----------------------------------

    res.status(200).json(optimizedResume);
  } catch (error) {
    console.error('❌ Error optimizing resume:', error);
    res.status(500).json({ error: 'Failed to optimize resume.' });
  }
};