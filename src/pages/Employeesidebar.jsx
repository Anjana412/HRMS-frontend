import { NavLink, useNavigate } from "react-router-dom";
import {
  Layout,
  CalendarCheck,
  ListTodo,
  CalendarOff,
  History, // Added for Status
  FileText,
  ChevronRight,
  LogOut
} from "lucide-react";

const Employeesidebar = () => {
  const navigate = useNavigate();
  const userRole = localStorage.getItem("role") || "Employee";
  const userId = localStorage.getItem("id");

  const handleProfileClick = () => {
    if (userId) navigate(`/profile/${userId}`);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <aside className="bg-slate-950 text-slate-300 w-72 flex flex-col h-screen border-r border-slate-800/50 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 -left-20 w-64 h-64 bg-indigo-600/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 -right-20 w-64 h-64 bg-emerald-600/5 blur-[120px] pointer-events-none" />
      
      <div className="h-8" />

      <nav className="flex flex-col px-4 gap-1.5 flex-1">
        <Item to="/dashboard" icon={<Layout size={20} />} label="Overview" end />
        <Item to="/dashboard/empattendance" icon={<CalendarCheck size={20} />} label="My Attendance" />
        <Item to="/dashboard/tasks" icon={<ListTodo size={20} />} label="My Tasks" />
        
        {/* SECTION DIVIDER */}
        <div className="my-3 relative py-2">
          <div className="absolute inset-0 flex items-center px-4">
            <div className="w-full border-t border-slate-800/40"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-slate-950 px-3 text-[9px] font-black uppercase tracking-[0.3em] text-slate-600">Requests</span>
          </div>
        </div>
        
        <Item to="/dashboard/request-leave" icon={<CalendarOff size={20} />} label="Request Leave" />
        
        {/* NEW ITEM: Leave Status History */}
        <Item to="/dashboard/leave-status" icon={<History size={20} />} label="Leave History" />
        
        <Item to="/dashboard/documents" icon={<FileText size={20} />} label="My Documents" />
      </nav>

      <div className="p-4 space-y-3 mb-2">
        <div 
          onClick={handleProfileClick}
          className="bg-slate-900/40 border border-slate-800/50 rounded-2xl p-2.5 flex items-center gap-3 group cursor-pointer hover:bg-slate-900/60 transition-all active:scale-95"
        >
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-black text-white text-[10px] shadow-lg shadow-indigo-500/20 uppercase">
            {userRole.charAt(0)}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-xs font-black text-white truncate uppercase tracking-tighter">
              ID: {userId ? userId.substring(0, 12) + "..." : "Guest"}
            </p>
            <p className="text-[9px] font-medium text-indigo-400 truncate uppercase tracking-widest">
              {userRole} Portal
            </p>
          </div>
          <ChevronRight size={12} className="text-slate-600 group-hover:text-white transition-colors" />
        </div>

        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2.5">
            <div className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
            </div>
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 underline underline-offset-4 decoration-indigo-500/30">
              Live Session
            </span>
          </div>
          
          <button 
            onClick={handleLogout}
            className="text-slate-600 hover:text-rose-500 transition-colors flex items-center gap-1"
          >
            <LogOut size={12} />
            <span className="text-[9px] font-black uppercase tracking-widest">Exit</span>
          </button>
        </div>
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
          ? "bg-indigo-600 text-white shadow-xl shadow-indigo-600/30 scale-[1.01]" 
          : "hover:bg-slate-800/40 hover:text-white hover:translate-x-1"
      }`
    }
  >
    {({ isActive }) => (
      <>
        {isActive && (
          <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent pointer-events-none" />
        )}
        <span className={`${isActive ? "text-white" : "text-slate-500 group-hover:text-indigo-400"} transition-colors duration-300`}>
          {icon}
        </span>
        <span className="text-sm font-bold tracking-tight z-10">{label}</span>
        {isActive ? (
          <div className="ml-auto h-1 w-1 rounded-full bg-white shadow-[0_0_10px_white] z-10" />
        ) : (
          <ChevronRight size={14} className="ml-auto opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-slate-700" />
        )}
      </>
    )}
  </NavLink>
);

export default Employeesidebar;