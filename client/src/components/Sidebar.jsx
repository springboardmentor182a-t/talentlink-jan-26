// client/src/components/Sidebar.jsx
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, User, Building2, Briefcase, Settings, LogOut } from "lucide-react";

export default function Sidebar() {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? "bg-orange-50 text-orange-600 border-r-4 border-orange-500" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900";
  };

  const menuItems = [
    { path: "/", label: "Dashboard", icon: LayoutDashboard },
    { path: "/profile/freelancer", label: "Freelancer Profile", icon: User },
    { path: "/profile/client", label: "Company Profile", icon: Building2 },
    { path: "/jobs", label: "Job Postings", icon: Briefcase }, // We will build this later
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-screen fixed left-0 top-0 flex flex-col">
      {/* Logo Area */}
      <div className="h-16 flex items-center px-8 border-b border-gray-100">
        <span className="text-2xl font-bold text-gray-900">Talent<span className="text-orange-500">Link</span></span>
      </div>

      {/* Menu Links */}
      <nav className="flex-1 py-6 space-y-1">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-8 py-3 text-sm font-medium transition-colors ${isActive(item.path)}`}
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-gray-100">
        <button className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 hover:text-red-600 w-full transition-colors">
          <LogOut className="h-5 w-5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}