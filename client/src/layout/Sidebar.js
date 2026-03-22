import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, User, PlusCircle, Folder, FileText, MessageSquare, Star, LogOut } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Sidebar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard',   path: '/dashboard' },
    { icon: User,            label: 'Profile',      path: '/profile' },
    { icon: PlusCircle,      label: 'Post Project', path: '/post-project' },
    { icon: Folder,          label: 'Projects',     path: '/projects' },
    { icon: FileText,        label: 'Contracts',    path: '/contracts' },
    { icon: MessageSquare,   label: 'Messages',     path: '/messages', badge: 3 },
    { icon: Star,            label: 'Reviews',      path: '/reviews' },
  ];

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <aside style={{ width:250, height:"100vh", position:"fixed", left:0, top:0, display:"flex", flexDirection:"column", backgroundColor:"#fff", borderRight:"1px solid #e2e8f0" }}>

      {/* Logo */}
      <div style={{ padding:"20px 24px", borderBottom:"1px solid #e2e8f0", display:"flex", alignItems:"center", gap:10 }}>
        <div style={{ width:36, height:36, background:"linear-gradient(135deg,#1e3a5f,#2563eb)", borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", color:"white", boxShadow:"0 4px 12px rgba(37,99,235,0.3)", flexShrink:0 }}>
          <BriefcaseIcon />
        </div>
        <span style={{ fontWeight:800, fontSize:18, background:"linear-gradient(135deg,#1e3a5f,#2563eb)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", letterSpacing:"-0.5px" }}>
          TalentLink
        </span>
      </div>

      {/* Nav */}
      <nav style={{ flex:1, padding:"16px 12px", overflowY:"auto" }}>
        <ul style={{ listStyle:"none", padding:0, margin:0, display:"flex", flexDirection:"column", gap:4 }}>
          {navItems.map(item => (
            <li key={item.label}>
              <NavLink to={item.path}
                style={({ isActive }) => ({
                  display:"flex", alignItems:"center", gap:12,
                  padding:"11px 14px", borderRadius:8,
                  textDecoration:"none",
                  color: isActive ? "#2563eb" : "#64748b",
                  backgroundColor: isActive ? "#eff6ff" : "transparent",
                  fontWeight: isActive ? 600 : 400,
                  fontSize:14,
                  borderLeft: isActive ? "3px solid #2563eb" : "3px solid transparent",
                  transition:"all 0.15s"
                })}>
                <item.icon size={20} />
                <span style={{ flex:1 }}>{item.label}</span>
                {item.badge && (
                  <span style={{ background:"linear-gradient(135deg,#2563eb,#3b82f6)", color:"white", borderRadius:"50%", width:20, height:20, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700 }}>
                    {item.badge}
                  </span>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* User */}
      <div style={{ padding:"16px 20px", borderTop:"1px solid #e2e8f0", display:"flex", alignItems:"center", gap:10 }}>
        <div style={{ width:36, height:36, borderRadius:"50%", background:"linear-gradient(135deg,#1e3a5f,#2563eb)", display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontWeight:700, fontSize:15, flexShrink:0, boxShadow:"0 2px 8px rgba(37,99,235,0.3)" }}>
          {user?.full_name?.[0]?.toUpperCase() || user?.name?.[0]?.toUpperCase() || "C"}
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:13, fontWeight:600, color:"#111827", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
            {user?.full_name || user?.name || "Client"}
          </div>
          <div style={{ fontSize:11, color:"#9ca3af" }}>Client</div>
        </div>
        <button onClick={handleLogout} title="Logout"
          style={{ background:"none", border:"none", cursor:"pointer", color:"#9ca3af", padding:4, display:"flex", alignItems:"center" }}
          onMouseEnter={e => e.currentTarget.style.color="#2563eb"}
          onMouseLeave={e => e.currentTarget.style.color="#9ca3af"}>
          <LogOut size={18} />
        </button>
      </div>
    </aside>
  );
};

const BriefcaseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
  </svg>
);

export default Sidebar;