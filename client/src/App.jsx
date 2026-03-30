import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './features/hooks/useAuth';
import Layout from "./layout/PageContainer";
import "./assets/theme.css";

// --- PROFILE & PROPOSAL PAGES ---
import FreelancerProfile from "./pages/FreelancerProfile";
import ClientProfile from "./pages/ClientProfile";
import FreelancerView from "./pages/FreelancerView";
import ClientView from "./pages/ClientView";
import SubmitProposal from "./pages/SubmitProposal";
import PostProject from "./pages/PostProject";
import ProjectFeed from "./pages/ProjectFeed";
import FindProjects from './pages/FindProjects';

// --- AUTH & TEAM PAGES ---
import RoleSelection from './pages/RoleSelection';
import Login from './pages/Login';
import SignupFreelancer from './pages/SignupFreelancer';
import SignupClient from './pages/SignupClient';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import OAuthCallback from './pages/OAuthCallback';
import Dashboard from './pages/Dashboard';
import Messages from './pages/Messages';

// --- CONTRACTS & REVIEWS ---
import ContractsClient from './pages/ContractsClient';
import ContractsFreelancer from './pages/ContractsFreelancer';
import ReviewPage from './pages/ReviewPage';

/**
 * ProtectedRoute: Redirects unauthenticated users to /login.
 */
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? children : <Navigate to="/login" replace />;
};

const PublicOnlyRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return children;
  if (user.role === 'freelancer') return <Navigate to="/freelancer/dashboard" replace />;
  if (user.role === 'client') return <Navigate to="/client/dashboard" replace />;
  return <Navigate to="/dashboard" replace />;
};

const ContractsRoute = () => {
  const { user } = useAuth();
  return user?.role === 'client' ? <ContractsClient /> : <ContractsFreelancer />;
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
        <Route path="/auth/callback" element={<OAuthCallback />} />

        {/* ── Protected routes — require login ──────────────────────── */}
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/freelancer/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/client/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          
          <Route path="/reviews" element={<ProtectedRoute><ReviewPage /></ProtectedRoute>} />

          {/* Marketplace Core */}
          <Route path="/projects" element={<ProtectedRoute><ProjectFeed /></ProtectedRoute>} />
          <Route path="/post-project" element={<ProtectedRoute><PostProject /></ProtectedRoute>} />
          <Route path="/find-projects" element={<ProtectedRoute><FindProjects /></ProtectedRoute>} />

          {/* Profile pages */}
          <Route path="/profile/freelancer" element={<ProtectedRoute><FreelancerView /></ProtectedRoute>} />
          <Route path="/profile/freelancer/edit" element={<ProtectedRoute><FreelancerProfile /></ProtectedRoute>} />
          <Route path="/profile/client" element={<ProtectedRoute><ClientView /></ProtectedRoute>} />
          <Route path="/profile/client/edit" element={<ProtectedRoute><ClientProfile /></ProtectedRoute>} />

          {/* Proposals & Contracts */}
          <Route path="/projects/:projectId/apply" element={<ProtectedRoute><SubmitProposal /></ProtectedRoute>} />
          <Route path="/contracts" element={<ProtectedRoute><ContractsRoute /></ProtectedRoute>} />

          {/* Messages */}
          <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
        </Route>
        
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}