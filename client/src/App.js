import { BrowserRouter, Routes, Route, Navigate, useContext } from "react-router-dom";
import { AuthProvider, AuthContext } from "./context/AuthContext";

// Auth pages
import ChooseRole       from "./pages/auth/ChooseRole";
import ClientLogin      from "./pages/auth/ClientLogin";
import ClientSignup     from "./pages/auth/ClientSignup";
import FreelancerLogin  from "./pages/auth/FreelancerLogin";
import FreelancerSignup from "./pages/auth/FreelancerSignup";
import ForgotPassword   from "./pages/auth/ForgotPassword";

// Proposal pages
import SubmitProposal   from "./pages/proposal/SubmitProposal";
import ViewProposals    from "./pages/proposal/ViewProposals";
import ProposalTracking from "./pages/proposal/ProposalTracking";

import "./App.css";

function ProtectedRoute({ children, allowedRole }) {
  const { user, role } = useContext(AuthContext);
  if (!user) return <Navigate to="/" replace />;
  if (allowedRole && role !== allowedRole) return <Navigate to="/" replace />;
  return children;
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Routes — unchanged */}
        <Route path="/"                  element={<ChooseRole />} />
        <Route path="/client/login"      element={<ClientLogin />} />
        <Route path="/client/signup"     element={<ClientSignup />} />
        <Route path="/freelancer/login"  element={<FreelancerLogin />} />
        <Route path="/freelancer/signup" element={<FreelancerSignup />} />
        <Route path="/forgot-password"   element={<ForgotPassword />} />

        {/* Proposal Routes — added */}
        <Route path="/submit-proposal/:projectId" element={
          <ProtectedRoute allowedRole="freelancer"><SubmitProposal /></ProtectedRoute>
        } />
        <Route path="/proposal-tracking" element={
          <ProtectedRoute allowedRole="freelancer"><ProposalTracking /></ProtectedRoute>
        } />
        <Route path="/view-proposals/:projectId" element={
          <ProtectedRoute allowedRole="client"><ViewProposals /></ProtectedRoute>
        } />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
