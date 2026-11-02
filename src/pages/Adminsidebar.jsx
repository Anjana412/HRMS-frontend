import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Settings,
  LogOut,
  UserCircle,
  Clock,
  Search,
  X,
  ClipboardList,
  UserPlus,
  CalendarClock,
  DollarSign,
  FolderKanban
} from "lucide-react";

const NAV_ITEMS = [
  { to: "/dashboard",               icon: <LayoutDashboard size={18} />, label: "Dashboard",       end: true },
  { to: "/dashboard/employees",     icon: <Users size={18} />,           label: "Staff Directory" },
  { to: "/dashboard/adduser",       icon: <UserPlus size={18} />,        label: "Add User" },
  { to: "/dashboard/projects",      icon: <FolderKanban size={18} />,    label: "Projects" },
  { to: "/dashboard/allattendance", icon: <Clock size={18} />,           label: "Attendance" },
  { to: "/dashboard/payroll",       icon: <DollarSign size={18} />,      label: "Payroll" },
  { to: "/dashboard/hr",            icon: <CalendarClock size={18} />,   label: "Leave Approvals" },
  { to: "/dashboard/settings",      icon: <Settings size={18} />,        label: "Configuration" },
];

const Adminsidebar = () => {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  const filtered = search.trim()
    ? NAV_ITEMS.filter(item =>
        item.label.toLowerCase().includes(search.toLowerCase())
      )
    : NAV_ITEMS;

  return (
    <aside className="bg-slate-900 text-white w-72 flex flex-col h-screen border-r border-slate-800 shadow-2xl relative overflow-hidden">
      {/* bg glow */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-indigo-500/10 blur-[80px] rounded-full -ml-10 -mt-10" />

      {/* Profile header */}
      <div className="p-8 relative z-10 border-b border-slate-800/50">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 bg-slate-800 rounded-2xl flex items-center justify-center border border-slate-700">
            <UserCircle size={28} className="text-slate-400" />
          </div>
          <div>
            <h2 className="text-[11px] font-black uppercase tracking-widest text-white">Admin Portal</h2>
            <p className="text-[9px] font-bold text-indigo-400 uppercase tracking-tighter mt-1 flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-indigo-400 animate-pulse" /> Verified Session
            </p>
          </div>
        </div>
      </div>

      {/* Search bar */}
      <div className="px-4 pt-5 pb-2 relative z-10">
        <div className="relative">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search pages..."
            className="w-full pl-9 pr-8 py-2.5 bg-slate-700 border border-slate-600 rounded-xl text-[12px] font-semibold text-slate-100 placeholder-slate-400 outline-none focus:border-indigo-500/60 focus:bg-slate-600 transition-all"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors">
              <X size={13} />
            </button>
          )}
        </div>
        {search && filtered.length === 0 && (
          <p className="text-[10px] text-slate-400 font-bold text-center mt-2">No pages found</p>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 space-y-1.5 mt-3 relative z-10 overflow-y-auto scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {!search && (
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.25em] mb-4 ml-4">Terminal Access</p>
        )}
        {filtered.map((item) => (
          <Item key={item.to} {...item} />
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 mt-auto border-t border-slate-800/50 bg-slate-950/30 relative z-10">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 p-3.5 rounded-2xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/5 transition-all group"
        >
          <div className="h-9 w-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center group-hover:bg-rose-500/10 group-hover:border-rose-500/20 transition-all">
            <LogOut size={16} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest">End Session</span>
        </button>
      </div>
    </aside>
  );
};

const Item = ({ to, icon, label, end }) => (
  <NavLink
    to={to}
    end={end}
    className={({ isActive }) =>
      `flex items-center justify-between group px-5 py-4 rounded-2xl transition-all duration-300 ${
        isActive
          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
          : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-100"
      }`
    }
  >
    {({ isActive }) => (
      <>
        <div className="flex items-center gap-4">
          <span className="transition-transform group-hover:scale-110 duration-300">{icon}</span>
          <span className="text-[11px] font-black uppercase tracking-[0.15em]">{label}</span>
        </div>
        {isActive && (
          <div className="w-1 h-3 rounded-full bg-indigo-300 shadow-[0_0_8px_#818cf8]" />
        )}
      </>
    )}
  </NavLink>
);

export default Adminsidebar;