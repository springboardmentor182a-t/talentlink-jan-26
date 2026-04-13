import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";
import { LogOut } from "lucide-react";
import Toast from "./components/Toast";
import NotificationBell from "./components/NotificationBell";
import AiChat from "./components/AiChat";

// Auth
import ChooseRole       from "./pages/auth/ChooseRole";
import ClientLogin      from "./pages/auth/ClientLogin";
import ClientSignup     from "./pages/auth/ClientSignup";
import FreelancerLogin  from "./pages/auth/FreelancerLogin";
import FreelancerSignup from "./pages/auth/FreelancerSignup";
import ForgotPassword   from "./pages/auth/ForgotPassword";
import OAuthCallback    from "./pages/auth/OAuthCallback";
import ResetPassword    from "./pages/auth/ResetPassword";

// Proposals
import SubmitProposal   from "./pages/proposal/SubmitProposal";
import ViewProposals    from "./pages/proposal/ViewProposals";

// Projects
import Projects         from "./pages/Projects";
import PostProject      from "./pages/PostProject";

// Freelancer
import FreelancerDashboard from "./pages/freelancer/Freelancerdasboard";

// Client
import Sidebar          from "./layout/Sidebar";
import ClientDashboard  from "./pages/ClientDashboard";
import Contracts        from "./pages/Contracts";
import Messages         from "./pages/messages/Messages";
import Profile          from "./pages/Profile/profile";
import Reviews          from "./pages/Reviews/Reviews";

import "./App.css";

const routeLabels = {
  "/dashboard":      "Dashboard",
  "/profile":        "Profile",
  "/post-project":   "Post Project",
  "/projects":       "Project Management",
  "/contracts":      "Contract Management",
  "/messages":       "Messages",
  "/reviews":        "Reviews",
  "/view-proposals": "View Proposals",
};

function ProtectedRoute({ children, allowedRole }) {
  const { user, role, loading } = useContext(AuthContext);
  if (loading) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:"100vh" }}>
      Loading...
    </div>
  );
  if (!user) return <Navigate to="/" replace />;
  if (allowedRole && role !== allowedRole) return <Navigate to="/" replace />;
  return children;
}

function ClientTopbar() {
  const { user, logout } = useContext(AuthContext);
  const location         = useLocation();
  const navigate         = useNavigate();

  const label = Object.entries(routeLabels).find(([path]) =>
    location.pathname === path || location.pathname.startsWith(path + "/")
  )?.[1] || "Dashboard";

  return (
    <div style={{
      backgroundColor: "#fff",
      borderBottom:    "1px solid #e2e8f0",
      padding:         "0 32px",
      height:          64,
      display:         "flex",
      justifyContent:  "space-between",
      alignItems:      "center",
      position:        "sticky",
      top:             0,
      zIndex:          100,
      boxShadow:       "0 1px 3px rgba(0,0,0,0.05)",
    }}>
      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
        <div style={{ width:8, height:8, borderRadius:"50%", background:"linear-gradient(135deg,#1e3a5f,#2563eb)" }} />
        <span style={{ fontWeight:700, fontSize:15, color:"#111827" }}>{label}</span>
      </div>

      <div style={{ display:"flex", alignItems:"center", gap:12 }}>
        <NotificationBell theme="blue" />
        <div style={{ display:"flex", alignItems:"center", gap:10, backgroundColor:"#f8fafc", padding:"6px 14px", borderRadius:20, border:"1px solid #e2e8f0" }}>
          <div style={{ width:32, height:32, borderRadius:"50%", background:"linear-gradient(135deg,#1e3a5f,#2563eb)", display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontWeight:700, fontSize:13, boxShadow:"0 2px 8px rgba(37,99,235,0.2)", flexShrink:0 }}>
            {(user?.name || "C").charAt(0).toUpperCase()}
          </div>
          <div style={{ lineHeight:1.3 }}>
            <div style={{ fontWeight:600, fontSize:13, color:"#111827" }}>{user?.name || "Client"}</div>
            <div style={{ fontSize:11, color:"#64748b" }}>Client</div>
          </div>
        </div>
        <button
          onClick={() => { logout(); navigate("/"); }}
          style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 16px", border:"1px solid #e2e8f0", borderRadius:8, cursor:"pointer", fontSize:13, color:"#64748b", background:"white", fontFamily:"inherit", fontWeight:500, transition:"all 0.15s" }}
          onMouseEnter={e => { e.currentTarget.style.borderColor="#2563eb"; e.currentTarget.style.color="#2563eb"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor="#e2e8f0"; e.currentTarget.style.color="#64748b"; }}>
          <LogOut size={15} />
          Logout
        </button>
      </div>
    </div>
  );
}

function DashboardLayout({ children }) {
  return (
    <div style={{ display:"flex" }}>
      <Sidebar />
      <main style={{ flex:1, marginLeft:250, minHeight:"100vh", backgroundColor:"#f8fafc" }}>
        <ClientTopbar />
        {children}
      </main>
    </div>
  );
}

// Only show AiChat when user is logged in
function AiChatWrapper() {
  const { user } = useContext(AuthContext);
  if (!user) return null;
  return <AiChat />;
}

function AppRoutes() {
  return (
    <>
      <Routes>
        {/* Auth */}
        <Route path="/"                  element={<ChooseRole />} />
        <Route path="/client/login"      element={<ClientLogin />} />
        <Route path="/client/signup"     element={<ClientSignup />} />
        <Route path="/freelancer/login"  element={<FreelancerLogin />} />
        <Route path="/freelancer/signup" element={<FreelancerSignup />} />
        <Route path="/forgot-password"   element={<ForgotPassword />} />
        <Route path="/reset-password"    element={<ResetPassword />} />
        <Route path="/oauth/callback"    element={<OAuthCallback />} />

        {/* Freelancer */}
        <Route path="/freelancer/dashboard" element={
          <ProtectedRoute allowedRole="freelancer"><FreelancerDashboard /></ProtectedRoute>
        } />
        <Route path="/submit-proposal/:projectId" element={
          <ProtectedRoute allowedRole="freelancer"><SubmitProposal /></ProtectedRoute>
        } />
        <Route path="/proposal-tracking" element={
          <ProtectedRoute allowedRole="freelancer"><FreelancerDashboard defaultPage="proposals" /></ProtectedRoute>
        } />
        <Route path="/freelancer/browse" element={
          <ProtectedRoute allowedRole="freelancer"><FreelancerDashboard defaultPage="browse" /></ProtectedRoute>
        } />
        <Route path="/freelancer/messages" element={
          <ProtectedRoute allowedRole="freelancer"><FreelancerDashboard defaultPage="messages" /></ProtectedRoute>
        } />

        {/* Client */}
        <Route path="/client/dashboard" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={
          <ProtectedRoute allowedRole="client">
            <DashboardLayout><ClientDashboard /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute allowedRole="client">
            <DashboardLayout><Profile /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/post-project" element={
          <ProtectedRoute allowedRole="client">
            <DashboardLayout><PostProject /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/projects" element={
          <ProtectedRoute allowedRole="client">
            <DashboardLayout><Projects /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/contracts" element={
          <ProtectedRoute allowedRole="client">
            <DashboardLayout><Contracts /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/messages" element={
          <ProtectedRoute allowedRole="client">
            <DashboardLayout><Messages /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/reviews" element={
          <ProtectedRoute allowedRole="client">
            <DashboardLayout><Reviews /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/view-proposals/:projectId" element={
          <ProtectedRoute allowedRole="client">
            <DashboardLayout><ViewProposals /></DashboardLayout>
          </ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* AiChat floats over every page, only when logged in */}
      <AiChatWrapper />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        {/* NotificationProvider is now INSIDE BrowserRouter so useLocation() works */}
        <NotificationProvider>
          <AppRoutes />
          <Toast />
        </NotificationProvider>
      </BrowserRouter>
    </AuthProvider>
  );
}