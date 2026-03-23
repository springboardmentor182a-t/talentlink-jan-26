import React, { useState, useEffect, useContext } from 'react';
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
    };

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
