import { createContext, useState, useContext } from 'react';

// Create the context
const ResumeContext = createContext();

// Custom hook for easy access
export const useResumeContext = () => {
  return useContext(ResumeContext);
};

// Provider component to wrap your app
export const ResumeProvider = ({ children }) => {
  // State for the uploaded master resume (structured JSON)
  const [masterResume, setMasterResume] = useState(null);
  
  // State for the pasted Job Description
  const [jobDescription, setJobDescription] = useState('');
  
  // State for the AI-optimized resume output
  const [optimizedResume, setOptimizedResume] = useState(null);
  
  // State for the match score
  const [matchScore, setMatchScore] = useState(0);
  
  // Global loading state for API calls
  const [isLoading, setIsLoading] = useState(false);

  // Value object to expose to the rest of the app
  const value = {
    masterResume,
    setMasterResume,
    jobDescription,
    setJobDescription,
    optimizedResume,
    setOptimizedResume,
    matchScore,
    setMatchScore,
    isLoading,
    setIsLoading
  };

  return (
    <ResumeContext.Provider value={value}>
      {children}
    </ResumeContext.Provider>
  );
};