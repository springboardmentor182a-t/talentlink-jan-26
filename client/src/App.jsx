import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// ── Layout ─────────────────────────────────────────────
import Layout from './components/Layout';

// ── Existing profile pages ─────────────────────────────
import FreelancerProfile from './pages/FreelancerProfile';
import ClientProfile from './pages/ClientProfile';

// ── Auth pages ─────────────────────────────────────────
import RoleSelection from './pages/RoleSelection';
import Login from './pages/Login';
import SignupFreelancer from './pages/SignupFreelancer';
import SignupClient from './pages/SignupClient';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// ── Dashboard & Projects ───────────────────────────────
import Dashboard from './pages/Dashboard';
import FindProjects from './pages/FindProjects';

import "./assets/theme.css";

function App() {
  return (
    <Router>
      <Routes>

        {/* ── Public / Auth Routes ───────────────────────────── */}
        <Route path="/" element={<RoleSelection />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup/freelancer" element={<SignupFreelancer />} />
        <Route path="/signup/client" element={<SignupClient />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* ── Protected / Dashboard Routes ──────────────────── */}
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/freelancer/dashboard" element={<Dashboard />} />
          <Route path="/client/dashboard" element={<Dashboard />} />
          <Route path="/find-projects" element={<FindProjects />} />

          {/* Profile routes inside layout */}
          <Route path="/profile/freelancer" element={<FreelancerProfile />} />
          <Route path="/profile/client" element={<ClientProfile />} />
        </Route>

      </Routes>
    </Router>
  );
}

export default App;