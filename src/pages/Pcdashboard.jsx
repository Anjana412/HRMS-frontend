import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Users, ListTodo, CalendarCheck, Loader2, ChevronRight, Clock } from "lucide-react";
import { getMyTeam, getAllTasks, getMyAttendance } from "../api/api";

const PCdashboard = () => {
  const navigate  = useNavigate();
  const [team, setTeam]         = useState([]);
  const [tasks, setTasks]       = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [teamData, taskData, attData] = await Promise.allSettled([
          getMyTeam(),
          getAllTasks(),
          getMyAttendance(),
        ]);
        setTeam(teamData.status === "fulfilled" ? (teamData.value?.users || []) : []);
        setTasks(taskData.status === "fulfilled" ? (Array.isArray(taskData.value) ? taskData.value : []) : []);
        setAttendance(attData.status === "fulfilled" ? (Array.isArray(attData.value) ? attData.value : []) : []);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return (
    <div className="h-full flex flex-col items-center justify-center gap-3">
      <Loader2 className="animate-spin text-sky-600" size={40} />
      <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Loading dashboard...</p>
    </div>
  );

  const teamleads = team.filter(u => u.usertype === "teamlead");
  const employees = team.filter(u => u.usertype === "employee");
  const myTasks   = tasks.filter(t => t.status !== "completed");
  const todayAtt  = attendance.find(r => r.date && new Date(r.date).toDateString() === new Date().toDateString());

  return (
    <div className="p-4 md:p-8 space-y-6 min-h-screen bg-slate-50/30">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Coordinator Hub</h1>
        <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-1 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
          Project Coordinator · Team & task overview
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Users size={18}/>}        title="Team Leads"    value={teamleads.length} sub="Under you"        color="text-sky-600"     onClick={() => navigate("/dashboard/employees")} />
        <StatCard icon={<Users size={18}/>}        title="Employees"     value={employees.length} sub="Total staff"      color="text-teal-600"    onClick={() => navigate("/dashboard/employees")} />
        <StatCard icon={<ListTodo size={18}/>}     title="Active Tasks"  value={myTasks.length}   sub="In progress"     color="text-indigo-600"  onClick={() => navigate("/dashboard/tasks")} />
        <StatCard icon={<Clock size={18}/>}        title="Today"         value={todayAtt ? (todayAtt.checkOut ? "Done" : "In") : "Out"} sub="Attendance status" color="text-emerald-600" onClick={() => navigate("/dashboard/empattendance")} />
      </div>

      {/* Team list */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <div className="bg-white rounded-[1.5rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Team Leads Under Me</h3>
            <button onClick={() => navigate("/dashboard/employees")} className="text-[10px] font-black uppercase tracking-widest text-sky-600 flex items-center gap-1">
              View All <ChevronRight size={12} />
            </button>
          </div>
          {teamleads.length === 0 ? (
            <div className="py-12 text-center text-slate-300 font-bold text-sm">No team leads assigned yet</div>
          ) : (
            <div className="divide-y divide-slate-50">
              {teamleads.map(tl => (
                <div key={tl._id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50/50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/profile/${tl._id}`)}>
                  {tl.photo
                    ? <img src={tl.photo} alt={tl.name} className="h-10 w-10 rounded-xl object-cover" />
                    : <div className="h-10 w-10 rounded-xl bg-sky-600 flex items-center justify-center text-white font-black text-sm">{tl.name?.charAt(0)}</div>
                  }
                  <div>
                    <p className="text-sm font-black text-slate-900">{tl.name}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">{tl.department || "Team Lead"}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-[1.5rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Active Tasks</h3>
            <button onClick={() => navigate("/dashboard/tasks")} className="text-[10px] font-black uppercase tracking-widest text-sky-600 flex items-center gap-1">
              View All <ChevronRight size={12} />
            </button>
          </div>
          {myTasks.length === 0 ? (
            <div className="py-12 text-center text-slate-300 font-bold text-sm">No active tasks</div>
          ) : (
            <div className="divide-y divide-slate-50">
              {myTasks.slice(0, 5).map(task => (
                <div key={task._id} className="flex items-center justify-between px-6 py-4">
                  <div>
                    <p className="text-sm font-black text-slate-900">{task.title}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">
                      {task.assignedTo?.name || "Unassigned"}
                    </p>
                  </div>
                  <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg ${
                    task.status === "pending"   ? "bg-amber-50 text-amber-700" :
                    task.status === "assigned"  ? "bg-blue-50 text-blue-700" :
                    "bg-slate-50 text-slate-600"
                  }`}>{task.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, title, value, sub, color, onClick }) => (
  <div onClick={onClick} className={`bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all ${onClick ? "cursor-pointer" : ""}`}>
    <div className="flex items-center gap-3">
      <div className={`p-3 rounded-xl bg-slate-50 ${color}`}>{icon}</div>
      <div>
        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{title}</p>
        <p className="text-2xl font-black text-slate-900 tracking-tighter">{value}</p>
        <p className="text-[9px] font-bold text-slate-400 uppercase">{sub}</p>
      </div>
    </div>
  </div>
);

export default PCdashboard;