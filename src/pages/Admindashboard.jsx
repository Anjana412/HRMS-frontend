import React, { useState, useEffect, useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell
} from "recharts";
import {
  Users, CalendarCheck, FileText, ListTodo,
  Loader2, TrendingUp, CheckCircle2, Clock, AlertTriangle,
  FolderKanban, Plus, ArrowUpRight, UserX, TimerOff
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  getMyTeam, getAllAttendance, getAllLeaveRequests,
  getAllTasks, getAllPayroll, getAllProjects
} from "../api/api";

const ROLE_LABELS = {
  admin: "Admin", manager: "Manager", hr: "HR",
  projectmanager: "PM", projectcoordinator: "PC",
  teamlead: "Team Lead", employee: "Employee",
};
const ROLE_COLORS = {
  admin: "#1e293b", manager: "#7c3aed", hr: "#6366f1",
  projectmanager: "#0d9488", projectcoordinator: "#0ea5e9",
  teamlead: "#10b981", employee: "#64748b",
};
const DAYS   = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const Admindashboard = () => {
  const [team,       setTeam]       = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [leaves,     setLeaves]     = useState([]);
  const [tasks,      setTasks]      = useState([]);
  const [payrolls,   setPayrolls]   = useState([]);
  const [projects,   setProjects]   = useState([]);
  const [loading,    setLoading]    = useState(true);

  const now   = new Date();
  const month = now.getMonth();
  const year  = now.getFullYear();

  useEffect(() => {
    const load = async () => {
      try {
        const [teamData, attData, leaveData, taskData, payData, projData] = await Promise.all([
          getMyTeam(),
          getAllAttendance(),
          getAllLeaveRequests(),
          getAllTasks(),
          getAllPayroll({ month: month + 1, year }),
          getAllProjects(),
        ]);
        // FIX 1: exclude admin from team so counts are accurate
        const allTeam = Array.isArray(teamData) ? teamData : teamData?.users || [];
        setTeam(allTeam.filter(u => u.usertype !== "admin"));
        setAttendance(Array.isArray(attData)   ? attData   : attData?.attendance || []);
        setLeaves(    Array.isArray(leaveData) ? leaveData : leaveData?.leaves   || leaveData?.data || []);
        setTasks(     Array.isArray(taskData)  ? taskData  : taskData?.tasks     || []);
        setPayrolls(  Array.isArray(payData)   ? payData   : payData?.payrolls   || []);
        setProjects(  Array.isArray(projData)  ? projData  : projData?.projects  || []);
      } catch (err) {
        console.error("Admin Dashboard Error:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // ── Computed stats ────────────────────────────────────────────────────────
  const todayStr     = now.toISOString().split("T")[0];
  const presentToday = new Set(
    attendance.filter(r => new Date(r.date).toISOString().split("T")[0] === todayStr)
      .map(r => r.employee?._id)
  ).size;

  // FIX 4: absent count = non-admin staff - present today
  const absentToday = Math.max(0, team.length - presentToday);

  // Admin only needs to see pending leaves from managers
  const pendingLeaves = leaves.filter(
    l => l.status === "pending" && l.employee?.usertype === "manager"
  ).length;

  // FIX 5: overdue tasks = past dueDate and not completed/cancelled
  const overdueTasks = tasks.filter(t => {
    if (!t.dueDate) return false;
    if (t.status === "completed" || t.status === "cancelled") return false;
    return new Date(t.dueDate) < now;
  }).length;
  const openTasks = tasks.filter(t => t.status !== "completed" && t.status !== "cancelled").length;

  const paidPayroll  = payrolls.filter(p => p.status === "paid").length;
  const draftPayroll = payrolls.filter(p => p.status === "draft").length;
  // FIX 2: use filtered team (no admin) for correct not-generated count
  const notGenerated = Math.max(0, team.length - paidPayroll - draftPayroll);

  // ── Project stats ─────────────────────────────────────────────────────────
  const activeProjects    = projects.filter(p => p.status === "active").length;
  const completedProjects = projects.filter(p => p.status === "completed").length;
  const onHoldProjects    = projects.filter(p => p.status === "on-hold" || p.status === "onhold").length;
  const projectRate       = projects.length > 0
    ? Math.round((completedProjects / projects.length) * 100) : 0;

  // ── Top absent employees — FIX 9: only show below 75% threshold ──────────
  const topAbsent = useMemo(() => {
    const empMap = {};
    team.forEach(u => { empMap[u._id] = { name: u.name, role: u.usertype, photo: u.photo, days: 0 }; });
    attendance.forEach(r => {
      const d = new Date(r.date);
      if (d.getMonth() !== month || d.getFullYear() !== year) return;
      const id = r.employee?._id;
      if (id && empMap[id]) empMap[id].days++;
    });
    const workingDays = (() => {
      let wd = 0;
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      for (let d = 1; d <= Math.min(daysInMonth, now.getDate()); d++) {
        if (new Date(year, month, d).getDay() !== 0 && new Date(year, month, d).getDay() !== 6) wd++;
      }
      return wd || 1;
    })();
    return Object.values(empMap)
      .map(e => ({ ...e, rate: Math.round((e.days / workingDays) * 100) }))
      .filter(e => e.rate < 75)   // FIX 9: only show below 75%
      .sort((a, b) => a.rate - b.rate)
      .slice(0, 5);
  }, [team, attendance, month, year]);

  // ── Staff by role bar chart ───────────────────────────────────────────────
  const staffByRole = useMemo(() => {
    const counts = {};
    team.forEach(u => { counts[u.usertype] = (counts[u.usertype] || 0) + 1; });
    return Object.entries(counts)
      .map(([role, count]) => ({ role: ROLE_LABELS[role] || role, count, color: ROLE_COLORS[role] || "#6366f1" }))
      .sort((a, b) => b.count - a.count);
  }, [team]);

  // ── FIX 8: Weekly attendance with date range label ────────────────────────
  const { weeklyAttendance, weekRangeLabel } = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, i) => {
      const d    = new Date(now);
      d.setDate(d.getDate() - (6 - i));
      const dStr = d.toISOString().split("T")[0];
      const count = new Set(
        attendance.filter(r => new Date(r.date).toISOString().split("T")[0] === dStr)
          .map(r => r.employee?._id)
      ).size;
      return { day: DAYS[d.getDay()], date: d, count };
    });
    const fmt  = d => d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
    const label = `${fmt(days[0].date)} – ${fmt(days[6].date)}`;
    return { weeklyAttendance: days, weekRangeLabel: label };
  }, [attendance]);

  // ── Leave breakdown donut (admin sees manager leaves only) ───────────────
  const leaveBreakdown = useMemo(() => {
    const managerLeaves = leaves.filter(l => l.employee?.usertype === "manager");
    const pending  = managerLeaves.filter(l => l.status === "pending").length;
    const approved = managerLeaves.filter(l => l.status === "approved").length;
    const rejected = managerLeaves.filter(l => l.status === "rejected").length;
    return [
      { name: "Pending",  value: pending,  color: "#f59e0b" },
      { name: "Approved", value: approved, color: "#10b981" },
      { name: "Rejected", value: rejected, color: "#ef4444" },
    ].filter(d => d.value > 0);
  }, [leaves]);

  // ── Recent activity ───────────────────────────────────────────────────────
  const recentActivity = useMemo(() => {
    return [...attendance]
      .sort((a, b) => new Date(b.checkIn || 0) - new Date(a.checkIn || 0))
      .slice(0, 6);
  }, [attendance]);

  if (loading) return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50 gap-4">
      <Loader2 className="animate-spin text-indigo-600" size={48} />
      <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest">Loading Dashboard...</p>
    </div>
  );

  return (
    <div className="p-4 md:p-8 space-y-6 bg-slate-50/30 min-h-screen font-sans">

      {/* ── Header ── */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Admin Dashboard</h1>
        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">
          {now.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>

      {/* ── Stat Cards — 6 cards: 2 rows of 3 ── */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard icon={<Users size={20} />}        label="Total Staff"            value={team.length}    color="text-indigo-600"  bg="bg-indigo-50" />
        <StatCard icon={<CalendarCheck size={20} />} label="Present Today"         value={presentToday}   color="text-emerald-600" bg="bg-emerald-50" />
        {/* FIX 4: Absent today */}
        <StatCard icon={<UserX size={20} />}         label="Absent Today"          value={absentToday}    color="text-rose-600"    bg="bg-rose-50" />
        <StatCard icon={<FolderKanban size={20} />}  label="Active Projects"       value={activeProjects} color="text-teal-600"    bg="bg-teal-50" />
        <StatCard icon={<AlertTriangle size={20} />} label="Manager Leave Requests" value={pendingLeaves} color="text-amber-600"   bg="bg-amber-50" />
        {/* FIX 5: Overdue tasks */}
        <StatCard icon={<TimerOff size={20} />}      label="Overdue Tasks"         value={overdueTasks}   color="text-orange-600"  bg="bg-orange-50"
          highlight={overdueTasks > 0} />
      </div>

      {/* ── Quick Actions ── */}
      <div className="bg-slate-900 p-6 rounded-[1.5rem] shadow-xl">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-2 w-6 bg-indigo-500 rounded-full" />
          <p className="text-white text-xs font-black uppercase tracking-widest">Quick Actions</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Add User",       to: "adduser",       color: "text-indigo-400" },
            { label: "View Payroll",   to: "payroll",       color: "text-emerald-400" },
            { label: "Manager Leaves", to: "hr",            color: "text-amber-400" },
            { label: "All Attendance", to: "allattendance", color: "text-violet-400" },
          ].map(({ label, to, color }) => (
            <Link key={to} to={to}
              className="group bg-slate-800 hover:bg-white p-4 rounded-xl flex items-center justify-between transition-all duration-200">
              <span className="text-sm font-bold text-white group-hover:text-slate-900">{label}</span>
              <ArrowUpRight size={15} className={`${color} group-hover:text-slate-400`} />
            </Link>
          ))}
        </div>
      </div>

      {/* ── Charts Row 1 ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Staff by Role */}
        <div className="lg:col-span-2 bg-white rounded-[1.5rem] border border-slate-100 shadow-sm p-6">
          <p className="text-xs font-black uppercase tracking-widest text-slate-500 mb-5">Staff by Role</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={staffByRole} layout="vertical" margin={{ left: 10, right: 20, top: 0, bottom: 0 }}>
                <CartesianGrid horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" axisLine={false} tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <YAxis type="category" dataKey="role" axisLine={false} tickLine={false}
                  tick={{ fill: "#475569", fontSize: 11, fontWeight: 700 }} width={80} />
                <Tooltip
                  cursor={{ fill: "#f8fafc" }}
                  contentStyle={{ borderRadius: "12px", border: "0.5px solid #e2e8f0", fontSize: 12 }} />
                <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={18}>
                  {staffByRole.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Manager Leave Breakdown donut */}
        <div className="bg-white rounded-[1.5rem] border border-slate-100 shadow-sm p-6">
          <p className="text-xs font-black uppercase tracking-widest text-slate-500 mb-5">Manager Leave Requests</p>
          {leaveBreakdown.length === 0 ? (
            <div className="h-56 flex flex-col items-center justify-center gap-2">
              <CheckCircle2 size={28} className="text-emerald-300" />
              <p className="text-slate-300 font-bold text-sm">No manager leaves</p>
              <p className="text-slate-300 font-medium text-xs">All managers are present</p>
            </div>
          ) : (
            <div className="h-56 flex flex-col items-center justify-center">
              <ResponsiveContainer width="100%" height="75%">
                <PieChart>
                  <Pie data={leaveBreakdown} dataKey="value" innerRadius={50} outerRadius={70} paddingAngle={4}>
                    {leaveBreakdown.map((entry, i) => (
                      <Cell key={i} fill={entry.color} strokeWidth={0} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: "12px", border: "0.5px solid #e2e8f0", fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex items-center gap-4 mt-2">
                {leaveBreakdown.map((d, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full" style={{ background: d.color }} />
                    <span className="text-[10px] font-bold text-slate-500">{d.name} {d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Charts Row 2 ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* FIX 8: Weekly Attendance with date range */}
        <div className="lg:col-span-2 bg-white rounded-[1.5rem] border border-slate-100 shadow-sm p-6">
          <div className="flex items-start justify-between mb-5">
            <p className="text-xs font-black uppercase tracking-widest text-slate-500">
              Attendance This Week
            </p>
            <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
              {weekRangeLabel}
            </span>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyAttendance} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="attGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" axisLine={false} tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 700 }} />
                <YAxis axisLine={false} tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: "12px", border: "0.5px solid #e2e8f0", fontSize: 12 }}
                  formatter={v => [v, "Present"]} />
                <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2.5}
                  fill="url(#attGrad)" dot={{ fill: "#6366f1", r: 3 }} activeDot={{ r: 5 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payroll Status — FIX 2: corrected not-generated count */}
        <div className="bg-slate-900 rounded-[1.5rem] shadow-sm p-6 flex flex-col gap-4">
          <p className="text-xs font-black uppercase tracking-widest text-slate-400">
            Payroll — {MONTHS[month]} {year}
          </p>
          <div className="flex-1 flex flex-col gap-3 justify-center">
            <div className="bg-slate-800 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 rounded-xl">
                  <CheckCircle2 size={16} className="text-emerald-400" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Paid</p>
                  <p className="text-xs text-slate-400 font-bold">{paidPayroll} employees</p>
                </div>
              </div>
              <span className="text-2xl font-black text-emerald-400">{paidPayroll}</span>
            </div>
            <div className="bg-slate-800 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/10 rounded-xl">
                  <Clock size={16} className="text-amber-400" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Draft</p>
                  <p className="text-xs text-slate-400 font-bold">{draftPayroll} employees</p>
                </div>
              </div>
              <span className="text-2xl font-black text-amber-400">{draftPayroll}</span>
            </div>
            <div className="bg-slate-800 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-rose-500/10 rounded-xl">
                  <AlertTriangle size={16} className="text-rose-400" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Not Generated</p>
                  <p className="text-xs text-slate-400 font-bold">{notGenerated} employees</p>
                </div>
              </div>
              <span className="text-2xl font-black text-rose-400">{notGenerated}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Project Completion + Low Attendance ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Project Completion Rate */}
        <div className="bg-white rounded-[1.5rem] border border-slate-100 shadow-sm p-6">
          <p className="text-xs font-black uppercase tracking-widest text-slate-500 mb-5">Project Status</p>
          <div className="flex items-center gap-6 mb-5">
            <div className="relative h-24 w-24 shrink-0">
              <svg viewBox="0 0 36 36" className="h-24 w-24 -rotate-90">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f1f5f9" strokeWidth="3" />
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#6366f1" strokeWidth="3"
                  strokeDasharray={`${projectRate} ${100 - projectRate}`}
                  strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-slate-900">{projectRate}%</span>
                <span className="text-[9px] font-black text-slate-400 uppercase">Done</span>
              </div>
            </div>
            <div className="space-y-3 flex-1">
              {[
                { label: "Active",    value: activeProjects,    color: "bg-teal-500" },
                { label: "Completed", value: completedProjects, color: "bg-indigo-500" },
                { label: "On Hold",   value: onHoldProjects,    color: "bg-amber-500" },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${color}`} />
                    <span className="text-xs font-bold text-slate-600">{label}</span>
                  </div>
                  <span className="text-sm font-black text-slate-900">{value}</span>
                </div>
              ))}
              <div className="flex items-center justify-between border-t border-slate-100 pt-2">
                <span className="text-xs font-bold text-slate-400">Total</span>
                <span className="text-sm font-black text-slate-900">{projects.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* FIX 9: Low Attendance — only below 75% */}
        <div className="bg-white rounded-[1.5rem] border border-slate-100 shadow-sm p-6">
          <div className="flex items-start justify-between mb-5">
            <p className="text-xs font-black uppercase tracking-widest text-slate-500">
              Low Attendance — {MONTHS[month]} {year}
            </p>
            <span className="text-[10px] font-bold text-slate-400 bg-amber-50 text-amber-600 border border-amber-100 px-2.5 py-1 rounded-full">
              Below 75%
            </span>
          </div>
          {topAbsent.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 gap-2">
              <CheckCircle2 size={28} className="text-emerald-300" />
              <p className="text-slate-300 font-bold text-sm">All staff above 75% attendance</p>
            </div>
          ) : (
            <div className="space-y-3">
              {topAbsent.map((emp, i) => (
                <div key={i} className="flex items-center gap-3">
                  {emp.photo
                    ? <img src={emp.photo} alt={emp.name} className="h-8 w-8 rounded-xl object-cover border border-slate-100 shrink-0" />
                    : <div className="h-8 w-8 rounded-xl bg-slate-200 flex items-center justify-center text-slate-500 text-xs font-black shrink-0">
                        {emp.name?.charAt(0).toUpperCase()}
                      </div>
                  }
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-black text-slate-800 truncate">{emp.name}</p>
                      <span className={`text-xs font-black ml-2 shrink-0 ${emp.rate < 50 ? "text-rose-500" : "text-amber-500"}`}>
                        {emp.rate}%
                      </span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${emp.rate < 50 ? "bg-rose-400" : "bg-amber-400"}`}
                        style={{ width: `${emp.rate}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── FIX 5: Overdue Tasks breakdown ── */}
      {overdueTasks > 0 && (
        <div className="bg-white rounded-[1.5rem] border border-orange-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <TimerOff size={16} className="text-orange-500" />
            <p className="text-xs font-black uppercase tracking-widest text-orange-500">
              Overdue Tasks ({overdueTasks})
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {tasks
              .filter(t => t.dueDate && new Date(t.dueDate) < now && t.status !== "completed" && t.status !== "cancelled")
              .slice(0, 6)
              .map((task, i) => {
                const daysOverdue = Math.floor((now - new Date(task.dueDate)) / (1000 * 60 * 60 * 24));
                return (
                  <div key={i} className="flex items-start gap-3 p-3 bg-orange-50 rounded-xl border border-orange-100">
                    <div className={`mt-0.5 h-2 w-2 rounded-full shrink-0 ${
                      task.priority === "Critical" ? "bg-rose-500" :
                      task.priority === "High"     ? "bg-orange-500" :
                      task.priority === "Medium"   ? "bg-amber-400" : "bg-slate-400"
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-black text-slate-800 truncate">{task.title}</p>
                      <p className="text-[10px] font-bold text-slate-400 mt-0.5 truncate">
                        → {task.assignedTo?.name || "Unassigned"}
                      </p>
                    </div>
                    <span className="text-[10px] font-black text-rose-500 shrink-0">{daysOverdue}d late</span>
                  </div>
                );
              })}
          </div>
          {overdueTasks > 6 && (
            <p className="text-xs font-bold text-slate-400 text-center mt-3">
              +{overdueTasks - 6} more overdue tasks
            </p>
          )}
        </div>
      )}

      {/* ── Recent Activity ── */}
      <div className="bg-white rounded-[1.5rem] border border-slate-100 shadow-sm p-6">
        <p className="text-xs font-black uppercase tracking-widest text-slate-500 mb-5">Recent Check-ins</p>
        {recentActivity.length === 0 ? (
          <p className="text-center py-8 text-slate-300 font-bold text-sm">No activity recorded</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {recentActivity.map((log, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                {log.employee?.photo
                  ? <img src={log.employee.photo} alt={log.employee.name} className="h-9 w-9 rounded-xl object-cover border border-slate-200 shrink-0" />
                  : <div className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white text-xs font-black shrink-0">
                      {log.employee?.name?.charAt(0).toUpperCase() || "?"}
                    </div>
                }
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-slate-900 truncate">{log.employee?.name || "Unknown"}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {log.employee?.usertype} · {new Date(log.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-black text-emerald-600">
                    {log.checkIn ? new Date(log.checkIn).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "--:--"}
                  </p>
                  <p className="text-[10px] font-bold text-slate-400">
                    {log.checkOut ? "Completed" : "Active"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

// ── Stat Card ─────────────────────────────────────────────────────────────────
const StatCard = ({ icon, label, value, color, bg, highlight }) => (
  <div className={`bg-white p-5 rounded-2xl border shadow-sm hover:shadow-md transition-all ${
    highlight ? "border-orange-200 ring-1 ring-orange-100" : "border-slate-100"
  }`}>
    <div className="flex items-center gap-3">
      <div className={`p-3 rounded-xl ${bg} ${color}`}>{icon}</div>
      <div>
        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{label}</p>
        <p className={`text-3xl font-black tracking-tighter ${highlight && value > 0 ? "text-orange-500" : "text-slate-900"}`}>
          {value}
        </p>
      </div>
    </div>
  </div>
);

export default Admindashboard;