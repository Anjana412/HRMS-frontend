import React, { useState, useEffect } from "react";
import {
  PieChart, Pie, Cell, AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, BarChart, Bar, YAxis
} from "recharts";
import {
  Users, FolderKanban, TrendingUp, Activity,
  Loader2, CalendarCheck, ListTodo, CalendarClock,
  ShieldCheck, UserCheck, Briefcase
} from "lucide-react";
import { getUsersByType, getAllTasks, getAllAttendance, getAllLeaveRequests } from "../api/api";

const COLORS = ["#7c3aed", "#0d9488", "#0ea5e9", "#10b981", "#f59e0b", "#6366f1"];

const Managerdashboard = () => {
  const [data, setData] = useState({
    employees: [], hrs: [], directors: [], pms: [], coordinators: [], teamleads: [],
    tasks: [], attendance: [], leaves: [], loading: true
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [empData, hrData, dirData, pmData, pcData, tlData, taskData, attData, leaveData] = await Promise.all([
          getUsersByType("employee"),
          getUsersByType("hr"),
          getUsersByType("manager").catch(() => ({ users: [] })),
          getUsersByType("projectmanager").catch(() => ({ users: [] })),
          getUsersByType("projectcoordinator").catch(() => ({ users: [] })),
          getUsersByType("teamlead").catch(() => ({ users: [] })),
          getAllTasks(),
          getAllAttendance(),
          getAllLeaveRequests().catch(() => []),
        ]);

        const safe = (d) => Array.isArray(d) ? d : (d?.users || d?.data || []);

        setData({
          employees:    safe(empData),
          hrs:          safe(hrData),
          directors:    safe(dirData),
          pms:          safe(pmData),
          coordinators: safe(pcData),
          teamleads:    safe(tlData),
          tasks:        safe(taskData),
          attendance:   Array.isArray(attData) ? attData : (attData?.attendance || []),
          leaves:       safe(leaveData),
          loading: false
        });
      } catch (error) {
        console.error("Director Dashboard Error:", error);
        setData(prev => ({ ...prev, loading: false }));
      }
    };
    fetchData();
  }, []);

  if (data.loading) return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50 gap-4">
      <Loader2 className="animate-spin text-violet-600" size={48} />
      <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest">Loading Executive Overview...</p>
    </div>
  );

  const totalStaff = data.employees.length + data.hrs.length + data.pms.length + data.coordinators.length + data.teamleads.length;

  const staffDistribution = [
    { name: "Employees",    value: data.employees.length },
    { name: "HR",           value: data.hrs.length },
    { name: "Project Mgr",  value: data.pms.length },
    { name: "Coordinators", value: data.coordinators.length },
    { name: "Team Leads",   value: data.teamleads.length },
    { name: "Managers",    value: data.directors.length },
  ].filter(d => d.value > 0);

  const safeTasks  = Array.isArray(data.tasks)  ? data.tasks  : [];
  const safeLeaves = Array.isArray(data.leaves) ? data.leaves : [];

  const tasksByStatus = [
    { name: "Pending",    value: safeTasks.filter(t => t.status === "pending" || t.status === "assigned").length },
    { name: "Completed",  value: safeTasks.filter(t => t.status === "completed").length },
    { name: "In Progress",value: safeTasks.filter(t => t.status === "in-progress").length },
  ];

  const today = new Date().toDateString();
  const presentToday = data.attendance.filter(r => {
    const d = r.date || r.checkIn;
    return d && new Date(d).toDateString() === today;
  }).length;

  const pendingLeaves   = safeLeaves.filter(l => l.status === "pending").length;
  const completedTasks  = safeTasks.filter(t => t.status === "completed").length;
  const taskRate        = safeTasks.length > 0 ? Math.round((completedTasks / safeTasks.length) * 100) : 0;

  const safeAtt = Array.isArray(data.attendance) ? data.attendance : [];
  const attendanceTrend = safeAtt.length > 0
    ? safeAtt.slice(-6).map(r => ({
        name:  r.date ? new Date(r.date).toLocaleDateString("en-US", { weekday: "short" }) : "N/A",
        count: safeAtt.filter(x => x.date === r.date).length
      }))
    : [{ name: "No Data", count: 0 }];

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8 bg-slate-50/30 min-h-screen">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tighter uppercase">
            Executive Overview
          </h1>
          <p className="text-slate-500 font-bold text-xs uppercase tracking-[0.2em] mt-2 flex items-center gap-2">
            <ShieldCheck size={14} className="text-violet-600" />
            Manager Access · Full Org View
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </p>
        </div>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        <StatCard icon={<Users size={20} />}        title="Total Staff"       value={totalStaff}         subtitle="Across all roles"     color="text-violet-600" />
        <StatCard icon={<ListTodo size={20} />}     title="Total Tasks"       value={safeTasks.length}   subtitle={`${taskRate}% completed`} color="text-teal-600" />
        <StatCard icon={<CalendarCheck size={20} />} title="Present Today"    value={presentToday}       subtitle="Checked in"           color="text-emerald-600" />
        <StatCard icon={<CalendarClock size={20} />} title="Leave Requests"   value={pendingLeaves}      subtitle="Awaiting approval"    color="text-amber-600" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">

        {/* Staff distribution pie */}
        <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Staff Distribution</h3>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={staffDistribution} dataKey="value" innerRadius={50} outerRadius={75} paddingAngle={8}>
                  {staffDistribution.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} cornerRadius={8} stroke="none" />)}
                </Pie>
                <Tooltip contentStyle={{ border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)", borderRadius: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-1.5 mt-3">
            {staffDistribution.map((item, i) => (
              <div key={item.name} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                <span className="text-[10px] font-bold text-slate-500 truncate">{item.name} ({item.value})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Attendance trend */}
        <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6">Attendance Trend</h3>
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={attendanceTrend}>
                <defs>
                  <linearGradient id="dirGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#7c3aed" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800, fill: "#94a3b8" }} />
                <Tooltip cursor={{ stroke: "#7c3aed", strokeWidth: 2 }} />
                <Area type="monotone" dataKey="count" stroke="#7c3aed" strokeWidth={4} fill="url(#dirGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">

        {/* Task breakdown bar chart */}
        <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-[2rem] border border-slate-100 shadow-sm">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6">Task Breakdown</h3>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tasksByStatus} barSize={40}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800, fill: "#94a3b8" }} />
                <YAxis hide />
                <Tooltip cursor={{ fill: "#f1f5f9" }} contentStyle={{ border: "none", borderRadius: 12 }} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {tasksByStatus.map((_, i) => (
                    <Cell key={i} fill={["#f59e0b", "#10b981", "#6366f1"][i]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Org snapshot */}
        <div className="bg-slate-900 p-6 md:p-8 rounded-[2rem] shadow-2xl text-white flex flex-col gap-4">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Org Snapshot</p>
          {[
            { label: "Managers",           value: data.directors.length,    color: "#7c3aed", icon: <ShieldCheck size={14}/> },
            { label: "HR Personnel",        value: data.hrs.length,          color: "#6366f1", icon: <UserCheck size={14}/> },
            { label: "Project Managers",    value: data.pms.length,          color: "#0d9488", icon: <Briefcase size={14}/> },
            { label: "Coordinators",        value: data.coordinators.length, color: "#0ea5e9", icon: <Activity size={14}/> },
            { label: "Team Leads",          value: data.teamleads.length,    color: "#10b981", icon: <Users size={14}/> },
            { label: "Employees",           value: data.employees.length,    color: "#f59e0b", icon: <Users size={14}/> },
          ].map(item => (
            <div key={item.label} className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/50 hover:bg-slate-800 transition-all">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: item.color + "22", color: item.color }}>
                  {item.icon}
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{item.label}</p>
              </div>
              <span className="text-xl font-black tracking-tighter" style={{ color: item.color }}>{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, title, value, subtitle, color }) => (
  <div className="bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
    <div className="flex items-center gap-3 md:gap-4">
      <div className={`p-3 md:p-4 rounded-xl md:rounded-2xl bg-slate-50 ${color} group-hover:bg-slate-900 group-hover:text-white transition-all duration-300 flex-shrink-0`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 truncate">{title}</p>
        <p className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter">{value}</p>
        <p className="text-[9px] md:text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-tight truncate">{subtitle}</p>
      </div>
    </div>
  </div>
);

export default Managerdashboard;