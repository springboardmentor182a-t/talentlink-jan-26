import React from 'react';
import './Header.css';

const Header = () => {
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
          <span className="profile-name">Nayana SP</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
