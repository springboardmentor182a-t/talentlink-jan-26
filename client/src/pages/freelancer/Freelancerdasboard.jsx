import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sun, Moon } from "lucide-react";
import { AuthContext } from "../../context/AuthContext";
import { NotificationContext } from "../../context/NotificationContext";
import { useTheme } from "../../context/ThemeContext";
import NotificationBell from "../../components/NotificationBell";
import BrowseProjects from "./BrowseProjects";
import ProposalTracking from "../proposal/ProposalTracking";
import Messages from "../messages/Messages";
import FreelancerHome from "./FreelancerHome";
import FreelancerContracts from "./Freelancercontracts";
import Profile from "../Profile/profile";
import Reviews from "../Reviews/Reviews";

const DashboardIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>);
const ProfileIcon  = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>);
const BrowseIcon   = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>);
const ProposalIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>);
const ContractIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>);
const MessageIcon  = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>);
const ReviewIcon   = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>);
const LogoutIcon   = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>);

export default function FreelancerDashboard({ defaultPage = "dashboard" }) {
  const { user, logout }                                    = useContext(AuthContext);
  const { msgUnreadCount, enterMessages, leaveMessages }    = useContext(NotificationContext); // ✅
  const { isDark, toggleTheme }                             = useTheme();
  const navigate                                            = useNavigate();
  const [activePage, setActivePage]                         = useState(defaultPage);

  // Hide the floating AI chat button when messages page is active (it overlaps Send button)
  useEffect(() => {
    if (activePage === "messages") {
      document.body.classList.add("messages-active");
    } else {
      document.body.classList.remove("messages-active");
    }
    return () => document.body.classList.remove("messages-active");
  }, [activePage]);

  const handleLogout = () => { logout(); navigate("/"); };

  // ✅ Central nav handler — tracks messages page entry/exit
  const handleNavClick = (key) => {
    // Leaving messages page → re-enable badge counting
    if (activePage === "messages" && key !== "messages") {
      leaveMessages();
    }
    setActivePage(key);
    // Entering messages page → clear badge + stop incrementing
    if (key === "messages") {
      enterMessages();
    }
  };

  const navItems = [
    { key:"dashboard", label:"Dashboard",      icon:<DashboardIcon /> },
    { key:"profile",   label:"Profile",         icon:<ProfileIcon />   },
    { key:"browse",    label:"Browse Projects", icon:<BrowseIcon />    },
    { key:"proposals", label:"My Proposals",    icon:<ProposalIcon />  },
    { key:"contracts", label:"Contracts",       icon:<ContractIcon />  },
    { key:"messages",  label:"Messages",        icon:<MessageIcon />,  badge: msgUnreadCount }, // ✅
    { key:"reviews",   label:"Reviews",         icon:<ReviewIcon />    },
  ];

  // ✅ Use handleNavClick for onNavigate so leaveMessages is always called
  const renderPage = () => {
    if (activePage === "dashboard") return <FreelancerHome      onNavigate={handleNavClick} />;
    if (activePage === "profile")   return <Profile             onNavigate={handleNavClick} />;
    if (activePage === "browse")    return <BrowseProjects />;
    if (activePage === "proposals") return <ProposalTracking />;
    if (activePage === "contracts") return <FreelancerContracts onNavigate={handleNavClick} />;
    if (activePage === "messages")  return <Messages onNavigate={handleNavClick} />;
    if (activePage === "reviews")   return <Reviews             onNavigate={handleNavClick} />;
    return null;
  };

  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div style={{ display:"flex", minHeight:"100vh", fontFamily:"'Segoe UI',sans-serif" }}>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)}
          style={{ position:"fixed", inset:0, backgroundColor:"rgba(0,0,0,0.4)", zIndex:199 }} />
      )}

      {/* Sidebar */}
      <aside style={{ width:250, height:"100vh", position:"fixed", left:0, top:0, backgroundColor:"var(--sidebar-bg)", borderRight:"1px solid var(--border)", display:"flex", flexDirection:"column",
        transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
        transition: "transform 0.25s ease",
        zIndex:200,
      }} className={`freelancer-sidebar${sidebarOpen ? " sidebar-open" : ""}`}>
        <div style={{ padding:"20px", borderBottom:"1px solid var(--border)", display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:36, height:36, background:"linear-gradient(135deg,#7c3aed,#a855f7)", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", boxShadow:"0 4px 12px rgba(124,58,237,0.3)" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
          </div>
          <span style={{ fontWeight:700, fontSize:18, color:"#7c3aed" }}>TalentLink</span>
        </div>

        <nav style={{ flex:1, padding:"16px 12px" }}>
          {navItems.map(item => (
            <button key={item.key}
              onClick={() => handleNavClick(item.key)}
              style={{
                width:"100%", display:"flex", alignItems:"center", gap:12,
                padding:"11px 14px", borderRadius:8, border:"none", cursor:"pointer",
                fontFamily:"inherit", fontSize:14,
                fontWeight: activePage === item.key ? 600 : 400,
                backgroundColor: activePage === item.key ? "var(--nav-active-bg)" : "transparent",
                color: activePage === item.key ? "var(--nav-active-color)" : "var(--nav-idle-color)",
                marginBottom:4, textAlign:"left",
                borderLeft: activePage === item.key ? "3px solid var(--nav-active-color)" : "3px solid transparent",
                transition:"all 0.15s"
              }}
              onMouseEnter={e => { if (activePage !== item.key) e.currentTarget.style.backgroundColor="var(--nav-active-bg)"; }}
              onMouseLeave={e => { if (activePage !== item.key) e.currentTarget.style.backgroundColor="transparent"; }}>
              {item.icon}
              <span style={{ flex:1 }}>{item.label}</span>
              {/* ✅ Message badge */}
              {item.badge > 0 && (
                <span style={{ background:"linear-gradient(135deg,#7c3aed,#a855f7)", color:"white", borderRadius:"50%", width:20, height:20, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700 }}>
                  {item.badge > 99 ? "99+" : item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div style={{ padding:"16px 20px", borderTop:"1px solid var(--border)", display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:36, height:36, borderRadius:"50%", background:"linear-gradient(135deg,#7c3aed,#a855f7)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:700, fontSize:15, flexShrink:0, boxShadow:"0 4px 12px rgba(124,58,237,0.3)" }}>
            {user?.full_name?.[0]?.toUpperCase() || user?.name?.[0]?.toUpperCase() || "F"}
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:13, fontWeight:600, color:"var(--text-primary)", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
              {user?.full_name || user?.name}
            </div>
            <div style={{ fontSize:11, color:"var(--text-faint)" }}>Freelancer</div>
          </div>
          <button onClick={handleLogout} title="Logout"
            style={{ background:"none", border:"none", cursor:"pointer", color:"var(--text-faint)" }}
            onMouseEnter={e => e.currentTarget.style.color="#7c3aed"}
            onMouseLeave={e => e.currentTarget.style.color="var(--text-muted)"}>
            <LogoutIcon />
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ marginLeft:"var(--fl-sidebar-margin,250px)", flex:1, backgroundColor:"var(--page-bg)", minHeight:"100vh", minWidth:0, overflowX:"hidden" }}>

        {/* Topbar */}
        <div style={{ backgroundColor:"var(--topbar-bg)", borderBottom:"1px solid var(--border)", padding:"0 16px", height:56, display:"flex", justifyContent:"space-between", alignItems:"center", position:"sticky", top:0, zIndex:100, boxShadow:"0 1px 3px rgba(0,0,0,0.05)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, minWidth:0, flex:1 }}>
            {/* Hamburger — mobile only */}
            <button onClick={() => setSidebarOpen(v => !v)}
              className="fl-hamburger"
              style={{ display:"none", background:"none", border:"none", cursor:"pointer", padding:4, flexShrink:0 }}
              aria-label="Open menu">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
            <div style={{ width:8, height:8, borderRadius:"50%", background:"linear-gradient(135deg,#7c3aed,#a855f7)", flexShrink:0 }} />
            <span style={{ fontWeight:700, fontSize:15, color:"var(--text-primary)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
              {navItems.find(n => n.key === activePage)?.label}
            </span>
          </div>

          <div className="fl-topbar-right" style={{ display:"flex", alignItems:"center", gap:12, flexShrink:0 }}>
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              title={isDark ? "Switch to light mode" : "Switch to dark mode"}
              style={{ display:"flex", alignItems:"center", justifyContent:"center", width:34, height:34, borderRadius:8, border:"1px solid var(--border)", backgroundColor:"var(--input-bg)", cursor:"pointer", color:"var(--text-muted)", flexShrink:0 }}
              onMouseEnter={e => { e.currentTarget.style.borderColor="#7c3aed"; e.currentTarget.style.color="#7c3aed"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor="var(--border)"; e.currentTarget.style.color="var(--text-muted)"; }}>
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <NotificationBell theme="purple" />
            <div className="fl-user-pill" style={{ display:"flex", alignItems:"center", gap:8, backgroundColor:"var(--page-bg)", padding:"6px 10px", borderRadius:20, border:"1px solid var(--border)", flexShrink:0 }}>
              <div style={{ width:32, height:32, borderRadius:"50%", background:"linear-gradient(135deg,#7c3aed,#a855f7)", display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontWeight:700, fontSize:13, flexShrink:0 }}>
                {user?.full_name?.[0]?.toUpperCase() || user?.name?.[0]?.toUpperCase() || "F"}
              </div>
              <div className="fl-name-hide" style={{ minWidth: 0 }}>
                <div style={{ fontWeight:600, fontSize:13, color:"var(--text-primary)", maxWidth:90, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{user?.full_name || user?.name}</div>
                <div style={{ fontSize:11, color:"var(--text-muted)" }}>Freelancer</div>
              </div>
            </div>
            <button onClick={handleLogout}
              style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 16px", border:"1px solid var(--border)", borderRadius:8, cursor:"pointer", fontSize:13, color:"var(--text-muted)", background:"var(--topbar-bg)", fontFamily:"inherit", transition:"all 0.15s", flexShrink:0 }}
              onMouseEnter={e => { e.currentTarget.style.borderColor="#7c3aed"; e.currentTarget.style.color="#7c3aed"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor="var(--border)"; e.currentTarget.style.color="var(--text-muted)"; }}>
              <LogoutIcon /> <span className="fl-logout-text">Logout</span>
            </button>
          </div>
        </div>

        {renderPage()}
        <style>{`
          @media (max-width: 767px) {
            :root { --fl-sidebar-margin: 0px; }
            .freelancer-sidebar { transform: translateX(-100%); transition: transform 0.25s ease; }
            .freelancer-sidebar.sidebar-open { transform: translateX(0); }
            .fl-hamburger { display: flex !important; }
            .fl-logout-text { display: none; }
            .fl-name-hide { display: none !important; }
          }
          @media (max-width: 480px) {
            .fl-topbar-right { gap: 6px !important; }
            .fl-user-pill { padding: 5px 8px !important; }
          }
          @media (min-width: 768px) {
            :root { --fl-sidebar-margin: 250px; }
            .freelancer-sidebar { transform: none !important; }
          }
        `}</style>
      </main>
    </div>
  );
}