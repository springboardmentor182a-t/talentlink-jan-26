import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../../services/auth";
import "./Sidebar.css";

const Sidebar = () => {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [userName, setUserName] = useState("User");
  const [userRole, setUserRole] = useState("Freelancer");

  useEffect(() => {
    const roleRaw =
      authService.getUserRole() ||
      localStorage.getItem("user_role") ||
      "Freelancer";
    const roleNormalized =
      (roleRaw || "").toString().toLowerCase() === "client"
        ? "Client"
        : "Freelancer";
    setUserRole(roleNormalized);

    const user =
      localStorage.getItem("user_name") ||
      localStorage.getItem("first_name") ||
      "User";
    setUserName(user);
  }, []);

  const freelancerMenu = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: "📊",
      path: "/freelancer/dashboard",
    },
    {
      id: "find-projects",
      label: "Find Projects",
      icon: "🔍",
      path: "/freelancer/projects",
    },
    {
      id: "my-proposals",
      label: "My Proposals",
      icon: "📝",
      path: "/freelancer/proposals",
    },
    {
      id: "my-contracts",
      label: "My Contracts",
      icon: "📋",
      path: "/freelancer/contracts",
    },
    {
      id: "messages",
      label: "Messages",
      icon: "💬",
      path: "/freelancer/messages",
    },
    {
      id: "profile",
      label: "Profile",
      icon: "👤",
      path: "/freelancer/profile",
    },
    {
      id: "earnings",
      label: "Earnings",
      icon: "💰",
      path: "/freelancer/earnings",
    },
    {
      id: "settings",
      label: "Settings",
      icon: "⚙️",
      path: "/freelancer/settings",
    },
  ];

  const clientMenu = [
    { id: "dashboard", label: "Dashboard", icon: "📊", path: "/client" },
    { id: "post-project", label: "Post Project", icon: "➕", path: "/client" },
    { id: "my-projects", label: "My Projects", icon: "📁", path: "/client" },
    {
      id: "received-proposals",
      label: "Received Proposals",
      icon: "📝",
      path: "/client/received-proposals",
    },
    { id: "contracts", label: "Contracts", icon: "📃", path: "/client" },
    {
      id: "messages",
      label: "Messages",
      icon: "💬",
      path: "/freelancer/messages",
    },
    {
      id: "profile",
      label: "Profile",
      icon: "👤",
      path: "/freelancer/profile",
    },
    { id: "payments", label: "Payments", icon: "💵", path: "/client" },
    {
      id: "settings",
      label: "Settings",
      icon: "⚙️",
      path: "/freelancer/settings",
    },
  ];

  const menuItems = userRole === "Client" ? clientMenu : freelancerMenu;

  const handleMenuClick = (item) => {
    setActiveMenu(item.id);
    navigate(item.path);
  };

  const handleLogout = () => {
    // Add logout logic here
    navigate("/login");
  };

  return (
    <aside className="freelancer-sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <span className="logo-text">TalentLink</span>
      </div>

      {/* Menu Items */}
      <nav className="sidebar-menu">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`menu-item ${activeMenu === item.id ? "active" : ""}`}
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
            <p className="user-role">{userRole}</p>
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
