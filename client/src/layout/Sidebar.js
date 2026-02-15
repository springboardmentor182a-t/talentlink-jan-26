import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    User,
    Search,
    FileText,
    Briefcase,
    MessageCircle,
    Star
} from 'lucide-react';

const Sidebar = () => {
    const location = useLocation();
    const isActive = (path) => location.pathname === path;

    const navItems = [
        { path: '/freelancer/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { path: '/freelancer/profile', label: 'Profile', icon: <User size={20} /> },
        { path: '/freelancer/browse', label: 'Browse Projects', icon: <Search size={20} /> },
        { path: '/freelancer/proposals', label: 'My Proposals', icon: <FileText size={20} /> },
        { path: '/freelancer/contracts', label: 'Contracts', icon: <Briefcase size={20} /> },
        { path: '/freelancer/messages', label: 'Messages', icon: <MessageCircle size={20} />, badge: 3 },
        { path: '/freelancer/reviews', label: 'Reviews', icon: <Star size={20} /> },
    ];

    return (
        <div className="sidebar">
            <ul className="nav-menu">
                {navItems.map((item) => (
                    <Link key={item.path} to={item.path} style={{ textDecoration: 'none' }}>
                        <li className={`nav-item ${isActive(item.path) ? 'active' : ''}`}>
                            <span className="nav-item-icon">{item.icon}</span>
                            {item.label}
                            {item.badge && <span className="count-badge">{item.badge}</span>}
                        </li>
                    </Link>
                ))}
            </ul>
        </div>
    );
};

export default Sidebar;
