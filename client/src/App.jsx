import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import "./assets/theme.css";

// --- Auth Pages (Team's Code) ---
import RoleSelection from "./pages/RoleSelection";
import Login from "./pages/Login";
import SignupFreelancer from "./pages/SignupFreelancer";
import SignupClient from "./pages/SignupClient";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";

// --- Profile & Proposal Pages (Your Code) ---
import FreelancerProfile from "./pages/FreelancerProfile";
import ClientProfile from "./pages/ClientProfile";
import FreelancerView from "./pages/FreelancerView";
import ClientView from "./pages/ClientView";
import SubmitProposal from "./pages/SubmitProposal";
import FreelancerContracts from "./pages/FreelancerContracts";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* 1. PUBLIC ROUTES (No Sidebar here!) */}
        <Route path="/" element={<RoleSelection />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup/freelancer" element={<SignupFreelancer />} />
        <Route path="/signup/client" element={<SignupClient />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* 2. PRIVATE ROUTES (Sidebar Layout is applied here!) */}
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/freelancer/dashboard" element={<Dashboard />} />
          <Route path="/client/dashboard" element={<Dashboard />} />

          {/* Your Profile Pages */}
          <Route path="/profile/freelancer" element={<FreelancerView />} />
          <Route path="/profile/freelancer/edit" element={<FreelancerProfile />} />
          <Route path="/profile/client" element={<ClientView />} />
          <Route path="/profile/client/edit" element={<ClientProfile />} />
          
          {/* Your Proposal Pages */}
          <Route path="/projects/:projectId/apply" element={<SubmitProposal />} />
          <Route path="/contracts" element={<FreelancerContracts />} />
        </Route>
      </Routes>
    </Router>
  );
}