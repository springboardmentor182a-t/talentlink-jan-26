import React, { useState, useEffect, useContext } from 'react';
import React, { useContext, useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    User,
    Search,
    FileText,
    Briefcase,
    MessageCircle,
    Star,
    PlusCircle,
    Folder,
    LogOut
} from 'lucide-react';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';

const Sidebar = () => {
    const { user, role, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (!user) return;
        const fetchUnreadCount = async () => {
            try {
                const res = await api.get('/messages/unread-count');
                setUnreadCount(res.data.count);
            } catch (error) {
                console.log("Unread count fetch skipped or failed");
            }
        };
        fetchUnreadCount();
        const interval = setInterval(fetchUnreadCount, 30000);
        return () => clearInterval(interval);
    }, [user]);

    const handleLogout = () => {
        logout();
        navigate('/');
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    const fetchUnread = async () => {
      try {
        const res = await api.get(`/messages/conversations/${user.id}`);
        const total = res.data.reduce((sum, c) => sum + (c.unread_count || 0), 0);
        setUnreadCount(total);
      } catch {
        setUnreadCount(0);
      }
    };
    fetchUnread();
    // Refresh every 30 seconds
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard',   path: '/dashboard' },
    { icon: User,            label: 'Profile',      path: '/profile' },
    { icon: PlusCircle,      label: 'Post Project', path: '/post-project' },
    { icon: Folder,          label: 'Projects',     path: '/projects' },
    { icon: FileText,        label: 'Contracts',    path: '/contracts' },
    { icon: MessageSquare,   label: 'Messages',     path: '/messages', badge: unreadCount },
    { icon: Star,            label: 'Reviews',      path: '/reviews' },
  ];

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <aside style={{ width:250, height:"100vh", position:"fixed", left:0, top:0, display:"flex", flexDirection:"column", backgroundColor:"#fff", borderRight:"1px solid #e2e8f0" }}>

    const freelancerItems = [
        { path: '/freelancer/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/freelancer/profile',   label: 'Profile',   icon: User },
        { path: '/freelancer/browse',    label: 'Browse Projects', icon: Search },
        { path: '/proposal-tracking',    label: 'My Proposals', icon: FileText },
        { path: '/freelancer/contracts', label: 'Contracts', icon: Briefcase },
        { path: '/freelancer/messages',  label: 'Messages',  icon: MessageCircle, badge: unreadCount > 0 ? unreadCount : null },
        { path: '/freelancer/reviews',   label: 'Reviews',   icon: Star },
    ];

    const clientItems = [
        { path: '/dashboard',    label: 'Dashboard',    icon: LayoutDashboard },
        { path: '/profile',      label: 'Profile',       icon: User },
        { path: '/post-project', label: 'Post Project',  icon: PlusCircle },
        { path: '/projects',     label: 'Projects',      icon: Folder },
        { path: '/contracts',    label: 'Contracts',     icon: FileText },
        { path: '/messages',     label: 'Messages',      icon: MessageCircle, badge: unreadCount > 0 ? unreadCount : null },
        { path: '/reviews',      label: 'Reviews',       icon: Star },
    ];

    const navItems = role === 'client' ? clientItems : freelancerItems;

    return (
        <aside className="sidebar" style={{
            width: '250px',
            height: '100vh',
            position: 'fixed',
            left: 0,
            top: 0,
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#fff',
            borderRight: '1px solid #e5e7eb',
            zIndex: 1000
        }}>
            {/* Logo */}
            <div style={{ padding: '24px', borderBottom: '1px solid #e5e7eb' }}>
                <h2 style={{ margin: 0, color: '#7c3aed', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Briefcase size={24} /> TalentLink
                </h2>
            </div>

            {/* Nav */}
            <nav style={{ flex: 1, padding: '24px 16px' }}>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {navItems.map((item) => (
                        <li key={item.label}>
                            <NavLink
                                to={item.path}
                                style={({ isActive }) => ({
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    padding: '12px 16px',
                                    borderRadius: '8px',
                                    textDecoration: 'none',
                                    color: isActive ? '#7c3aed' : '#6b7280',
                                    backgroundColor: isActive ? '#f5f3ff' : 'transparent',
                                    fontWeight: isActive ? 600 : 500,
                                    transition: 'all 0.2s ease',
                                    fontSize: '14px'
                                })}
                            >
                                <item.icon size={20} />
                                <span>{item.label}</span>
                                {item.badge && (
                                    <span style={{
                                        marginLeft: 'auto',
                                        backgroundColor: '#7c3aed',
                                        color: '#ffffff',
                                        borderRadius: '10px',
                                        padding: '2px 8px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '0.75rem'
                                    }}>
                                        {item.badge}
                                    </span>
                                )}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>

            {/* User + Logout */}
            <div style={{
                padding: '16px 20px',
                borderTop: '1px solid #e5e7eb',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
            }}>
                <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: 'linear-gradient(135deg,#7c3aed,#a855f7)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontWeight: 700, fontSize: 15, flexShrink: 0
                }}>
                    {user?.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {user?.name || 'User'}
                    </div>
                    <div style={{ fontSize: 11, color: '#9ca3af', textTransform: 'capitalize' }}>{role}</div>
                </div>
                <button
                    onClick={handleLogout}
                    title="Logout"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 4, display: 'flex', alignItems: 'center' }}
                >
                    <LogOut size={18} />
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
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
                {item.badge > 0 && (
                  <span style={{ background:"linear-gradient(135deg,#2563eb,#3b82f6)", color:"white", borderRadius:"50%", width:20, height:20, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700 }}>
                    {item.badge > 99 ? "99+" : item.badge}
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
