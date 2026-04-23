import React from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import { LogOut, Sun, Moon } from "lucide-react";
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

function ClientTopbar({ onMenuClick }) {
  const { user, logout }        = useContext(AuthContext);
  const { isDark, toggleTheme } = useTheme();
  const location                = useLocation();
  const navigate                = useNavigate();

  const label = Object.entries(routeLabels).find(([path]) =>
    location.pathname === path || location.pathname.startsWith(path + "/")
  )?.[1] || "Dashboard";

  return (
    <div className="th-topbar" style={{
      borderBottom:   "1px solid var(--border)",
      padding:        "0 16px",
      height:         56,
      display:        "flex",
      justifyContent: "space-between",
      alignItems:     "center",
      position:       "sticky",
      top:            0,
      zIndex:         100,
      boxShadow:      "0 1px 3px rgba(0,0,0,0.05)",
    }}>
      <div style={{ display:"flex", alignItems:"center", gap:10, minWidth:0, flexShrink:0 }}>
        <button onClick={onMenuClick} className="cl-hamburger"
          style={{ display:"none", background:"none", border:"none", cursor:"pointer", padding:4 }}
          aria-label="Open menu">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
        <div style={{ width:8, height:8, borderRadius:"50%", background:"linear-gradient(135deg,#1e3a5f,#2563eb)" }} />
        <span style={{ fontWeight:700, fontSize:15, color:"var(--text-primary)" }}>{label}</span>
      </div>

      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        {/* ── Dark / Light toggle ── */}
        <button
          onClick={toggleTheme}
          title={isDark ? "Switch to light mode" : "Switch to dark mode"}
          style={{
            display:"flex", alignItems:"center", justifyContent:"center",
            width:34, height:34, borderRadius:8,
            border:"1px solid var(--border)",
            backgroundColor:"var(--input-bg)",
            cursor:"pointer",
            color:"var(--text-muted)",
            flexShrink:0,
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor="#2563eb"; e.currentTarget.style.color="#2563eb"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor="var(--border)"; e.currentTarget.style.color="var(--text-muted)"; }}>
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        <NotificationBell theme="blue" />

        {/* User pill */}
        <div className="th-input-bg" style={{ display:"flex", alignItems:"center", gap:10, padding:"6px 14px", borderRadius:20, border:"1px solid var(--border)" }}>
          <div style={{ width:32, height:32, borderRadius:"50%", background:"linear-gradient(135deg,#1e3a5f,#2563eb)", display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontWeight:700, fontSize:13, boxShadow:"0 2px 8px rgba(37,99,235,0.2)", flexShrink:0 }}>
            {(user?.name || "C").charAt(0).toUpperCase()}
          </div>
          <div className="cl-name-hide" style={{ lineHeight:1.3 }}>
            <div style={{ fontWeight:600, fontSize:13, color:"var(--text-primary)" }}>{user?.name || "Client"}</div>
            <div style={{ fontSize:11, color:"var(--text-muted)" }}>Client</div>
          </div>
        </div>

        <button
          onClick={() => { logout(); navigate("/"); }}
          style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 16px", border:"1px solid var(--border)", borderRadius:8, cursor:"pointer", fontSize:13, color:"var(--text-muted)", backgroundColor:"var(--topbar-bg)", fontFamily:"inherit", fontWeight:500, flexShrink:0 }}
          onMouseEnter={e => { e.currentTarget.style.borderColor="#2563eb"; e.currentTarget.style.color="#2563eb"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor="var(--border)"; e.currentTarget.style.color="var(--text-muted)"; }}>
          <LogOut size={15} />
          <span className="cl-logout-text">Logout</span>
        </button>
      </div>
    </div>
  );
}

function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  return (
    <div style={{ display:"flex" }}>
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)}
          className="cl-sidebar-overlay"
          style={{ position:"fixed", inset:0, backgroundColor:"rgba(0,0,0,0.4)", zIndex:199 }} />
      )}
      <div className={`client-sidebar-wrap${sidebarOpen ? " sidebar-open" : ""}`}>
        <Sidebar />
      </div>
      <main
        className="cl-main-content"
        style={{ flex:1, marginLeft:"var(--cl-sidebar-margin,250px)", minHeight:"100vh", backgroundColor:"var(--page-bg)", minWidth:0, overflowX:"hidden" }}>
        <ClientTopbar onMenuClick={() => setSidebarOpen(v => !v)} />
        {children}
        <style>{`
          @media (max-width: 480px) {
            .cl-topbar-right { gap: 6px !important; }
            :root { --cl-sidebar-margin: 0px; }
            .client-sidebar-wrap { position:fixed; left:0; top:0; z-index:200; transform:translateX(-100%); transition:transform 0.25s ease; height:100vh; }
            .client-sidebar-wrap.sidebar-open { transform:translateX(0); }
            .cl-hamburger { display:flex !important; }
            .cl-name-hide { display:none !important; }
            .cl-logout-text { display:none !important; }
          }
          @media (min-width: 768px) {
            :root { --cl-sidebar-margin: 250px; }
            .client-sidebar-wrap { position:fixed; left:0; top:0; z-index:200; transform:none; height:100vh; }
          }
        `}</style>
      </main>
    </div>
  );
}

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

      <AiChatWrapper />
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <NotificationProvider>
            <AppRoutes />
            <Toast />
          </NotificationProvider>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}