import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, User, PlusCircle, Folder, FileText, MessageSquare, Star } from 'lucide-react';

const Sidebar = () => {
    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
        { icon: User, label: 'Profile', path: '/profile' },
        { icon: PlusCircle, label: 'Post Project', path: '/post-project' },
        { icon: Folder, label: 'Projects', path: '/projects' },
        { icon: FileText, label: 'Contracts', path: '/contracts' },
        { icon: MessageSquare, label: 'Messages', path: '/messages', badge: 3 },
        { icon: Star, label: 'Reviews', path: '/reviews' },
    ];

    return (
        <aside className="sidebar" style={{
            width: '250px',
            height: '100vh',
            position: 'fixed',
            left: 0,
            top: 0,
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: 'var(--card)',
            borderRight: '1px solid var(--border)'
        }}>
            <div style={{ padding: '24px', borderBottom: '1px solid var(--border)' }}>
                <h2 style={{ margin: 0, color: '#2563eb', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <BriefcaseIcon /> TalentLink
                </h2>
            </div>

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
                                    borderRadius: 'var(--radius)',
                                    textDecoration: 'none',
                                    color: isActive ? '#2563eb' : 'var(--muted-foreground)',
                                    backgroundColor: isActive ? '#EFF6FF' : 'transparent',
                                    fontWeight: isActive ? 600 : 400,
                                    transition: 'all 0.2s ease',
                                    borderLeft: 'none' // Removed border to match rounded pill design better
                                })}
                            >
                                <item.icon size={20} />
                                <span>{item.label}</span>
                                {item.badge && (
                                    <span style={{
                                        marginLeft: 'auto',
                                        backgroundColor: '#2563eb',
                                        color: '#ffffff',
                                        borderRadius: '50%',
                                        width: '20px',
                                        height: '20px',
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


        </aside>
    );
};

// Simple Icon component for Logo
const BriefcaseIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 7H4C2.89543 7 2 7.89543 2 9V19C2 20.1046 2.89543 21 4 21H20C21.1046 21 22 20.1046 22 19V9C22 7.89543 21.1046 7 20 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M16 21V5C16 4.46957 15.7893 3.96086 15.4142 3.58579C15.0391 3.21071 14.5304 3 14 3H10C9.46957 3 8.96086 3.21071 8.58579 3.58579C8.21071 3.96086 8 4.46957 8 5V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export default Sidebar;