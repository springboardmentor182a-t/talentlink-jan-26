import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthProvider, AuthContext } from "./context/AuthContext";

// Auth pages
import ChooseRole       from "./pages/auth/ChooseRole";
import ClientLogin      from "./pages/auth/ClientLogin";
import ClientSignup     from "./pages/auth/ClientSignup";
import FreelancerLogin  from "./pages/auth/FreelancerLogin";
import FreelancerSignup from "./pages/auth/FreelancerSignup";
import FreelancerDashboard from "./pages/freelancer/Dashboard";
import FreelancerProfile from "./pages/freelancer/Profile";
import BrowseProjects from "./pages/freelancer/BrowseProjects";
import SubmitProposal from "./pages/freelancer/SubmitProposal";
import MyProposals from "./pages/freelancer/MyProposals";
import MyContracts from "./pages/freelancer/MyContracts";
import Messages from "./pages/freelancer/Messages";
import Reviews from "./pages/freelancer/Reviews";
import { ProposalProvider } from "./context/ProposalContext";
import ForgotPassword   from "./pages/auth/ForgotPassword";

// Proposal pages (alternate flow)
import ProposalSubmit   from "./pages/proposal/SubmitProposal";
import ViewProposal     from "./pages/proposal/ViewProposal";
import ProposalTracking from "./pages/proposal/ProposalTracking";

import ClientDashboard from "./pages/ClientDashboard";
import Contracts from "./pages/Contracts";
import Sidebar from "./layout/Sidebar";

import "./App.css";

function ProtectedRoute({ children, allowedRole }) {
  const { user, role } = useContext(AuthContext);
  if (!user) return <Navigate to="/" replace />;
  if (allowedRole && role !== allowedRole) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <ProposalProvider>
        <BrowserRouter>
          <Routes>
            {/* Default */}
            <Route path="/" element={<ChooseRole />} />

            {/* Auth */}
            <Route path="/client/login"      element={<ClientLogin />} />
            <Route path="/client/signup"     element={<ClientSignup />} />
            <Route path="/freelancer/login"  element={<FreelancerLogin />} />
            <Route path="/freelancer/signup" element={<FreelancerSignup />} />
            <Route path="/forgot-password"   element={<ForgotPassword />} />

            {/* Freelancer */}
            <Route path="/freelancer/dashboard"                    element={<FreelancerDashboard />} />
            <Route path="/freelancer/profile"                      element={<FreelancerProfile />} />
            <Route path="/freelancer/browse"                       element={<BrowseProjects />} />
            <Route path="/freelancer/submit-proposal/:projectId"   element={<SubmitProposal />} />
            <Route path="/freelancer/proposals"                    element={<MyProposals />} />
            <Route path="/freelancer/contracts"                    element={<MyContracts />} />
            <Route path="/freelancer/messages"                     element={<Messages />} />
            <Route path="/freelancer/reviews"                      element={<Reviews />} />

            {/* Client */}
            <Route path="/dashboard" element={
              <ProtectedRoute allowedRole="client"><div style={{display:"flex"}}><Sidebar /><main style={{flex:1,marginLeft:"250px",minHeight:"100vh"}}><ClientDashboard /></main></div></ProtectedRoute>
            } />
            <Route path="/contracts" element={
              <ProtectedRoute allowedRole="client"><div style={{display:"flex"}}><Sidebar /><main style={{flex:1,marginLeft:"250px",minHeight:"100vh"}}><Contracts /></main></div></ProtectedRoute>
            } />

            {/* Proposal alternate routes */}
            <Route path="/submit-proposal/:projectId" element={
              <ProtectedRoute allowedRole="freelancer"><ProposalSubmit /></ProtectedRoute>
            } />
            <Route path="/proposal-tracking" element={
              <ProtectedRoute allowedRole="freelancer"><ProposalTracking /></ProtectedRoute>
            } />
            <Route path="/view-proposals/:projectId" element={
              <ProtectedRoute allowedRole="client"><ViewProposal /></ProtectedRoute>
            } />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ProposalProvider>
    </AuthProvider>
  );
}
