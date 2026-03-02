import { BrowserRouter, Routes, Route, Navigate, useContext } from "react-router-dom";
import { AuthProvider, AuthContext } from "./context/AuthContext";

import SubmitProposal   from "./pages/proposal/SubmitProposal";
import ViewProposals    from "./pages/proposal/ViewProposals";
import ProposalTracking from "./pages/proposal/ProposalTracking";

import "./App.css";

// Guards a route — redirects to "/" if not logged in or wrong role
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
        {/* Freelancer */}
        <Route path="/submit-proposal/:projectId" element={
          <ProtectedRoute allowedRole="freelancer"><SubmitProposal /></ProtectedRoute>
        } />
        <Route path="/proposal-tracking" element={
          <ProtectedRoute allowedRole="freelancer"><ProposalTracking /></ProtectedRoute>
        } />

        {/* Client */}
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
