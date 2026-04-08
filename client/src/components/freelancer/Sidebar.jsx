import React from "react";
import {
  BadgeDollarSign,
  BriefcaseBusiness,
  FileText,
  LayoutDashboard,
  LogOut,
  Search,
  UserCircle2,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";

import { useFreelancerShell } from "../../context/FreelancerShellContext";
import authService from "../../services/auth";
import "./Sidebar.css";

const menuItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/freelancer/dashboard",
  },
  {
    id: "projects",
    label: "Find Projects",
    icon: Search,
    path: "/freelancer/projects",
  },
  {
    id: "proposals",
    label: "My Proposals",
    icon: FileText,
    path: "/freelancer/proposals",
  },
  {
    id: "earnings",
    label: "Earnings",
    icon: BadgeDollarSign,
    path: "/freelancer/earnings",
  },
  {
    id: "profile",
    label: "Profile",
    icon: UserCircle2,
    path: "/freelancer/profile",
  },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const { profileData, loading } = useFreelancerShell();
  const profile = profileData?.profile;
  const overview = profileData?.overview;

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  return (
    <aside className="freelancer-sidebar">
      <div className="sidebar-logo">
        <div className="logo-mark">
          <BriefcaseBusiness size={22} />
        </div>
        <div>
          <p className="logo-title">TalentLink</p>
          <p className="logo-subtitle">Freelancer Workspace</p>
        </div>
      </div>

      <nav className="sidebar-menu">
        {menuItems.map((item) => (
          <NavLink
            key={item.id}
            to={item.path}
            className={({ isActive }) =>
              `menu-item ${isActive ? "active" : ""}`
            }
          >
            <span className="menu-icon">
              <item.icon size={18} />
            </span>
            <span className="menu-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <div className="user-preview">
          <div className="user-avatar">{profile?.initials || "FR"}</div>
          <div className="user-info">
            <p className="user-name">
              {loading ? "Loading..." : profile?.full_name || "Freelancer"}
            </p>
            <p className="user-role">{profile?.role || "Freelancer"}</p>
          </div>
        </div>

        <div className="sidebar-stat">
          <span>Active Projects</span>
          <strong>{overview?.active_projects ?? 0}</strong>
        </div>

        <button className="logout-btn" type="button" onClick={handleLogout}>
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
