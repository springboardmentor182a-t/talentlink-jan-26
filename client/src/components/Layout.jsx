import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar.jsx";

export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* 1. The Fixed Sidebar */}
      <Sidebar />

      {/* 2. The Main Content Area */}
      {/* Changed: Removed the ml-64 margin so it snaps to the new sidebar */}
      <main className="flex-1 overflow-x-hidden">
        {/* The 'Outlet' is where the page content appears */}
        <div className="p-8 h-full">
           <Outlet />
        </div>
      </main>
    </div>
  );
}