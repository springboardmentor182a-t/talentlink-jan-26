import React from "react";

import Sidebar from "../../layout/Sidebar";
import Navbar from "../../layout/Navbar";

const ClientShell = ({ profile, title, subtitle, action, children }) => {
  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Navbar profile={profile} title={title} />
        <main className="flex-1 overflow-y-auto bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.12),_transparent_22%),linear-gradient(180deg,_#eff6ff_0%,_#f8fafc_100%)] p-8">
          <div className="mb-8 flex items-end justify-between gap-6">
            <div>
              <h1 className="text-5xl font-extrabold tracking-tight text-slate-900">
                {title}
              </h1>
              <p className="mt-3 text-lg text-slate-600">{subtitle}</p>
            </div>
            {action}
          </div>
          {children}
        </main>
      </div>
    </div>
  );
};

export default ClientShell;
