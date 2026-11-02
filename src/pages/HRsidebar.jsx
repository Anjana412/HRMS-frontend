import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  BarChart2,
  Users,
  CalendarCheck,
  ListTodo,
  FileText,
  Settings,
  PlusCircle,
  Search,
  X,
  LogOut,
  UserPlus,
  DollarSign
} from "lucide-react";

const NAV_ITEMS = [
  { to: "/dashboard",                icon: <BarChart2 size={20} />,    label: "Analytics",       end: true },
  { to: "/dashboard/employees",      icon: <Users size={20} />,        label: "Team Members" },
  { to: "/dashboard/adduser",        icon: <UserPlus size={20} />,     label: "Add User" },
  { to: "/dashboard/attendance",     icon: <CalendarCheck size={20} />,label: "Attendance" },
  { to: "/dashboard/tasks",          icon: <ListTodo size={20} />,     label: "Task Status" },
  { to: "/dashboard/assigntask",     icon: <PlusCircle size={20} />,   label: "New Assignment" },
  { to: "/dashboard/leave-requests", icon: <FileText size={18} />,     label: "Leave Requests" },
  { to: "/dashboard/payroll",        icon: <DollarSign size={20} />,   label: "Payroll" },
  { to: "/dashboard/settings",       icon: <Settings size={20} />,     label: "Settings" },
];

const HRsidebar = () => {
  const [search, setSearch] = useState("");

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  const filtered = search.trim()
    ? NAV_ITEMS.filter(item =>
        item.label.toLowerCase().includes(search.toLowerCase())
      )
    : NAV_ITEMS;

  const mainItems     = NAV_ITEMS.slice(0, 3);
  const workflowItems = NAV_ITEMS.slice(3);

  return (
    <aside className="bg-slate-950 text-slate-300 w-72 flex flex-col h-screen border-r border-slate-800/50 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 -left-20 w-40 h-40 bg-indigo-600/10 blur-[100px] pointer-events-none" />

      {/* Header label */}
      <div className="px-8 pt-8 pb-3">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
          HR Management
        </p>
      </div>

      {/* Search bar */}
      <div className="px-4 pb-3 relative z-10">
        <div className="relative">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search pages..."
            className="w-full pl-9 pr-8 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-[12px] font-semibold text-slate-100 placeholder-slate-400 outline-none focus:border-indigo-500/60 focus:bg-slate-700 transition-all"
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
      <nav className="flex flex-col px-4 gap-1 flex-1 overflow-y-auto">
        {search ? (
          filtered.map((item) => <Item key={item.to} {...item} />)
        ) : (
          <>
            <p className="px-4 mb-1 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Main</p>
            {mainItems.map((item) => <Item key={item.to} {...item} />)}

            <div className="my-3 border-t border-slate-800/50 mx-4" />

            <p className="px-4 mb-1 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Workflow</p>
            {workflowItems.map((item) => <Item key={item.to} {...item} />)}
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="p-4 bg-slate-900/40 border-t border-slate-800/50">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/5 transition-all group"
        >
          <LogOut size={16} />
          <span className="text-[11px] font-black uppercase tracking-widest">Sign Out</span>
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
      `flex items-center gap-4 px-4 py-3.5 rounded-[14px] transition-all duration-300 group ${
        isActive
          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
          : "hover:bg-slate-800 hover:text-white"
      }`
    }
  >
    {({ isActive }) => (
      <>
        <span className={`${isActive ? "text-white" : "text-slate-500 group-hover:text-indigo-400"} transition-colors`}>
          {icon}
        </span>
        <span className="text-sm font-bold tracking-tight">{label}</span>
        {isActive && (
          <div className="ml-auto h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_10px_white]" />
        )}
      </>
    )}
  </NavLink>
);

export default HRsidebar;