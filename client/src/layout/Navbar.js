import React from "react";
import { Bell, CalendarDays, Search } from "lucide-react";

const Navbar = ({ profile }) => {
  const today = new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date());

  return (
    <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-slate-200/70 bg-white/85 px-8 py-5 backdrop-blur-xl">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
          TalentLink
        </p>
        <p className="mt-1 text-2xl font-extrabold text-slate-900">
          Client Workspace
        </p>
      </div>

      <div className="flex items-center gap-4">
        <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-500">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search projects, freelancers, payments"
            className="w-80 bg-transparent text-sm outline-none"
          />
        </label>

        <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
          <CalendarDays size={16} />
          <span>{today}</span>
        </div>

        <button className="relative rounded-2xl border border-slate-200 bg-white p-3 text-slate-500 transition-colors hover:text-slate-700">
          <Bell size={20} />
          <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-rose-500"></span>
        </button>

        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold text-slate-700">
              {profile?.full_name || "Account User"}
            </p>
            <p className="text-xs text-slate-500">
              {profile?.role || "Client"}
            </p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,_#4f46e5,_#7c3aed)] font-bold text-white shadow-sm">
            {profile?.initials || "CL"}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
