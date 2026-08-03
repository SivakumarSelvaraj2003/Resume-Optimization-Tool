import { useResumeContext } from '../context/ResumeContext';
import JobDescriptionInput from '../components/resume/JobDescriptionInput';
import ResumeEditor from '../components/resume/ResumeEditor';
import './Optimizer.css';

function Optimizer({ onNavigate }) {
  const { masterResume, optimizedResume } = useResumeContext();

  return (
    <div className="optimizer-container">
      <div className="optimizer-header">
        <div>
          <h2>Tailor Your Resume</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Master Profile Loaded: {masterResume?.personalInfo?.name || 'Ready'}
          </p>
        </div>
        <button className="btn-secondary" onClick={onNavigate}>
          ← Back to Dashboard
        </button>
      </div>

      <div className="optimizer-workspace">
        {/* Left Column: JD Input & AI Controls */}
        <div className="panel left-panel">
          <div className="panel-header">1. Paste Job Description</div>
          <div className="panel-body">
            <JobDescriptionInput />
          </div>
        </div>

        {/* Right Column: Live Edit & Preview */}
        <div className="panel right-panel">
          <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>2. Live ATS Preview</span>
            {optimizedResume && <span style={{ color: 'var(--success-color)' }}>ATS Score: 92%</span>}
          </div>
          <div className="panel-body">
            {optimizedResume ? (
              <ResumeEditor />
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '4rem' }}>
                <p>Paste a Job Description and click "Optimize" to generate your tailored resume.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Optimizer;