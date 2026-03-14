import React from "react";
import "./Sidebar.css";

const Sidebar = () => {
  return (
    <div className="sidebar">

      <div className="sidebar-header">
        <div className="logo-box">🎁</div>
        <div>
          <h2>TalentLink</h2>
          <span className="role">Freelancer</span>
        </div>
      </div>

      <div className="menu">

        <div className="menu-item">
          <span>📊</span> Dashboard
        </div>

        <div className="menu-item active">
          <span>🔍</span> Find Projects
        </div>

        <div className="menu-item">
          <span>📄</span> My Proposals
        </div>

        <div className="menu-item">
          <span>📑</span> Contracts
        </div>

        <div className="menu-item">
          <span>💬</span> Messages
        </div>

        <div className="menu-item">
          <span>👤</span> Profile
        </div>

        <div className="menu-item">
          <span>⭐</span> Reviews
        </div>

        <div className="menu-item">
          <span>💳</span> Payments
        </div>

        <div className="menu-item">
          <span>⚙️</span> Settings
        </div>

      </div>

      <div className="logout">
        ↩ Logout
      </div>

    </div>
  );
};

export default Sidebar;