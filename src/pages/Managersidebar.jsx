import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard, FolderKanban, Users, ShieldCheck,
  BarChart3, Settings, LogOut, Search, X, ChevronRight, UserPlus
} from "lucide-react";

const NAV_SECTIONS = [
  {
    label: "Main",
    items: [
      { to: "/dashboard",           icon: <LayoutDashboard size={20} />, label: "Overview",      end: true },
      { to: "/dashboard/projects",  icon: <FolderKanban size={20} />,    label: "All Projects" },
      { to: "/dashboard/employees", icon: <Users size={20} />,           label: "Staff Directory" },
    ]
  },
  {
    label: "Management",
    items: [
      { to: "/dashboard/hr",        icon: <ShieldCheck size={20} />,     label: "HR Personnel" },
      { to: "/dashboard/adduser",    icon: <UserPlus size={20} />,        label: "Add User" },
      { to: "/dashboard/settings",  icon: <Settings size={20} />,        label: "Settings" },
    ]
  }
];

const Managersidebar = () => {
  const [search, setSearch] = useState("");
  const userId = localStorage.getItem("id");

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  const allItems = NAV_SECTIONS.flatMap(s => s.items);
  const filtered = search.trim()
    ? allItems.filter(i => i.label.toLowerCase().includes(search.toLowerCase()))
    : null;

  return (
    <aside className="bg-slate-950 text-slate-300 w-72 flex flex-col h-screen border-r border-slate-800/50 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 -left-20 w-40 h-40 bg-violet-600/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-40 h-40 bg-indigo-600/8 blur-[100px] pointer-events-none" />

      {/* Header */}
      <div className="px-6 pt-7 pb-4 border-b border-slate-800/50">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
            <span className="text-white font-black text-sm">D</span>
          </div>
          <div>
            <p className="text-[11px] font-black uppercase tracking-widest text-white">Manager Portal</p>
            <p className="text-[9px] font-bold text-violet-400 uppercase tracking-wider mt-0.5 flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-violet-400 animate-pulse" /> Manager Access
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="px-4 pt-4 pb-2">
        <div className="relative">
          <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search pages..."
            className="w-full pl-9 pr-8 py-2.5 bg-slate-800/70 border border-slate-700/50 rounded-xl text-[12px] font-semibold text-slate-100 placeholder-slate-500 outline-none focus:border-violet-500/50 transition-all"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 overflow-y-auto mt-2 space-y-5">
        {filtered ? (
          <div className="space-y-1">
            {filtered.length === 0
              ? <p className="text-[10px] text-slate-500 font-bold text-center mt-4">No pages found</p>
              : filtered.map(item => <Item key={item.to} {...item} />)
            }
          </div>
        ) : (
          NAV_SECTIONS.map(section => (
            <div key={section.label}>
              <p className="px-2 mb-2 text-[9px] font-black uppercase tracking-[0.3em] text-slate-600">{section.label}</p>
              <div className="space-y-1">
                {section.items.map(item => <Item key={item.to} {...item} />)}
              </div>
            </div>
          ))
        )}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-800/50">
        <div className="bg-slate-900/40 border border-slate-800/50 rounded-2xl p-2.5 flex items-center gap-3 mb-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center font-black text-white text-[10px] shadow-lg shadow-violet-500/20">
            {userId ? userId.charAt(0).toUpperCase() : "D"}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-xs font-black text-white truncate uppercase tracking-tighter">Manager</p>
            <p className="text-[9px] font-medium text-violet-400 truncate uppercase tracking-widest">Manager Portal</p>
          </div>
          <ChevronRight size={12} className="text-slate-600" />
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/5 transition-all"
        >
          <LogOut size={15} />
          <span className="text-[10px] font-black uppercase tracking-widest">Sign Out</span>
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
      `flex items-center gap-4 px-4 py-3 rounded-[14px] transition-all duration-300 group relative overflow-hidden ${
        isActive
          ? "bg-violet-600 text-white shadow-lg shadow-violet-600/25"
          : "hover:bg-slate-800/40 hover:text-white"
      }`
    }
  >
    {({ isActive }) => (
      <>
        <span className={`${isActive ? "text-white" : "text-slate-500 group-hover:text-violet-400"} transition-colors`}>
          {icon}
        </span>
        <span className="text-sm font-bold tracking-tight">{label}</span>
        {isActive
          ? <div className="ml-auto h-1 w-1 rounded-full bg-white shadow-[0_0_10px_white]" />
          : <ChevronRight size={14} className="ml-auto opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-slate-700" />
        }
      </>
    )}
  </NavLink>
);

export default Managersidebar;