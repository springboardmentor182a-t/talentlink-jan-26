import React from "react";
import {
  LayoutDashboard,
  Briefcase,
  MessageSquare,
  Settings,
  LogOut,
} from "lucide-react";

const Sidebar = () => {
  const menuItems = [
    { name: "Dashboard", icon: <LayoutDashboard size={20} />, active: true },
    { name: "Projects", icon: <Briefcase size={20} />, active: false },
    { name: "Messages", icon: <MessageSquare size={20} />, active: false },
    { name: "Settings", icon: <Settings size={20} />, active: false },
  ];

  return (
    <div className="w-64 h-screen bg-gray-900 text-white flex flex-col p-4">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-10 px-2">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-xl">
          T
        </div>
        <span className="text-xl font-bold tracking-tight">TalentLink</span>
      </div>

      {/* Menu */}
      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.name}
            className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              item.active
                ? "bg-blue-600 text-white shadow-lg shadow-blue-900/50"
                : "text-gray-400 hover:bg-gray-800 hover:text-white"
            }`}
          >
            {item.icon}
            {item.name}
          </button>
        ))}
      </nav>

      {/* Logout */}
      <button className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-red-400 transition-colors text-sm font-medium mt-auto">
        <LogOut size={20} />
        Logout
      </button>
    </div>
  );
};

export default Sidebar;
