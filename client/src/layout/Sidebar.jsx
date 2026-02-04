import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: '🏠' },
    { name: 'Projects', path: '/projects', icon: '💼' },
    { name: 'Contracts', path: '/contracts', icon: '📄' },
    { name: 'Messages', path: '/messages', icon: '💬' },
    { name: 'Profile', path: '/profile/freelancer', icon: '👤' },
  ];

  return (
    <div style={{ width: '240px', height: '100vh', backgroundColor: '#FF7A1A', color: 'white', position: 'fixed', padding: '20px' }}>
      <h2 style={{ fontSize: '24px', marginBottom: '40px', fontWeight: 'bold' }}>TalentLink</h2>
      <nav>
        {navItems.map((item) => (
          <Link 
            key={item.name}
            to={item.path} 
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '12px 15px',
              margin: '10px 0',
              textDecoration: 'none',
              color: 'white',
              backgroundColor: isActive(item.path) ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
              borderRadius: '10px',
              fontWeight: isActive(item.path) ? 'bold' : 'normal'
            }}
          >
            <span style={{ marginRight: '10px' }}>{item.icon}</span> {item.name}
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;