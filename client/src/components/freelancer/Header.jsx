import React, { useEffect, useState } from 'react';
import './Header.css';
import authService from '../../services/auth';

const Header = () => {
  const [userName, setUserName] = useState('Freelancer');

  useEffect(() => {
    const apiBase = process.env.REACT_APP_API_URL || 'http://localhost:8000';
    const controller = new AbortController();

    const fetchUser = async () => {
      try {
        const token = authService.getToken();
        if (!token) {
          setUserName('Freelancer');
          return;
        }

        const response = await fetch(`${apiBase}/freelancer/dashboard`, {
          signal: controller.signal,
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!response.ok) {
          return;
        }

        const data = await response.json();
        const name =
          data?.user?.full_name ||
          data?.user?.name ||
          data?.user?.firstName;
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
