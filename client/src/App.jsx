import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './features/hooks/useAuth';
import Layout from "./components/Layout";
import "./assets/theme.css";

// Profile & Proposal Pages (Your Code)
import FreelancerProfile from "./pages/FreelancerProfile";
import ClientProfile from "./pages/ClientProfile";
import FreelancerView from "./pages/FreelancerView";
import ClientView from "./pages/ClientView";
import SubmitProposal from "./pages/SubmitProposal";
import FreelancerContracts from "./pages/FreelancerContracts";
import PostProject from "./pages/PostProject";
import ProjectFeed from "./pages/ProjectFeed";

// Auth pages (Teammate's Code)
import RoleSelection from './pages/RoleSelection';
import Login from './pages/Login';
import SignupFreelancer from './pages/SignupFreelancer';
import SignupClient from './pages/SignupClient';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Messages from './pages/Messages';
import PageContainer from './layout/PageContainer';


/**
 * ProtectedRoute
 * Redirects unauthenticated users to /login.
 */
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? children : <Navigate to="/login" replace />;
};


/**
 * PublicOnlyRoute
 * Redirects already-authenticated users away from auth pages.
 */
const PublicOnlyRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return children;

  if (user.role === 'freelancer') return <Navigate to="/freelancer/dashboard" replace />;
  if (user.role === 'client') return <Navigate to="/client/dashboard" replace />;
  return <Navigate to="/dashboard" replace />;
};

export default function App() {
  return (
    <Router>
      <Routes>
        {/* ── Public auth flow ───────────────────────────────────────── */}
        <Route path="/" element={<PublicOnlyRoute><RoleSelection /></PublicOnlyRoute>} />
        <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
        <Route path="/signup/freelancer" element={<PublicOnlyRoute><SignupFreelancer /></PublicOnlyRoute>} />
        <Route path="/signup/client" element={<PublicOnlyRoute><SignupClient /></PublicOnlyRoute>} />
        <Route path="/forgot-password" element={<PublicOnlyRoute><ForgotPassword /></PublicOnlyRoute>} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* ── Protected routes — require login ──────────────────────── */}
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/freelancer/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/client/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

          {/* Profile Pages */}
          <Route path="/profile/freelancer" element={<ProtectedRoute><FreelancerView /></ProtectedRoute>} />
          <Route path="/profile/freelancer/edit" element={<ProtectedRoute><FreelancerProfile /></ProtectedRoute>} />
          <Route path="/profile/client" element={<ProtectedRoute><ClientView /></ProtectedRoute>} />
          <Route path="/profile/client/edit" element={<ProtectedRoute><ClientProfile /></ProtectedRoute>} />

          {/* Marketplace & Proposal Pages */}
          <Route path="/projects" element={<ProtectedRoute><ProjectFeed /></ProtectedRoute>} />
          <Route path="/post-project" element={<ProtectedRoute><PostProject /></ProtectedRoute>} />
          <Route path="/projects/:projectId/apply" element={<ProtectedRoute><SubmitProposal /></ProtectedRoute>} />
          <Route path="/contracts" element={<ProtectedRoute><FreelancerContracts /></ProtectedRoute>} />

          {/* Messages */}
          <Route path="/messages" element={
            <ProtectedRoute>
              <PageContainer><Messages /></PageContainer>
            </ProtectedRoute>
          } />
        </Route>
      </Routes>
    </Router>
  );
}