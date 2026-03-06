import React from "react";
import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard, 
  ShieldCheck, 
  Users, 
  FileCode2, 
  Settings, 
  LogOut,
  UserCircle,
  Clock // Added for attendance
} from "lucide-react";

const Adminsidebar = () => {
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  return (
    <aside className="bg-slate-900 text-white w-72 flex flex-col h-screen border-r border-slate-800 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 left-0 w-32 h-32 bg-indigo-500/10 blur-[80px] rounded-full -ml-10 -mt-10" />

      <div className="p-8 relative z-10 border-b border-slate-800/50">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 bg-slate-800 rounded-2xl flex items-center justify-center border border-slate-700">
            <UserCircle size={28} className="text-slate-400" />
          </div>
          <div>
            <h2 className="text-[11px] font-black uppercase tracking-widest text-white">Admin Portal</h2>
            <p className="text-[9px] font-bold text-indigo-400 uppercase tracking-tighter mt-1 flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-indigo-400 animate-pulse"></span> Verified Session
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-8 relative z-10">
        <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.25em] mb-6 ml-4">Terminal Access</p>
        
        <Item to="/dashboard" icon={<LayoutDashboard size={18} />} label="Dashboard" end />
        <Item to="/dashboard/hr" icon={<ShieldCheck size={18} />} label="HR Personnel" />
        <Item to="/dashboard/employees" icon={<Users size={18} />} label="Staff Directory" />
        
        {/* NEW ATTENDANCE FIELD */}
        <Item to="/dashboard/allattendance" icon={<Clock size={18} />} label="Workforce Attendance" />
        
        <Item to="/dashboard/documents" icon={<FileCode2 size={18} />} label="System Docs" />
        <Item to="/dashboard/settings" icon={<Settings size={18} />} label="Configuration" />
      </nav>

      <div className="p-4 mt-auto border-t border-slate-800/50 bg-slate-950/30">
        <button onClick={handleLogout} className="w-full flex items-center gap-3 p-3.5 rounded-2xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/5 transition-all group">
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
          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 active-glow" 
          : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-100"
      }`
    }
  >
    <div className="flex items-center gap-4">
      <span className="transition-transform group-hover:scale-110 duration-300">{icon}</span>
      <span className="text-[11px] font-black uppercase tracking-[0.15em]">{label}</span>
    </div>
    <div className="w-1 h-3 rounded-full bg-indigo-300 opacity-0 group-[.active]:opacity-100 shadow-[0_0_8px_#818cf8] transition-all" />
  </NavLink>
);

export default Adminsidebar;