import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './features/hooks/useAuth';
import Layout from "./layout/PageContainer";
import "./assets/theme.css";

// --- PROFILE & PROPOSAL PAGES ---
import FreelancerProfile from "./pages/FreelancerProfile";
import ClientProfile     from "./pages/ClientProfile";
import FreelancerView    from "./pages/FreelancerView";
import ClientView        from "./pages/ClientView";
import SubmitProposal    from "./pages/SubmitProposal";
import FindProjects      from './pages/FindProjects'; 

// --- AUTH & DASHBOARD PAGES ---
import RoleSelection    from './pages/RoleSelection';
import Login            from './pages/Login';
import SignupFreelancer from './pages/SignupFreelancer';
import SignupClient     from './pages/SignupClient';
import ForgotPassword   from './pages/ForgotPassword';
import ResetPassword    from './pages/ResetPassword';
import OAuthCallback    from './pages/OAuthCallback';
import Dashboard        from './pages/Dashboard';
import Messages         from './pages/Messages';

// --- CONTRACTS ---
import ContractsClient     from './pages/ContractsClient';
import ContractsFreelancer from './pages/ContractsFreelancer';

/**
 * ProtectedRoute: Redirects unauthenticated users to /login.
 */
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? children : <Navigate to="/login" replace />;
};

/**
 * PublicOnlyRoute: Redirects already-authenticated users away from auth pages.
 */
const PublicOnlyRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return children;
  if (user.role === 'freelancer') return <Navigate to="/freelancer/dashboard" replace />;
  if (user.role === 'client')     return <Navigate to="/client/dashboard" replace />;
  return <Navigate to="/dashboard" replace />;
};

/**
 * ContractsRoute: Determines which contract view to show based on role.
 */
const ContractsRoute = () => {
  const { user } = useAuth();
  return user?.role === 'client' ? <ContractsClient /> : <ContractsFreelancer />;
};

export default function App() {
  return (
    <Router>
      <Routes>
        {/* ── Public auth flow ───────────────────────────────────────── */}
        <Route path="/"                      element={<PublicOnlyRoute><RoleSelection /></PublicOnlyRoute>} />
        <Route path="/login"                 element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
        <Route path="/signup/freelancer"     element={<PublicOnlyRoute><SignupFreelancer /></PublicOnlyRoute>} />
        <Route path="/signup/client"         element={<PublicOnlyRoute><SignupClient /></PublicOnlyRoute>} />
        <Route path="/forgot-password"       element={<PublicOnlyRoute><ForgotPassword /></PublicOnlyRoute>} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* ── OAuth callback — public ───────────────────────────────── */}
        <Route path="/auth/callback" element={<OAuthCallback />} />

        {/* ── Protected routes — require login ──────────────────────── */}
        <Route element={<Layout />}>
          <Route path="/dashboard"            element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/freelancer/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/client/dashboard"     element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

          {/* Feature & Profile Pages */}
          <Route path="/find-projects"           element={<ProtectedRoute><FindProjects /></ProtectedRoute>} />
          <Route path="/profile/freelancer"      element={<ProtectedRoute><FreelancerView /></ProtectedRoute>} />
          <Route path="/profile/freelancer/edit" element={<ProtectedRoute><FreelancerProfile /></ProtectedRoute>} />
          <Route path="/profile/client"          element={<ProtectedRoute><ClientView /></ProtectedRoute>} />
          <Route path="/profile/client/edit"     element={<ProtectedRoute><ClientProfile /></ProtectedRoute>} />

          <Route path="/projects/:projectId/apply" element={<ProtectedRoute><SubmitProposal /></ProtectedRoute>} />

          {/* Messages & Contracts */}
          <Route path="/messages"  element={<ProtectedRoute><Messages /></ProtectedRoute>} />
          <Route path="/contracts" element={<ProtectedRoute><ContractsRoute /></ProtectedRoute>} />
        </Route>
      </Routes>
    </Router>
  );
}