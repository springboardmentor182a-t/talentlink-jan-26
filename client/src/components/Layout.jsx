// client/src/components/Layout.jsx
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar.jsx";
export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* 1. The Fixed Sidebar */}
      <Sidebar />

      {/* 2. The Main Content Area */}
      <main className="flex-1 ml-64">
        {/* The 'Outlet' is where the page content (Profile, Dashboard) appears */}
        <Outlet />
      </main>
    </div>
  );
}