import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './features/hooks/useAuth';
import Layout from './layout/PageContainer';
import './assets/theme.css';

// ── Auth ──────────────────────────────────────────────────────────────────────
import RoleSelection    from './pages/RoleSelection';
import Login            from './pages/Login';
import SignupFreelancer from './pages/SignupFreelancer';
import SignupClient     from './pages/SignupClient';
import ForgotPassword   from './pages/ForgotPassword';
import ResetPassword    from './pages/ResetPassword';
import OAuthCallback    from './pages/OAuthCallback';

// ── Dashboards ────────────────────────────────────────────────────────────────
import FreelancerDashboard from './pages/FreelancerDashboard';
import Dashboard           from './pages/Dashboard';

// ── Projects ──────────────────────────────────────────────────────────────────
import FindProjects   from './pages/FindProjects';
import BrowseProjects from './pages/BrowseProjects';
import ClientProjects from './pages/ClientProjects';
import PostProject    from './pages/PostProject';
import ProjectDetail  from './pages/ProjectDetail';

// ── Contracts ─────────────────────────────────────────────────────────────────
import ContractsFreelancer from './pages/ContractsFreelancer';
import ContractsClient     from './pages/ContractsClient';
import FreelancerContracts from './pages/FreelancerContracts';

// ── Messages ──────────────────────────────────────────────────────────────────
import Messages from './pages/Messages';

// ── Profiles ──────────────────────────────────────────────────────────────────
import FreelancerProfile from './pages/FreelancerProfile';
import FreelancerView    from './pages/FreelancerView';
import ClientProfile     from './pages/ClientProfile';
import ClientView        from './pages/ClientView';
import Profile           from './pages/Profile';

// ── Proposals ─────────────────────────────────────────────────────────────────
import SubmitProposal from './pages/SubmitProposal';

// ── Reviews ───────────────────────────────────────────────────────────────────
import ReviewPage from './pages/ReviewPage';
import ContractSummary from './pages/ContractSummary';

// ── Route guards ──────────────────────────────────────────────────────────────
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? children : <Navigate to="/login" replace />;
};

const PublicOnlyRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return children;
  return user.role === 'client'
    ? <Navigate to="/client/dashboard" replace />
    : <Navigate to="/freelancer/dashboard" replace />;
};

// Splits /contracts by role at render time so the URL stays clean
const ContractsRoute = () => {
  const { user } = useAuth();
  return user?.role === 'client' ? <ContractsClient /> : <ContractsFreelancer />;
};


// ── App ───────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <Router>
      <Routes>

        {/* ── Public auth flow ──────────────────────────────────────── */}
        <Route path="/"                      element={<PublicOnlyRoute><RoleSelection /></PublicOnlyRoute>} />
        <Route path="/login"                 element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
        <Route path="/signup/freelancer"     element={<PublicOnlyRoute><SignupFreelancer /></PublicOnlyRoute>} />
        <Route path="/signup/client"         element={<PublicOnlyRoute><SignupClient /></PublicOnlyRoute>} />
        <Route path="/forgot-password"       element={<PublicOnlyRoute><ForgotPassword /></PublicOnlyRoute>} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/auth/callback"         element={<OAuthCallback />} />

        {/* ── Protected — inside the shared sidebar layout ──────────── */}
        <Route element={<Layout />}>


          {/* Dashboards */}
          <Route path="/freelancer/dashboard" element={<ProtectedRoute><FreelancerDashboard /></ProtectedRoute>} />
          <Route path="/client/dashboard"     element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/dashboard"            element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

          {/* Projects */}
          <Route path="/find-projects"   element={<ProtectedRoute><FindProjects /></ProtectedRoute>} />
          <Route path="/browse-projects" element={<ProtectedRoute><BrowseProjects /></ProtectedRoute>} />
          <Route path="/jobs"            element={<ProtectedRoute><FindProjects /></ProtectedRoute>} />
          <Route path="/my-projects"           element={<ProtectedRoute><ClientProjects /></ProtectedRoute>} />
          <Route path="/my-projects/new"       element={<ProtectedRoute><PostProject /></ProtectedRoute>} />
          <Route path="/my-projects/:id"       element={<ProtectedRoute><ProjectDetail /></ProtectedRoute>} />

          {/* Contracts */}
          <Route path="/contracts"             element={<ProtectedRoute><ContractsRoute /></ProtectedRoute>} />
          <Route path="/contracts/freelancer"  element={<ProtectedRoute><FreelancerContracts /></ProtectedRoute>} />
          <Route path="/contracts/:contractId/summary" element={<ProtectedRoute><ContractSummary /></ProtectedRoute>} />

          {/* Messages */}
          <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />

          {/* Profiles */}
          <Route path="/profile"                 element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/profile/freelancer"      element={<ProtectedRoute><FreelancerView /></ProtectedRoute>} />
          <Route path="/profile/freelancer/edit" element={<ProtectedRoute><FreelancerProfile /></ProtectedRoute>} />
          <Route path="/profile/client"          element={<ProtectedRoute><ClientView /></ProtectedRoute>} />
          <Route path="/profile/client/edit"     element={<ProtectedRoute><ClientProfile /></ProtectedRoute>} />

          {/* Proposals */}
          <Route path="/projects/:projectId/apply" element={<ProtectedRoute><SubmitProposal /></ProtectedRoute>} />

          {/* Reviews */}
          <Route path="/reviews" element={<ProtectedRoute><ReviewPage /></ProtectedRoute>} />

        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}