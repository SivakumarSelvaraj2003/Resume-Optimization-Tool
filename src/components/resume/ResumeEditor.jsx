import { useRef, useState } from 'react';
import { saveAs } from 'file-saver';
import HtmlToDocx from '@turbodocx/html-to-docx'; // Using the modern Vite-compatible package
import { useResumeContext } from '../../context/ResumeContext';
import './ResumeEditor.css';

function ResumeEditor() {
  // Pull missingSkills dynamically from your context/backend response!
  const { optimizedResume } = useResumeContext();
// Now grab the missingSkills directly from the optimized JSON!
const missingSkills = optimizedResume?.missingSkills || [];
  const paperRef = useRef(null);

  // --- NEW: Sidebar State ---
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // (We completely deleted the hardcoded array!)

  // --- NEW: Click to Copy Function ---
  const handleCopySkill = (skill, e) => {
    navigator.clipboard.writeText(skill);
    const originalText = e.target.innerText;
    e.target.innerText = "Copied! ✔";
    e.target.style.backgroundColor = "#16a34a";
    e.target.style.color = "white";
    setTimeout(() => {
      e.target.innerText = originalText;
      e.target.style.backgroundColor = "";
      e.target.style.color = "";
    }, 1000);
  };

// --- REAL TEXT-BASED ATS PDF GENERATION ---
  const handleDownloadPDF = () => {
    // Triggers the browser's native print dialog
    // Selecting "Save as PDF" creates a true ATS-readable vector text PDF
    window.print();
  };
// --- REAL DOCX DOWNLOAD LOGIC ---
  const handleDownloadDOCX = async () => {
    if (!optimizedResume) return;

    const { personalInfo, summary, skills, experience, projects, education } = optimizedResume;

    // We build a custom HTML string specifically formatted for Microsoft Word's engine
    // Word requires tables (not flexbox) for left/right alignment!
    const wordSafeHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Calibri', sans-serif; font-size: 11pt; line-height: 1.3; }
            h1 { font-size: 18pt; text-align: center; text-transform: uppercase; margin-bottom: 2pt; }
            h2 { font-size: 12pt; border-bottom: 1px solid black; text-transform: uppercase; margin-top: 12pt; margin-bottom: 6pt; padding-bottom: 2pt; }
            .contact-info { text-align: center; font-size: 10pt; margin-bottom: 12pt; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 4pt; }
            td { vertical-align: top; padding: 0; }
            .text-right { text-align: right; }
            .bold { font-weight: bold; }
            .italic { font-style: italic; }
            ul { margin-top: 2pt; margin-bottom: 8pt; padding-left: 20px; }
            li { margin-bottom: 3pt; }
          </style>
        </head>
        <body>
          
          <!-- Header -->
          <h1>${personalInfo?.name || "YOUR NAME"}</h1>
          <div class="contact-info">
            <span class="bold">${personalInfo?.headline || ""}</span><br>
            ${personalInfo?.email} | ${personalInfo?.phone} | ${personalInfo?.location}<br>
            ${[personalInfo?.links?.linkedin, personalInfo?.links?.github, personalInfo?.links?.portfolio].filter(Boolean).join(" | ")}
          </div>

          <!-- Summary -->
          ${summary ? `
            <h2>Professional Summary</h2>
            <p>${summary}</p>
          ` : ''}

          <!-- Skills -->
          ${skills && skills.length > 0 ? `
            <h2>Technical Skills</h2>
            ${skills.map(group => `<p><span class="bold">${group.category}:</span> ${group.items.join(", ")}</p>`).join('')}
          ` : ''}

          <!-- Experience -->
          ${experience && experience.length > 0 ? `
            <h2>Professional Experience</h2>
            ${experience.map(job => `
              <div class="bold" style="font-size: 12pt;">${job.company}</div>
              ${job.roles.map(role => `
                <table>
                  <tr>
                    <td class="italic">${role.title}</td>
                    <td class="text-right">${role.dates}</td>
                  </tr>
                </table>
              `).join('')}
              <ul>
                ${job.bullets.map(bullet => `<li>${bullet}</li>`).join('')}
              </ul>
            `).join('')}
          ` : ''}

          <!-- Projects -->
          ${projects && projects.length > 0 ? `
            <h2>Projects</h2>
            ${projects.map(project => `
              <table>
                <tr>
                  <td>
                    <span class="bold">${project.name}</span> 
                    ${project.technologies ? `<span class="italic">| ${project.technologies}</span>` : ''}
                  </td>
                  <td class="text-right">${project.link || ''}</td>
                </tr>
              </table>
              <ul>
                ${project.bullets ? project.bullets.map(bullet => `<li>${bullet}</li>`).join('') : `<li>${project.description}</li>`}
              </ul>
            `).join('')}
          ` : ''}

          <!-- Education -->
          ${education && education.length > 0 ? `
            <h2>Education</h2>
            ${education.map(edu => `
              <table>
                <tr>
                  <td class="bold">${edu.degree}</td>
                  <td class="text-right">${edu.date}</td>
                </tr>
                <tr>
                  <td>${edu.institution}</td>
                  <td class="text-right">${edu.gpa ? `CGPA: ${edu.gpa}` : ''}</td>
                </tr>
              </table>
            `).join('')}
          ` : ''}

        </body>
      </html>
    `;

    try {
      const rawOutput = await HtmlToDocx(wordSafeHTML);
      const browserBlob = new Blob([rawOutput], { 
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
      });
      saveAs(browserBlob, `${optimizedResume?.personalInfo?.name || 'Tailored'}_Resume.docx`);
    } catch (error) {
      console.error("Error generating DOCX:", error);
      alert("Failed to generate DOCX file.");
    }
  };

  if (!optimizedResume) return null;

  const { personalInfo, summary, skills, experience, projects, education } = optimizedResume;

 return (
    <div className="editor-container">
      
      {/* --- NEW: SIDEBAR TOGGLE BUTTON --- */}
      <button 
        className={`sidebar-toggle-btn ${isSidebarOpen ? 'open' : ''}`} 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        {isSidebarOpen ? '◀ Close' : '💡 Missing Skills'}
      </button>

      {/* --- NEW: THE SIDEBAR --- */}
      <div className={`missing-skills-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <h3>JD Keyword Match</h3>
        <p className="sidebar-instructions">Click any missing skill to copy it to your clipboard, then paste it into your resume!</p>
        
        {missingSkills.map((group, index) => (
          <div key={index} className="missing-skill-group">
            <h4>{group.category}</h4>
            <div className="skill-badges">
              {group.items.map((skill, sIndex) => (
                <span 
                  key={sIndex} 
                  className="skill-badge" 
                  onClick={(e) => handleCopySkill(skill, e)}
                  title="Click to copy!"
                >
                  + {skill}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="editor-actions">
        <button className="btn-download" onClick={handleDownloadPDF}>
          📥 Download PDF
        </button>
        <button className="btn-download" onClick={handleDownloadDOCX} style={{ backgroundColor: '#2563eb' }}>
          📄 Download Word
        </button>
      </div>

      <div className="resume-paper" ref={paperRef}>
        
        {/* Added a negative marginTop to pull the whole block up */}
        <div className="resume-header" style={{ marginTop: '-15px' }}>
          <div className="resume-name editable" contentEditable="true" suppressContentEditableWarning>
            {personalInfo?.name || "YOUR NAME"}
          </div>
          
          {/* Updated: Larger, bolder, uppercase headline */}
          {personalInfo?.headline && (
            <div 
              className="resume-headline editable" 
              contentEditable="true" 
              suppressContentEditableWarning 
              style={{ 
                fontSize: '18px', 
                fontWeight: 'bold', 
                textTransform: 'uppercase',
                letterSpacing: '1px',
                marginBottom: '8px',
                marginTop: '4px'
              }}
            >
              {personalInfo.headline}
            </div>
          )}

          <div className="resume-contact editable" contentEditable="true" suppressContentEditableWarning>
            {personalInfo?.email} | {personalInfo?.phone} | {personalInfo?.location}
          </div>
          
         {/* REPLACE IT WITH THIS CLICKABLE LINKS BLOCK */}
          {personalInfo?.links && (
            <div className="resume-links" style={{ fontSize: '12px', marginTop: '2px' }}>
              {/* LinkedIn */}
              {personalInfo.links.linkedin && (
                <a 
                  href={personalInfo.links.linkedin.startsWith('http') ? personalInfo.links.linkedin : `https://${personalInfo.links.linkedin}`}
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="resume-link"
                >
                  {personalInfo.links.linkedin.replace(/^https?:\/\//, '')}
                </a>
              )}

              {/* GitHub (Adds the ' | ' separator if LinkedIn also exists) */}
              {personalInfo.links.github && (
                <>
                  {personalInfo.links.linkedin && ' | '}
                  <a 
                    href={personalInfo.links.github.startsWith('http') ? personalInfo.links.github : `https://${personalInfo.links.github}`}
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="resume-link"
                  >
                    {personalInfo.links.github.replace(/^https?:\/\//, '')}
                  </a>
                </>
              )}

              {/* Portfolio (Adds the ' | ' separator if LinkedIn or GitHub exists) */}
              {personalInfo.links.portfolio && (
                <>
                  {(personalInfo.links.linkedin || personalInfo.links.github) && ' | '}
                  <a 
                    href={personalInfo.links.portfolio.startsWith('http') ? personalInfo.links.portfolio : `https://${personalInfo.links.portfolio}`}
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="resume-link"
                  >
                    {personalInfo.links.portfolio.replace(/^https?:\/\//, '')}
                  </a>
                </>
              )}
            </div>
          )}
        </div>

        {/* Summary Section */}
        {summary && (
          <div className="resume-section">
            <div className="section-title">Professional Summary</div>
            <div className="resume-summary editable" contentEditable="true" suppressContentEditableWarning>
              {summary}
            </div>
          </div>
        )}

        {/* Categorized Skills Section */}
        {skills && skills.length > 0 && (
          <div className="resume-section">
            <div className="section-title">Technical Skills</div>
            <div className="skills-list editable" contentEditable="true" suppressContentEditableWarning>
              {skills.map((skillGroup, index) => (
                <div key={index} style={{ marginBottom: '4px' }}>
                  <strong>• {skillGroup.category}:</strong> {skillGroup.items.join(", ")}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Nested Experience Section */}
        {experience && experience.length > 0 && (
          <div className="resume-section">
            <div className="section-title">Professional Experience</div>
            {experience.map((job, index) => (
              <div className="job-item" key={index} style={{ marginBottom: '12px' }}>
                <div className="job-header" style={{ marginBottom: '4px' }}>
                  <span className="job-company editable" contentEditable="true" suppressContentEditableWarning style={{ fontWeight: 'bold', fontSize: '14px' }}>
                    {job.company}
                  </span>
                </div>
                
                {/* Map through the different roles/promotions at this company */}
                {job.roles && job.roles.map((role, rIndex) => (
                  <div key={rIndex} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px', marginLeft: '8px' }}>
                    <span className="job-title editable" contentEditable="true" suppressContentEditableWarning style={{ fontStyle: 'italic' }}>
                      {role.title}
                    </span>
                    <span className="job-dates editable" contentEditable="true" suppressContentEditableWarning style={{ fontSize: '12px' }}>
                      {role.dates}
                    </span>
                  </div>
                ))}

                <ul className="job-bullets editable" contentEditable="true" suppressContentEditableWarning style={{ marginTop: '6px' }}>
                  {job.bullets.map((bullet, bIndex) => (
                    <li key={bIndex}>{bullet}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {/* Projects Section with Bullets */}
        {projects && projects.length > 0 && (
          <div className="resume-section">
            <div className="section-title">Projects</div>
            {projects.map((project, index) => (
              <div className="job-item" key={index} style={{ marginBottom: '10px' }}>
                <div className="job-header">
                  <div>
                    <span className="job-title editable" contentEditable="true" suppressContentEditableWarning>{project.name}</span>
                    {project.technologies && (
                      <span className="editable" contentEditable="true" suppressContentEditableWarning style={{ fontStyle: 'italic', fontSize: '12px', marginLeft: '4px' }}>
                        | {project.technologies}
                      </span>
                    )}
                  </div>
                  {project.link && (
                    <div className="job-dates editable" contentEditable="true" suppressContentEditableWarning style={{ fontSize: '12px' }}>
                      {project.link}
                    </div>
                  )}
                </div>
                {/* Now rendering project descriptions as bullets */}
                <ul className="job-bullets editable" contentEditable="true" suppressContentEditableWarning style={{ marginTop: '4px' }}>
                  {project.bullets && project.bullets.map((bullet, bIndex) => (
                    <li key={bIndex}>{bullet}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {/* Education Section */}
        {education && education.length > 0 && (
          <div className="resume-section">
            <div className="section-title">Education</div>
            {education.map((edu, index) => (
              <div className="job-item" key={index} style={{ marginBottom: '8px' }}>
                <div className="job-header">
                  <span className="job-title editable" contentEditable="true" suppressContentEditableWarning>{edu.degree}</span>
                  <span className="job-dates editable" contentEditable="true" suppressContentEditableWarning style={{ fontSize: '12px' }}>{edu.date}</span>
                </div>
                <div className="job-company editable" contentEditable="true" suppressContentEditableWarning>
                  {edu.institution} {edu.gpa ? `| CGPA: ${edu.gpa}` : ''}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

export default ResumeEditor;