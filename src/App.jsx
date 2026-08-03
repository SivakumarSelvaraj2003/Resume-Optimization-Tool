import { useState } from 'react';
import { ResumeProvider } from './context/ResumeContext';
import './App.css';

// We will create these next, but we define them here as placeholders
import Dashboard from './pages/Dashboard';
import Optimizer from './pages/Optimizer';

function AppContent() {
  // Simple routing state (you can upgrade to react-router-dom later if needed)
  const [currentPage, setCurrentPage] = useState('dashboard');

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="app-logo">ATS Resume Pro</div>
        <nav>
          {/* We will add navigation buttons here later */}
        </nav>
      </header>
      
      <main className="app-main">
        {currentPage === 'dashboard' ? (
          <Dashboard onNavigate={() => setCurrentPage('optimizer')} />
        ) : (
          <Optimizer onNavigate={() => setCurrentPage('dashboard')} />
        )}
      </main>
    </div>
  );
}

function App() {
  return (
    <ResumeProvider>
      <AppContent />
    </ResumeProvider>
  );
}

export default App;