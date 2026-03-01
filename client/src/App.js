import './App.css';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import FreelancerRoutes from './pages/freelancer/FreelancerRoutes';
import ClientRoutes from './pages/client/ClientRoutes';

function App() {
  const location = useLocation();
  const isClient = location.pathname.startsWith('/client');
  const isFreelancer = location.pathname.startsWith('/freelancer');

  return (
    <div className="App">
      {isClient || isFreelancer ? (
        <nav className="role-switcher">
          <Link to="/freelancer/messages" className={`nav-link ${isFreelancer ? 'active' : ''}`}>
            Freelancer
          </Link>
          <Link to="/client/messages" className={`nav-link ${isClient ? 'active' : ''}`}>
            Client
          </Link>
        </nav>
      ) : null}
      <Routes>
        <Route path="/freelancer/*" element={<FreelancerRoutes />} />
        <Route path="/client/*" element={<ClientRoutes />} />
        <Route path="/" element={<div style={{ padding: '40px', textAlign: 'center' }}><h1>Welcome to TalentLink Messages</h1><p><Link to="/freelancer/messages">Go to Freelancer Messages</Link></p><p><Link to="/client/messages">Go to Client Messages</Link></p></div>} />
      </Routes>
    </div>
  );
}

function AppWithRouter() {
  return (
    <Router>
      <App />
    </Router>
  );
}

export default AppWithRouter;
