import { NavLink } from "react-router-dom";
import {
  BarChart2,
  Users,
  CalendarCheck,
  ListTodo,
  FileText,
  Settings,
  PlusCircle
} from "lucide-react";

const HRsidebar = () => {
  return (
    <aside className="bg-slate-950 text-slate-300 w-72 flex flex-col h-screen border-r border-slate-800/50 shadow-2xl relative overflow-hidden">
      {/* Sublte background glow for depth */}
      <div className="absolute top-0 -left-20 w-40 h-40 bg-indigo-600/10 blur-[100px] pointer-events-none" />
      
      {/* SECTION LABEL */}
      <div className="px-8 pt-8 pb-4">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
          Main Management
        </p>
      </div>

      <nav className="flex flex-col px-4 gap-2 flex-1">
        <Item to="/dashboard" icon={<BarChart2 size={20} />} label="Analytics" end />
        <Item to="/dashboard/employees" icon={<Users size={20} />} label="Team Members" />
        <Item to="/dashboard/attendance" icon={<CalendarCheck size={20} />} label="Attendance" />
        
        <div className="my-4 border-t border-slate-800/50 mx-4" />
        
        <p className="px-4 mb-2 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
          Workflow
        </p>
        
        <Item to="/dashboard/tasks" icon={<ListTodo size={20} />} label="Task Status" />
        <Item to="/dashboard/assigntask" icon={<PlusCircle size={20} />} label="New Assignment" />
        <Item to="/dashboard/leave-requests" icon={<FileText size={18} />} label="Leave Requests" />    
        
        <div className="mt-auto mb-6 flex flex-col gap-2">
           <Item to="/dashboard/documents" icon={<FileText size={20} />} label="Resources" />
           <Item to="/dashboard/settings" icon={<Settings size={20} />} label="System Config" />
        </div>
      </nav>

      {/* FOOTER BADGE */}
      <div className="p-6 bg-slate-900/40 border-t border-slate-800/50">
        <div className="flex items-center gap-3 px-2">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold text-slate-400">HR Terminal Active</span>
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