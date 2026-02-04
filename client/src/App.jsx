// client/src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './layout/Sidebar';
import FreelancerDashboard from './pages/FreelancerDashboard';
import BrowseProjects from './pages/BrowseProjects';
import Contracts from './pages/Contracts';
import Messages from './pages/Messages';
import FreelancerProfile from './pages/FreelancerProfile';

function App() {
  return (
    <Router>
      <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F8F9FA' }}>
        {/* The Sidebar is OUTSIDE Routes so it never disappears */}
        <Sidebar /> 
        
        {/* The Main Content area that changes based on the URL */}
        <div style={{ flex: 1, marginLeft: '300px', padding: '40px' }}>
          <Routes>
            {/* Redirect / to /dashboard automatically */}
            <Route path="/" element={<Navigate to="/dashboard" />} />
            
            {/* Each route matches a part of your sidebar */}
            <Route path="/dashboard" element={<FreelancerDashboard />} />
            <Route path="/projects" element={<BrowseProjects />} />
            <Route path="/contracts" element={<Contracts />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/profile/freelancer" element={<FreelancerProfile />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;