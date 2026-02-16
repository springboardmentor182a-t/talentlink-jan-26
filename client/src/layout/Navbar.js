import React from "react";
import { Bell, Search, User } from "lucide-react";

const Navbar = () => {
  return (
    <div className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-8">
      {/* Search Bar */}
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          size={18}
        />
        <input
          type="text"
          placeholder="Search projects..."
          className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
        />
      </div>

      {/* Right Side Icons */}
      <div className="flex items-center gap-6">
        <button className="relative text-gray-500 hover:text-gray-700 transition-colors">
          <Bell size={20} />
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        <div className="flex items-center gap-3 pl-6 border-l border-gray-200">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-gray-700">Client User</p>
            <p className="text-xs text-gray-500">Premium Account</p>
          </div>
          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 border-2 border-white shadow-sm">
            <User size={20} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
