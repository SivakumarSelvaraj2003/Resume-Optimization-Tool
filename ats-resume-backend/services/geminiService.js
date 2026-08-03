import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const MODEL_NAME = 'gemini-3.6-flash'; 

/**
 * 1. Extract Master Resume into Structured JSON
 */
export const extractResumeStructure = async (fileObj) => {
  const prompt = `
    You are an expert ATS (Applicant Tracking System) parser.
    Analyze the attached resume document and extract the data into a strict JSON format.
    
    CRITICAL RULES:
    1. Do not hallucinate or add any information not present in the document.
    2. Output ONLY valid JSON. No markdown wrappers like \`\`\`json or \`\`\`.
    3. Accurately capture nested roles/promotions within the same company.
    4. Accurately categorize skills exactly as they are grouped in the resume.
    
    EXPECTED JSON SCHEMA:
    {
      "personalInfo": { 
        "name": "", 
        "headline": "", 
        "email": "", 
        "phone": "", 
        "location": "",
        "links": { "linkedin": "", "github": "", "portfolio": "" }
      },
      "summary": "String summarizing the profile",
      "skills": [
        {
          "category": "e.g., Programming Languages & Core",
          "items": ["JavaScript (ES6+)", "HTML5"]
        }
      ],
      "experience": [
        {
          "company": "Company Name",
          "roles": [
            { "title": "Most Recent Title", "dates": "Start - End Date" },
            { "title": "Previous Title", "dates": "Start - End Date" }
          ],
          "bullets": ["Array of achievement bullets covering the tenure"]
        }
      ],
      "projects": [
        {
          "name": "Project Name",
          "technologies": "Tech stack used",
          "link": "URL if available",
          "bullets": ["Array of descriptive bullets detailing contribution"]
        }
      ],
      "education": [
        {
          "degree": "Degree Name",
          "institution": "University/College",
          "date": "Graduation Date",
          "gpa": "GPA if listed"
        }
      ]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: [
        prompt, 
        {
          inlineData: {
            data: fileObj.buffer.toString("base64"), 
            mimeType: fileObj.mimetype 
          }
        }
      ]
    });
    
    const responseText = response.text.trim();
    const cleanJsonString = responseText.replace(/```json/gi, '').replace(/```/g, '');
    
    return JSON.parse(cleanJsonString);
  } catch (error) {
    console.error("Gemini Extraction Error:", error);
    throw new Error("Failed to extract resume data directly from document.");
  }
};

/**
 * 2. Tailor the Resume to the Job Description
 */
export const generateTailoredResume = async (masterResumeJson, jobDescription) => {
  const prompt = `
    You are an expert Resume Writer and ATS Optimizer. 
    Your task is to tailor the provided Master Resume to perfectly match the Job Description.

   FACT-FENCING RULES (STRICT):
    1. NEVER invent jobs, titles, or years of experience.
    2. NEVER add hard skills the user does not possess.
    3. STRICT CONTEXT ISOLATION: NEVER insert a technology, framework, or language into a professional Experience bullet point unless it was ALREADY explicitly mentioned in that exact job in the Master Resume. Do not bleed skills from the "Projects" or "Skills" sections into professional work history.
    4. SMART KEYWORD MAPPING: If the JD asks for a generic skill and the user has a specific version of it (e.g., JD asks for "SQL" and user has "MySQL"), explicitly weave the exact JD keyword into the user's skills and bullets—BUT ONLY if that job already used that underlying technology.
    5. You MAY re-word bullet points to highlight existing experience that matches the JD.
    6. Write a new professional summary (2-3 sentences) specifically targeting the JD role.
    7. PRESERVE all links, projects, and education exactly as they are in the master resume.
    8. PRESERVE the categorized structure of the skills, but you may re-order items within categories to prioritize JD keywords.
    9. PRESERVE the nested roles/promotions structure in the experience section exactly as it appears in the master resume.
    10. EXACT MATCH HEADLINE: UPDATE the "headline" inside "personalInfo" to exactly match the target Role/Job Title found in the Job Description.
    11. Output ONLY valid JSON. No markdown wrappers.

   EXPECTED JSON SCHEMA:
    {
      "personalInfo": { ...keep exact same as master but update headline },
      "summary": "Newly tailored summary targeting the role",
      "skills": [
        { "category": "Same Category", "items": ["Reordered skills prioritizing JD keywords"] }
      ],
      "experience": [ ...keep exact same as master ],
      "projects": [ ...keep exact same as master ],
      "education": [ ...keep exact same as master ]
    }

    MASTER RESUME JSON:
    ${JSON.stringify(masterResumeJson)}

    JOB DESCRIPTION:
    ${jobDescription}
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });

    const responseText = response.text.trim();
    const cleanJsonString = responseText.replace(/```json/gi, '').replace(/```/g, '');
    
    return JSON.parse(cleanJsonString);
  } catch (error) {
    console.error("Gemini Tailoring Error:", error);
    throw new Error("Failed to tailor resume data.");
  }
};