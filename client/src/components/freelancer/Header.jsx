import React from "react";
import { Bell, CalendarDays, Search } from "lucide-react";
import { useLocation } from "react-router-dom";

import { useFreelancerShell } from "../../context/FreelancerShellContext";
import "./Header.css";

const titleMap = {
  "/freelancer/dashboard": "Freelancer Dashboard",
  "/freelancer/projects": "Project Marketplace",
  "/freelancer/proposals": "Proposal Center",
  "/freelancer/earnings": "Earnings",
  "/freelancer/profile": "Freelancer Profile",
};

const Header = () => {
  const location = useLocation();
  const { profileData } = useFreelancerShell();
  const profile = profileData?.profile;
  const heading = titleMap[location.pathname] || "Freelancer Workspace";
  const today = new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date());

  return (
    <header className="freelancer-header">
      <div className="header-left">
        <p className="header-eyebrow">TalentLink</p>
        <h1>{heading}</h1>
      </div>

      <div className="header-right">
        <label className="header-search">
          <Search size={16} />
          <input type="text" placeholder="Search projects, proposals, clients" />
        </label>

        <div className="header-date">
          <CalendarDays size={16} />
          <span>{today}</span>
        </div>

        <button className="header-icon" type="button" aria-label="Notifications">
          <Bell size={18} />
        </button>

        <div className="profile-dropdown">
          <div className="profile-avatar">{profile?.initials || "FR"}</div>
          <div className="profile-copy">
            <span className="profile-name">{profile?.full_name || "Freelancer"}</span>
            <span className="profile-email">{profile?.email || ""}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
