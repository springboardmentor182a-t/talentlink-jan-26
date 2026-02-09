import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [userName, setUserName] = useState('Freelancer');

  useEffect(() => {
    const apiBase = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api';
    const controller = new AbortController();

    const fetchUser = async () => {
      try {
        const response = await fetch(`${apiBase}/freelancer/profile`, {
          signal: controller.signal
        });

        if (!response.ok) {
          return;
        }

        const data = await response.json();
        const name = data?.name || data?.firstName || data?.user?.name;
        if (name) {
          setUserName(name);
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          setUserName('Freelancer');
        }
      }
    };

    fetchUser();

    return () => controller.abort();
  }, []);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', path: '/freelancer/dashboard' },
    { id: 'find-projects', label: 'Find Projects', icon: '🔍', path: '/freelancer/projects' },
    { id: 'my-proposals', label: 'My Proposals', icon: '📝', path: '/freelancer/proposals' },
    { id: 'my-contracts', label: 'My Contracts', icon: '📋', path: '/freelancer/contracts' },
    { id: 'messages', label: 'Messages', icon: '💬', path: '/freelancer/messages' },
    { id: 'profile', label: 'Profile', icon: '👤', path: '/freelancer/profile' },
    { id: 'earnings', label: 'Earnings', icon: '💰', path: '/freelancer/earnings' },
    { id: 'settings', label: 'Settings', icon: '⚙️', path: '/freelancer/settings' },
  ];

  const handleMenuClick = (item) => {
    setActiveMenu(item.id);
    navigate(item.path);
  };

  const handleLogout = () => {
    // Add logout logic here
    navigate('/login');
  };

  return (
    <aside className="freelancer-sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <span className="logo-text">TalentLink</span>
      </div>

      {/* Menu Items */}
      <nav className="sidebar-menu">
        {menuItems.map(item => (
          <button
            key={item.id}
            className={`menu-item ${activeMenu === item.id ? 'active' : ''}`}
            onClick={() => handleMenuClick(item)}
          >
            <span className="menu-icon">{item.icon}</span>
            <span className="menu-label">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="sidebar-bottom">
        {/* User Profile Preview */}
        <div className="user-preview">
          <div className="user-avatar">👤</div>
          <div className="user-info">
            <p className="user-name">{userName}</p>
            <p className="user-role">Freelancer</p>
          </div>
        </div>

        {/* Logout Button */}
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
