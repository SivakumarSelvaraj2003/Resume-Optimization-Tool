import { useResumeContext } from '../context/ResumeContext';
import FileUploader from '../components/resume/FileUploader';
import './Dashboard.css';

function Dashboard({ onNavigate }) {
  const { masterResume } = useResumeContext();

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Welcome to ATS Resume Pro</h1>
        <p>Upload your Master Resume to generate your baseline AI profile.</p>
      </div>

      {/* We will build this component next */}
      <FileUploader />

      <div className="dashboard-actions">
        <button 
          className="btn-primary" 
          onClick={onNavigate}
          disabled={!masterResume}
        >
          {masterResume ? 'Proceed to Job Matcher →' : 'Upload Resume to Continue'}
        </button>
      </div>
    </div>
  );
}

export default Dashboard;