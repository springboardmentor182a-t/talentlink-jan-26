// client/src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// ── Existing profile pages (other module — do not touch) ──────────────────
import FreelancerProfile from './pages/FreelancerProfile';
import ClientProfile from './pages/ClientProfile';

// ── New auth pages ─────────────────────────────────────────────────────────
import RoleSelection    from './pages/RoleSelection';
import Login            from './pages/Login';
import SignupFreelancer from './pages/SignupFreelancer';
import SignupClient     from './pages/SignupClient';
import ForgotPassword   from './pages/ForgotPassword';
import ResetPassword    from './pages/ResetPassword';
import Dashboard        from './pages/Dashboard';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import FreelancerProfile from "./pages/FreelancerProfile";
import ClientProfile from "./pages/ClientProfile";
import FindProjects from "./pages/FindProjects"; // ← Import your new page
import './themes.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* ── Auth flow ──────────────────────────────────────────────── */}
        <Route path="/"                    element={<RoleSelection />} />
        <Route path="/login"               element={<Login />} />
        <Route path="/signup/freelancer"   element={<SignupFreelancer />} />
        <Route path="/signup/client"       element={<SignupClient />} />
        <Route path="/forgot-password"     element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/dashboard"           element={<Dashboard />} />

        {/* ── Existing profile pages (other module) ──────────────────── */}
        <Route path="/profile/freelancer"  element={<FreelancerProfile />} />
        <Route path="/profile/client"      element={<ClientProfile />} />

        {/* ── TEMPORARY: Dashboard routes for testing (will be replaced during merge) ── */}
        <Route path="/freelancer/dashboard" element={<Dashboard />} />
        <Route path="/client/dashboard"     element={<Dashboard />} />
      </Routes>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<h1>Welcome to TalentLink</h1>} />
          
          {/* Freelancer Route */}
          <Route path="/profile/freelancer" element={<FreelancerProfile />} />
          
          {/* Client Route */}
          <Route path="/profile/client" element={<ClientProfile />} />

          {/* Find Projects Route */}
          <Route path="/find-projects" element={<FindProjects />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
