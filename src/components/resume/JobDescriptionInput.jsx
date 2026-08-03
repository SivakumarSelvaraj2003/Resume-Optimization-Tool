import { useState } from 'react';
import { useResumeContext } from '../../context/ResumeContext';
import './JobDescriptionInput.css';

function JobDescriptionInput() {
  const { 
    jobDescription, 
    setJobDescription, 
    masterResume, 
    setOptimizedResume,
    isLoading,
    setIsLoading
  } = useResumeContext();

  const [localJd, setLocalJd] = useState(jobDescription);

  const handleOptimize = async () => {
    if (!localJd.trim()) return;
    
    setJobDescription(localJd);
    setIsLoading(true);

    try {
      // 1. Send the Master JSON and the JD text to Node.js backend
      const response = await fetch('http://localhost:5000/api/resume/optimize', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ 
          masterResume, 
          jobDescription: localJd,
          // Sending placeholder company info so the backend doesn't throw errors
          companyName: "Target Company", 
          jobTitle: "Target Role"
        })
      });

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      // 2. Receive the newly tailored JSON from Gemini
      const tailoredResume = await response.json();

      // 3. Save to Global Context to instantly render the ResumeEditor
      setOptimizedResume(tailoredResume);

    } catch (error) {
      console.error("Optimization failed:", error);
      alert("Failed to optimize resume. Check the backend console for Gemini API errors.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="jd-input-container">
      <textarea
        className="jd-textarea"
        placeholder="Paste the Job Description here. Include responsibilities, requirements, and keywords..."
        value={localJd}
        onChange={(e) => setLocalJd(e.target.value)}
        disabled={isLoading}
      ></textarea>
      
      <button 
        className="btn-optimize" 
        onClick={handleOptimize}
        disabled={isLoading || !localJd.trim()}
      >
        {isLoading ? '✨ Gemini AI is analyzing & writing...' : '✨ Tailor Resume to JD'}
      </button>
    </div>
  );
}

export default JobDescriptionInput;