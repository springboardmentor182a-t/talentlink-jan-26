import React from "react";
import {
  LayoutDashboard,
  Briefcase,
  MessageSquare,
  Settings,
  LogOut,
} from "lucide-react";

import { useNavigate, useLocation } from "react-router-dom";
import authService from "../services/auth";

const Sidebar = () => {
  const navigate = useNavigate();
  const [activeItem, setActiveItem] = React.useState("dashboard");
  const [userRole, setUserRole] = React.useState("Client");

  const location = useLocation();

  React.useEffect(() => {
    const roleFromAuth = authService.getUserRole();
    const roleFromStorage = localStorage.getItem("user_role");
    const role = roleFromAuth || roleFromStorage || "Client";
    setUserRole(
      role.toString().toLowerCase() === "freelancer" ? "Freelancer" : "Client",
    );

    // Set active menu item based on current route
    if (location.pathname.startsWith("/client/received-proposals")) {
      setActiveItem("received-proposals");
    } else if (location.pathname.startsWith("/client/messages")) {
      setActiveItem("messages");
    } else if (location.pathname.startsWith("/client")) {
      setActiveItem("dashboard");
    } else if (location.pathname.startsWith("/freelancer/projects")) {
      setActiveItem("projects");
    } else if (location.pathname.startsWith("/freelancer/proposals")) {
      setActiveItem("proposals");
    } else if (location.pathname.startsWith("/freelancer/earnings")) {
      setActiveItem("earnings");
    } else if (location.pathname.startsWith("/freelancer/profile")) {
      setActiveItem("profile");
    } else {
      setActiveItem("dashboard");
    }
  }, [location]);

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  const clientMenu = [
    {
      id: "dashboard",
      name: "Dashboard",
      icon: <LayoutDashboard size={20} />,
      path: "/client",
    },
    {
      id: "post-project",
      name: "Post Project",
      icon: <Briefcase size={20} />,
      path: "/client",
    },
    {
      id: "my-projects",
      name: "My Projects",
      icon: <Briefcase size={20} />,
      path: "/client",
    },
    {
      id: "received-proposals",
      name: "Received Proposals",
      icon: <Briefcase size={20} />,
      path: "/client/received-proposals",
    },
    {
      id: "messages",
      name: "Messages",
      icon: <MessageSquare size={20} />,
      path: "/client/messages",
    },
    {
      id: "settings",
      name: "Settings",
      icon: <Settings size={20} />,
      path: "/client",
    },
  ];

  const freelancerMenu = [
    {
      id: "dashboard",
      name: "Dashboard",
      icon: <LayoutDashboard size={20} />,
      path: "/freelancer/dashboard",
    },
    {
      id: "projects",
      name: "Projects",
      icon: <Briefcase size={20} />,
      path: "/freelancer/projects",
    },
    {
      id: "messages",
      name: "Messages",
      icon: <MessageSquare size={20} />,
      path: "/freelancer/messages",
    },
    {
      id: "settings",
      name: "Settings",
      icon: <Settings size={20} />,
      path: "/freelancer/settings",
    },
  ];

  const menuItems = userRole === "Client" ? clientMenu : freelancerMenu;

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
            key={item.id}
            onClick={() => {
              setActiveItem(item.id);
              navigate(item.path);
            }}
            className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              activeItem === item.id
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
      <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-red-400 transition-colors text-sm font-medium mt-auto"
      >
        <LogOut size={20} />
        Logout
      </button>
    </div>
  );
};

export default Sidebar;
