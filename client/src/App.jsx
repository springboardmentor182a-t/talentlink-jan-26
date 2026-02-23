import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';

// --- Layout & Components ---
import Sidebar from './layout/Sidebar';

// --- Auth Pages (From main-group-D) ---
import RoleSelection from './pages/RoleSelection';
import Login from './pages/Login';
import SignupFreelancer from './pages/SignupFreelancer';
import SignupClient from './pages/SignupClient';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// --- Dashboard & Internal Pages (From Your Branch) ---
import FreelancerDashboard from './pages/FreelancerDashboard';
import BrowseProjects from './pages/BrowseProjects';
import Contracts from './pages/Contracts';
import Messages from './pages/Messages';
import FreelancerProfile from './pages/FreelancerProfile';
import ClientProfile from './pages/ClientProfile';

// Create a layout so the Sidebar ONLY appears on internal pages
const DashboardLayout = () => (
  <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F8F9FA' }}>
    <Sidebar />
    <div style={{ flex: 1, marginLeft: '300px', padding: '40px' }}>
      <Outlet />
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <Routes>
        {/* --- Public Auth Flow (No Sidebar) --- */}
        <Route path="/" element={<RoleSelection />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup/freelancer" element={<SignupFreelancer />} />
        <Route path="/signup/client" element={<SignupClient />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* --- Authenticated Dashboard Flow (With Sidebar) --- */}
        <Route element={<DashboardLayout />}>
          {/* Redirect /dashboard to Freelancer Dashboard by default for now */}
          <Route path="/dashboard" element={<FreelancerDashboard />} />
          <Route path="/projects" element={<BrowseProjects />} />
          <Route path="/contracts" element={<Contracts />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/profile/freelancer" element={<FreelancerProfile />} />
          <Route path="/profile/client" element={<ClientProfile />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;