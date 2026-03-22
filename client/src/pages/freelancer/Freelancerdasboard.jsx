import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import BrowseProjects from "./BrowseProjects";
import ProposalTracking from "../proposal/ProposalTracking";

const DashboardIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
  </svg>
);
const ProfileIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);
const BrowseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/>
    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
const ProposalIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
  </svg>
);
const ContractIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
  </svg>
);
const MessageIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);
const ReviewIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);
const LogoutIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);

export default function FreelancerDashboard({ defaultPage = "browse" }) {
  const { user, logout } = useContext(AuthContext);
  const navigate         = useNavigate();
  const [activePage, setActivePage] = useState(defaultPage);

  const handleLogout = () => { logout(); navigate("/"); };

  const navItems = [
    { key:"dashboard", label:"Dashboard",      icon:<DashboardIcon /> },
    { key:"profile",   label:"Profile",         icon:<ProfileIcon />   },
    { key:"browse",    label:"Browse Projects", icon:<BrowseIcon />    },
    { key:"proposals", label:"My Proposals",    icon:<ProposalIcon />  },
    { key:"contracts", label:"Contracts",       icon:<ContractIcon />  },
    { key:"messages",  label:"Messages",        icon:<MessageIcon />,  badge:3 },
    { key:"reviews",   label:"Reviews",         icon:<ReviewIcon />    },
  ];

  const renderPage = () => {
    if (activePage === "browse")    return <BrowseProjects />;
    if (activePage === "proposals") return <ProposalTracking />;
    return (
      <div style={{ padding:32 }}>
        <div style={{ background:"linear-gradient(135deg,#2d1b69 0%,#7c3aed 50%,#a855f7 100%)", borderRadius:16, padding:"32px", marginBottom:24, position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute", top:-30, right:-30, width:120, height:120, borderRadius:"50%", background:"rgba(255,255,255,0.05)" }} />
          <h2 style={{ fontSize:24, fontWeight:800, color:"white", margin:"0 0 6px", letterSpacing:"-0.5px" }}>
            {navItems.find(n => n.key === activePage)?.label}
          </h2>
          <p style={{ color:"rgba(255,255,255,0.75)", fontSize:14, margin:0 }}>This section is coming soon.</p>
        </div>
      </div>
    );
  };

  return (
    <div style={{ display:"flex", minHeight:"100vh", fontFamily:"'Segoe UI',sans-serif" }}>

      {/* Sidebar */}
      <aside style={{ width:250, minHeight:"100vh", position:"fixed", left:0, top:0, backgroundColor:"#fff", borderRight:"1px solid #e5e7eb", display:"flex", flexDirection:"column" }}>

        {/* Logo */}
        <div style={{ padding:"20px", borderBottom:"1px solid #e5e7eb", display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:36, height:36, background:"linear-gradient(135deg,#7c3aed,#a855f7)", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", boxShadow:"0 4px 12px rgba(124,58,237,0.3)" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
          </div>
          <span style={{ fontWeight:700, fontSize:18, color:"#7c3aed" }}>TalentLink</span>
        </div>

        {/* Nav */}
        <nav style={{ flex:1, padding:"16px 12px" }}>
          {navItems.map(item => (
            <button key={item.key} onClick={() => setActivePage(item.key)}
              style={{
                width:"100%", display:"flex", alignItems:"center", gap:12,
                padding:"11px 14px", borderRadius:8, border:"none", cursor:"pointer",
                fontFamily:"inherit", fontSize:14,
                fontWeight: activePage === item.key ? 600 : 400,
                backgroundColor: activePage === item.key ? "#f5f3ff" : "transparent",
                color: activePage === item.key ? "#7c3aed" : "#6b7280",
                marginBottom:4, textAlign:"left",
                borderLeft: activePage === item.key ? "3px solid #7c3aed" : "3px solid transparent",
                transition:"all 0.15s"
              }}
              onMouseEnter={e => { if (activePage !== item.key) e.currentTarget.style.backgroundColor="#faf5ff"; }}
              onMouseLeave={e => { if (activePage !== item.key) e.currentTarget.style.backgroundColor="transparent"; }}>
              {item.icon}
              <span style={{ flex:1 }}>{item.label}</span>
              {item.badge && (
                <span style={{ background:"linear-gradient(135deg,#7c3aed,#a855f7)", color:"#fff", borderRadius:"50%", width:20, height:20, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700 }}>
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* User */}
        <div style={{ padding:"16px 20px", borderTop:"1px solid #e5e7eb", display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:36, height:36, borderRadius:"50%", background:"linear-gradient(135deg,#7c3aed,#a855f7)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:700, fontSize:15, flexShrink:0, boxShadow:"0 4px 12px rgba(124,58,237,0.3)" }}>
            {user?.full_name?.[0]?.toUpperCase() || user?.name?.[0]?.toUpperCase() || "F"}
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:13, fontWeight:600, color:"#111827", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
              {user?.full_name || user?.name}
            </div>
            <div style={{ fontSize:11, color:"#9ca3af" }}>Freelancer</div>
          </div>
          <button onClick={handleLogout} title="Logout"
            style={{ background:"none", border:"none", cursor:"pointer", color:"#9ca3af" }}
            onMouseEnter={e => e.currentTarget.style.color="#7c3aed"}
            onMouseLeave={e => e.currentTarget.style.color="#9ca3af"}>
            <LogoutIcon />
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ marginLeft:250, flex:1, backgroundColor:"#f8fafc", minHeight:"100vh" }}>
        {/* Topbar */}
        <div style={{ backgroundColor:"#fff", borderBottom:"1px solid #e5e7eb", padding:"0 32px", height:64, display:"flex", justifyContent:"space-between", alignItems:"center", position:"sticky", top:0, zIndex:100, boxShadow:"0 1px 3px rgba(0,0,0,0.05)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ width:8, height:8, borderRadius:"50%", background:"linear-gradient(135deg,#7c3aed,#a855f7)" }} />
            <span style={{ fontWeight:700, fontSize:15, color:"#111827" }}>
              {navItems.find(n => n.key === activePage)?.label}
            </span>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:16 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, backgroundColor:"#f8fafc", padding:"6px 14px", borderRadius:20, border:"1px solid #e2e8f0" }}>
              <div style={{ width:32, height:32, borderRadius:"50%", background:"linear-gradient(135deg,#7c3aed,#a855f7)", display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontWeight:700, fontSize:13, boxShadow:"0 2px 8px rgba(124,58,237,0.3)" }}>
                {user?.full_name?.[0]?.toUpperCase() || user?.name?.[0]?.toUpperCase() || "F"}
              </div>
              <div>
                <div style={{ fontWeight:600, fontSize:13, color:"#111827" }}>{user?.full_name || user?.name}</div>
                <div style={{ fontSize:11, color:"#64748b" }}>Freelancer</div>
              </div>
            </div>
            <button onClick={handleLogout}
              style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 16px", border:"1px solid #e2e8f0", borderRadius:8, cursor:"pointer", fontSize:13, color:"#64748b", background:"white" }}>
              <LogoutIcon /> Logout
            </button>
          </div>
        </div>

        {renderPage()}
      </main>
    </div>
  );
}