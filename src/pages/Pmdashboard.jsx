import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { FolderKanban, Users, ListTodo, CalendarCheck, Loader2, ChevronRight, TrendingUp } from "lucide-react";
import { getMyTeam, getAllTasks, getAllAttendance } from "../api/api";

const COLORS = ["#0d9488", "#0ea5e9", "#10b981", "#f59e0b"];

const PMdashboard = () => {
  const navigate = useNavigate();
  const [team, setTeam]         = useState([]);
  const [tasks, setTasks]       = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading]   = useState(true);
  const userName = localStorage.getItem("name") || "Project Manager";

  useEffect(() => {
    const fetch = async () => {
      try {
        const [teamData, taskData, attData] = await Promise.allSettled([
          getMyTeam(),
          getAllTasks(),
          getAllAttendance(),
        ]);
        setTeam(teamData.status === "fulfilled" ? (teamData.value?.users || []) : []);
        setTasks(taskData.status === "fulfilled" ? (Array.isArray(taskData.value) ? taskData.value : taskData.value?.tasks || []) : []);
        setAttendance(attData.status === "fulfilled" ? (attData.value?.attendance || []) : []);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return (
    <div className="h-full flex flex-col items-center justify-center gap-3">
      <Loader2 className="animate-spin text-teal-600" size={40} />
      <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Loading dashboard...</p>
    </div>
  );

  const coordinators = team.filter(u => u.usertype === "projectcoordinator");
  const teamleads    = team.filter(u => u.usertype === "teamlead");
  const employees    = team.filter(u => u.usertype === "employee");

  const pendingTasks   = tasks.filter(t => t.status === "pending" || t.status === "assigned").length;
  const completedTasks = tasks.filter(t => t.status === "completed").length;
  const taskRate       = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  const today = new Date().toDateString();
  const presentToday = attendance.filter(r => {
    const d = r.date || r.checkIn;
    return d && new Date(d).toDateString() === today;
  }).length;

  const teamDistribution = [
    { name: "Coordinators", value: coordinators.length },
    { name: "Team Leads",   value: teamleads.length },
    { name: "Employees",    value: employees.length },
  ].filter(d => d.value > 0);

  const taskChart = [
    { name: "Pending",    value: pendingTasks },
    { name: "Completed",  value: completedTasks },
    { name: "In Progress",value: tasks.filter(t => t.status === "in-progress").length },
  ];

  return (
    <div className="p-4 md:p-8 space-y-6 min-h-screen bg-slate-50/30">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Project Overview</h1>
        <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-1 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
          Project Manager · Your team at a glance
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Users size={18}/>}        title="My Team"        value={team.length}      sub="Total members"       color="text-teal-600" onClick={() => navigate("/dashboard/employees")} />
        <StatCard icon={<ListTodo size={18}/>}     title="Tasks"          value={tasks.length}     sub={`${taskRate}% done`} color="text-indigo-600" />
        <StatCard icon={<CalendarCheck size={18}/>} title="Present Today" value={presentToday}     sub="Checked in"          color="text-emerald-600" />
        <StatCard icon={<TrendingUp size={18}/>}   title="Pending Tasks"  value={pendingTasks}     sub="Need attention"      color="text-amber-600" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-[1.5rem] border border-slate-100 shadow-sm p-6">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Team Breakdown</h3>
          {teamDistribution.length > 0 ? (
            <>
              <div className="h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={teamDistribution} dataKey="value" innerRadius={45} outerRadius={70} paddingAngle={6}>
                      {teamDistribution.map((_, i) => <Cell key={i} fill={COLORS[i]} cornerRadius={6} stroke="none" />)}
                    </Pie>
                    <Tooltip contentStyle={{ border: "none", borderRadius: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-1.5 mt-3">
                {teamDistribution.map((item, i) => (
                  <div key={item.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i] }} />
                      <span className="font-bold text-slate-600">{item.name}</span>
                    </div>
                    <span className="font-black text-slate-900">{item.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-[180px] text-slate-300 font-bold text-sm">No team members yet</div>
          )}
        </div>

        <div className="lg:col-span-2 bg-white rounded-[1.5rem] border border-slate-100 shadow-sm p-6">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Task Status</h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={taskChart}>
                <defs>
                  <linearGradient id="pmGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d9488" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800, fill: "#94a3b8" }} />
                <Tooltip cursor={{ stroke: "#0d9488", strokeWidth: 2 }} />
                <Area type="monotone" dataKey="value" stroke="#0d9488" strokeWidth={3} fill="url(#pmGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Team list */}
      <div className="bg-white rounded-[1.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">My Team</h3>
          <button onClick={() => navigate("/dashboard/employees")}
            className="text-[10px] font-black uppercase tracking-widest text-teal-600 hover:text-teal-700 flex items-center gap-1">
            View All <ChevronRight size={12} />
          </button>
        </div>
        {team.length === 0 ? (
          <div className="py-16 text-center text-slate-300 font-bold text-sm">No team members assigned yet</div>
        ) : (
          <div className="divide-y divide-slate-50">
            {team.slice(0, 6).map(member => (
              <div key={member._id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50/50 transition-colors cursor-pointer"
                onClick={() => navigate(`/profile/${member._id}`)}>
                {member.photo
                  ? <img src={member.photo} alt={member.name} className="h-10 w-10 rounded-xl object-cover" />
                  : <div className="h-10 w-10 rounded-xl bg-teal-600 flex items-center justify-center text-white font-black text-sm">{member.name?.charAt(0)}</div>
                }
                <div className="flex-1">
                  <p className="text-sm font-black text-slate-900">{member.name}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{member.usertype}</p>
                </div>
                <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg ${
                  member.employmentstatus === "Active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-50 text-slate-500"
                }`}>{member.employmentstatus || "Active"}</span>
              </div>
            ))}
          </div>
        )}
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

export default PMdashboard;