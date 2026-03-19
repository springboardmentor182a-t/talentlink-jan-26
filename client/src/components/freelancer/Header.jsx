import React, { useEffect, useState } from 'react';
import './Header.css';

const Header = () => {
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

  return (
    <header className="freelancer-header">
      <div className="header-left">
        <input
          type="text"
          className="search-input"
          placeholder="Search..."
        />
      </div>

      <div className="header-right">
        {/* Notifications */}
        <button className="header-icon notification-btn">
          <span>🔔</span>
        </button>

        {/* Messages */}
        <button className="header-icon message-btn">
          <span>💬</span>
        </button>

        {/* Profile Dropdown */}
        <button className="profile-dropdown">
          <div className="profile-avatar">👤</div>
          <span className="profile-name">{userName}</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
