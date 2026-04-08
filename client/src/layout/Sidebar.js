import React from "react";
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  LogOut,
  UserCircle2,
} from "lucide-react";

import { NavLink, useNavigate } from "react-router-dom";
import authService from "../services/auth";

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  const menuItems = [
    {
      id: "dashboard",
      name: "Dashboard",
      icon: <LayoutDashboard size={20} />,
      path: "/client",
    },
    {
      id: "my-projects",
      name: "My Projects",
      icon: <Briefcase size={20} />,
      path: "/client/projects",
    },
    {
      id: "received-proposals",
      name: "Received Proposals",
      icon: <FileText size={20} />,
      path: "/client/received-proposals",
    },
    {
      id: "profile",
      name: "Profile",
      icon: <UserCircle2 size={20} />,
      path: "/client/profile",
    },
  ];

  return (
    <div className="flex h-screen w-72 flex-col bg-[linear-gradient(180deg,_#16213e_0%,_#2c2d78_100%)] px-4 py-6 text-white shadow-[12px_0_35px_rgba(15,23,42,0.18)]">
      <div className="mb-10 flex items-center gap-3 px-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,_#4f46e5,_#60a5fa)] shadow-[0_20px_30px_rgba(79,70,229,0.3)]">
          T
        </div>
        <div>
          <p className="text-3xl font-extrabold tracking-tight">TalentLink</p>
          <p className="text-sm text-white/70">Client Workspace</p>
        </div>
      </div>

      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.id}
            to={item.path}
            className={({ isActive }) =>
              `flex w-full items-center gap-3 rounded-2xl px-4 py-4 text-base font-bold transition-all ${
                isActive
                  ? "bg-[linear-gradient(135deg,_#4f46e5,_#6366f1)] text-white shadow-[0_18px_28px_rgba(37,99,235,0.28)]"
                  : "text-white/80 hover:translate-x-1 hover:bg-white/10 hover:text-white"
              }`
            }
          >
            {item.icon}
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto rounded-3xl border border-white/10 bg-white/10 p-4">
        <p className="text-sm text-white/70">Signed in as</p>
        <p className="mt-1 text-lg font-bold">Client</p>
      </div>

      <button
        onClick={handleLogout}
        className="mt-4 flex items-center justify-center gap-3 rounded-2xl bg-red-400/15 px-4 py-4 text-sm font-bold text-red-100 transition-colors hover:bg-red-400/25"
      >
        <LogOut size={20} />
        Logout
      </button>
    </div>
  );
};

export default Sidebar;
