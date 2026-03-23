import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import { ProposalProvider } from "./context/ProposalContext";

// Auth pages
import ChooseRole       from "./pages/auth/ChooseRole";
import ClientLogin      from "./pages/auth/ClientLogin";
import ClientSignup     from "./pages/auth/ClientSignup";
import FreelancerLogin  from "./pages/auth/FreelancerLogin";
import FreelancerSignup from "./pages/auth/FreelancerSignup";
import ForgetPassword   from "./pages/auth/ForgotPassword";

// Freelancer pages
import FreelancerDashboard from "./pages/freelancer/Dashboard";
import FreelancerProfile   from "./pages/freelancer/Profile";
import BrowseProjects      from "./pages/freelancer/BrowseProjects";
import MyContracts         from "./pages/freelancer/MyContracts";
import Messages            from "./pages/freelancer/Messages";
import Reviews             from "./pages/freelancer/Reviews";

// Proposal pages
import SubmitProposal   from "./pages/proposal/SubmitProposal";
import ViewProposals    from "./pages/proposal/ViewProposals";
import ProposalTracking from "./pages/proposal/ProposalTracking";

import Sidebar from "./layout/Sidebar";
import ClientDashboard from "./pages/ClientDashboard";
import Contracts from "./pages/Contracts";

import "./App.css";

function ProtectedRoute({ children, allowedRole }) {
  const { user, role, loading } = useContext(AuthContext);
  if (loading) return <div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:"100vh" }}>Loading...</div>;
  if (!user) return <Navigate to="/" replace />;
  if (allowedRole && role !== allowedRole) return <Navigate to="/" replace />;
  return children;
}

const DashboardLayout = ({ children }) => {
  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <main
        style={{
          flex: 1,
          marginLeft: "250px",
          minHeight: "100vh",
          backgroundColor: "#f0f2f5",
        }}
      >
        {children}
      </main>
    </div>
  );
};

const FreelancerLayout = DashboardLayout; // They share the same sidebar-based layout

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Routes */}
        <Route path="/"                  element={<ChooseRole />} />
        <Route path="/client/login"      element={<ClientLogin />} />
        <Route path="/client/signup"     element={<ClientSignup />} />
        <Route path="/freelancer/login"  element={<FreelancerLogin />} />
        <Route path="/freelancer/signup" element={<FreelancerSignup />} />
        <Route path="/forgot-password"   element={<ForgetPassword />} />

        {/* Freelancer Routes */}
        <Route path="/freelancer/dashboard" element={
          <ProtectedRoute allowedRole="freelancer"><FreelancerLayout><FreelancerDashboard /></FreelancerLayout></ProtectedRoute>
        } />
        <Route path="/freelancer/profile" element={
          <ProtectedRoute allowedRole="freelancer"><FreelancerLayout><FreelancerProfile /></FreelancerLayout></ProtectedRoute>
        } />
        <Route path="/freelancer/browse" element={
          <ProtectedRoute allowedRole="freelancer"><FreelancerLayout><BrowseProjects /></FreelancerLayout></ProtectedRoute>
        } />
        <Route path="/submit-proposal/:projectId" element={
          <ProtectedRoute allowedRole="freelancer"><FreelancerLayout><SubmitProposal /></FreelancerLayout></ProtectedRoute>
        } />
        <Route path="/proposal-tracking" element={
          <ProtectedRoute allowedRole="freelancer"><FreelancerLayout><ProposalTracking /></FreelancerLayout></ProtectedRoute>
        } />
        <Route path="/freelancer/contracts" element={
          <ProtectedRoute allowedRole="freelancer"><FreelancerLayout><MyContracts /></FreelancerLayout></ProtectedRoute>
        } />
        <Route path="/freelancer/messages" element={
          <ProtectedRoute allowedRole="freelancer"><FreelancerLayout><Messages /></FreelancerLayout></ProtectedRoute>
        } />
        <Route path="/freelancer/reviews" element={
          <ProtectedRoute allowedRole="freelancer"><FreelancerLayout><Reviews /></FreelancerLayout></ProtectedRoute>
        } />

        {/* Client Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute allowedRole="client"><DashboardLayout><ClientDashboard /></DashboardLayout></ProtectedRoute>
        } />
        <Route path="/contracts" element={
          <ProtectedRoute allowedRole="client"><DashboardLayout><Contracts /></DashboardLayout></ProtectedRoute>
        } />
        <Route path="/view-proposals/:projectId" element={
          <ProtectedRoute allowedRole="client"><DashboardLayout><ViewProposals /></DashboardLayout></ProtectedRoute>
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
      <ProposalProvider>
        <AppRoutes />
      </ProposalProvider>
    </AuthProvider>
  );
}