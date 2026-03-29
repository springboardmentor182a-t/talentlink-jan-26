import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './features/hooks/useAuth';
import Layout from "./layout/PageContainer";
import "./assets/theme.css";

// Pages
import RoleSelection     from './pages/RoleSelection';
import Login             from './pages/Login';
import SignupFreelancer  from './pages/SignupFreelancer';
import SignupClient      from './pages/SignupClient';
import Dashboard         from './pages/Dashboard';
import FindProjects      from './pages/FindProjects';
import Messages          from './pages/Messages';
import ContractsFreelancer from './pages/ContractsFreelancer';
import ReviewPage         from './pages/ReviewPage'; 

// Auth Guards
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? children : <Navigate to="/login" replace />;
};

const PublicOnlyRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return !user ? children : <Navigate to="/dashboard" replace />;
};

export default function App() {
  return (
    <Router>
      <Routes>
        {/* ── 🔓 Public Routes ── */}
        <Route path="/" element={<PublicOnlyRoute><RoleSelection /></PublicOnlyRoute>} />
        <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
        <Route path="/signup/freelancer" element={<SignupFreelancer />} />
        <Route path="/signup/client" element={<SignupClient />} />
        
        {/* ── 🏢 Main App (With Sidebar/Header Layout) ── */}
        <Route element={<Layout />}>
          {/* ✅ FIXED: Protected and inside Layout so Sidebar appears */}
          <Route path="/reviews" element={<ProtectedRoute><ReviewPage /></ProtectedRoute>} />
          
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/find-projects" element={<ProtectedRoute><FindProjects /></ProtectedRoute>} />
          <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
          <Route path="/contracts" element={<ProtectedRoute><ContractsFreelancer /></ProtectedRoute>} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}