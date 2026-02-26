import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './features/hooks/useAuth';

// Profile pages (other module — do not touch)
import FreelancerProfile from './pages/FreelancerProfile';
import ClientProfile     from './pages/ClientProfile';

// Auth pages
import RoleSelection    from './pages/RoleSelection';
import Login            from './pages/Login';
import SignupFreelancer from './pages/SignupFreelancer';
import SignupClient     from './pages/SignupClient';
import ForgotPassword   from './pages/ForgotPassword';
import ResetPassword    from './pages/ResetPassword';
import Dashboard        from './pages/Dashboard';
import Messages         from './pages/Messages';
import PageContainer    from './layout/PageContainer';


/**
 * ProtectedRoute
 *
 * Redirects unauthenticated users to /login.
 * Previously there was no route guard at all — any visitor could hit /messages
 * or /dashboard and get a broken blank page instead of a clean redirect.
 *
 * `loading` check prevents a flash-redirect while AuthContext rehydrates the
 * session from localStorage on first paint.
 */
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // While the auth context is rehydrating from localStorage, render nothing
  // rather than redirecting — avoids a false logout flash on hard refresh.
  if (loading) return null;

  return user ? children : <Navigate to="/login" replace />;
};


/**
 * PublicOnlyRoute
 *
 * Mirror of ProtectedRoute — redirects already-authenticated users away from
 * auth pages (login, signup, role selection) to their correct dashboard.
 *
 * Without this guard a logged-in user could:
 *   1. Navigate to / or /signup/* and register a second account.
 *   2. Hit the browser back button from the dashboard and land on /login,
 *      silently replacing their token by logging in as someone else.
 *
 * /reset-password/:token is intentionally excluded — a logged-in user may
 * have a valid reset link in their email they still need to use.
 */
const PublicOnlyRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return children;

  // Redirect to the role-appropriate dashboard so the user lands somewhere
  // meaningful rather than a generic root that would loop back here.
  if (user.role === 'freelancer') return <Navigate to="/freelancer/dashboard" replace />;
  if (user.role === 'client')     return <Navigate to="/client/dashboard" replace />;
  return <Navigate to="/dashboard" replace />;
};


function App() {
  return (
    <Router>
      <Routes>
        {/* ── Public auth flow ───────────────────────────────────────── */}
        {/* All wrapped in PublicOnlyRoute so authenticated users cannot  */}
        {/* accidentally create duplicate accounts or silently re-login.  */}
        <Route path="/"                      element={<PublicOnlyRoute><RoleSelection /></PublicOnlyRoute>} />
        <Route path="/login"                 element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
        <Route path="/signup/freelancer"     element={<PublicOnlyRoute><SignupFreelancer /></PublicOnlyRoute>} />
        <Route path="/signup/client"         element={<PublicOnlyRoute><SignupClient /></PublicOnlyRoute>} />
        <Route path="/forgot-password"       element={<PublicOnlyRoute><ForgotPassword /></PublicOnlyRoute>} />

        {/* /reset-password is intentionally NOT wrapped — a logged-in user  */}
        {/* may still have a valid reset link in their email to consume.      */}
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* ── Protected routes — require login ──────────────────────── */}
        <Route path="/dashboard" element={
          <ProtectedRoute><Dashboard /></ProtectedRoute>
        } />
        <Route path="/profile/freelancer" element={
          <ProtectedRoute><FreelancerProfile /></ProtectedRoute>
        } />
        <Route path="/profile/client" element={
          <ProtectedRoute><ClientProfile /></ProtectedRoute>
        } />
        <Route path="/messages" element={
          <ProtectedRoute>
            <PageContainer><Messages /></PageContainer>
          </ProtectedRoute>
        } />

        {/* ── TEMPORARY: Role-specific dashboard aliases (replace on merge) ── */}
        <Route path="/freelancer/dashboard" element={
          <ProtectedRoute><Dashboard /></ProtectedRoute>
        } />
        <Route path="/client/dashboard" element={
          <ProtectedRoute><Dashboard /></ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;
