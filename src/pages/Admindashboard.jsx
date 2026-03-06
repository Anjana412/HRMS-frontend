import React, { useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from "recharts";
import { Users, ShieldCheck, Clock, Activity, ArrowUpRight, Settings, UserPlus, Lock, Loader2 } from "lucide-react";
import { getUsersByType, getAllTasks, getAllAttendance } from "../api/api";

const COLORS = ["#6366f1", "#10b981", "#f59e0b"];

const Admindashboard = () => {
  const [data, setData] = useState({
    employees: [],
    hrs: [],
    tasks: [],
    attendance: [],
    loading: true
  });

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [empData, hrData, taskData, attData] = await Promise.all([
          getUsersByType("employee"),
          getUsersByType("hr"),
          getAllTasks(),
          getAllAttendance()
        ]);

        // --- THE CRITICAL FIX: ARRAY NORMALIZATION ---
        // This ensures that no matter how the backend wraps the data, we get an Array.
        const finalAttendance = Array.isArray(attData) ? attData : (attData?.attendance || attData?.data || []);
        const finalEmployees = Array.isArray(empData) ? empData : (empData?.users || empData?.data || []);
        const finalHrs = Array.isArray(hrData) ? hrData : (hrData?.users || hrData?.data || []);
        const finalTasks = Array.isArray(taskData) ? taskData : (taskData?.tasks || taskData?.data || []);

        setData({
          employees: finalEmployees,
          hrs: finalHrs,
          tasks: finalTasks,
          attendance: finalAttendance,
          loading: false
        });
      } catch (error) {
        console.error("Admin Dashboard Sync Error:", error);
        setData(prev => ({ ...prev, loading: false }));
      }
    };
    fetchAdminData();
  }, []);

  if (data.loading) return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50 gap-4">
      <Loader2 className="animate-spin text-indigo-600" size={48} />
      <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest">Synchronizing Core Systems...</p>
    </div>
  );

  // --- SAFE DATA PROCESSING ---
  
  // 1. User Distribution
  const userDistribution = [
    { name: "HR", value: data.hrs.length || 0 },
    { name: "Employees", value: data.employees.length || 0 },
  ];

  // 2. Attendance Overview (Fixes the .slice error)
  // We use a local variable to ensure we are always calling slice on an array
  const safeAttendance = Array.isArray(data.attendance) ? data.attendance : [];
  
  const attendanceOverview = safeAttendance.length > 0 
    ? safeAttendance.slice(-5).map(record => ({
        name: record.date ? new Date(record.date).toLocaleDateString('en-US', { weekday: 'short' }) : 'N/A',
        count: safeAttendance.filter(r => r.date === record.date).length
      }))
    : [{ name: "No Data", count: 0 }];

  // 3. Recent Activity List
  const recentActivity = [...safeAttendance]
    .sort((a, b) => new Date(b.checkIn || 0) - new Date(a.checkIn || 0))
    .slice(0, 5);

  return (
    <div className="p-4 lg:p-8 space-y-8 animate-in fade-in duration-700 bg-slate-50/30 min-h-screen font-sans">
      
      {/* 1. HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Admin Core</h1>
          <p className="text-slate-500 font-bold text-xs uppercase tracking-[0.2em] mt-2 flex items-center gap-2">
            <ShieldCheck size={14} className="text-indigo-600" />
            Infrastructure Status: <span className="text-emerald-500">Secure</span>
          </p>
        </div>
      </div>

      {/* 2. STATS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={<Users size={20} />} title="Total Talent" value={data.employees.length} subtitle="Active Personnel" color="text-indigo-600" />
        <StatCard icon={<Lock size={20} />} title="HR Access" value={data.hrs.length} subtitle="Admin Accounts" color="text-emerald-600" />
        <StatCard icon={<Clock size={20} />} title="System Tasks" value={data.tasks.length} subtitle="Active Operations" color="text-amber-600" />
        <StatCard icon={<Activity size={20} />} title="Attendance" value={data.attendance.length} subtitle="Logs Captured" color="text-rose-600" />
      </div>

      {/* 3. CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Distribution Chart */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-8">Access Distribution</h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={userDistribution} dataKey="value" innerRadius={60} outerRadius={80} paddingAngle={10}>
                  {userDistribution.map((_, i) => <Cell key={i} fill={COLORS[i]} cornerRadius={10} stroke="none" />)}
                </Pie>
                <Tooltip cornerRadius={12} contentStyle={{ border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Presence Metric Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-8">Presence Metric (Last 5 Logs)</h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={attendanceOverview}>
                <defs>
                  <linearGradient id="adminGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 800, fill: '#94a3b8'}} />
                <Tooltip cursor={{ stroke: '#6366f1', strokeWidth: 2 }} />
                <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={4} fill="url(#adminGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 4. ACTIVITY & CONTROL PANEL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6">Live Activity Stream</h3>
            <div className="space-y-4">
                {recentActivity.length > 0 ? recentActivity.map((log, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-transparent hover:border-slate-100 transition-all group">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white text-xs font-black shadow-lg shadow-indigo-200">
                                {log.employee?.name?.charAt(0) || "U"}
                            </div>
                            <div>
                                <p className="text-sm font-black text-slate-900 leading-none">{log.employee?.name || "Unknown User"}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-1">{log.employee?.usertype || 'Staff'} • {log.date ? new Date(log.date).toLocaleDateString() : 'Today'}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="text-xs font-black text-indigo-600 bg-white px-3 py-1 rounded-lg border border-slate-100 shadow-sm">
                                {log.checkIn ? new Date(log.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "--:--"}
                            </span>
                        </div>
                    </div>
                )) : (
                    <p className="text-center py-10 text-xs font-bold text-slate-300 uppercase">No Activity Recorded</p>
                )}
            </div>
        </div>

        {/* Control Panel */}
        <div className="bg-slate-900 p-8 rounded-[3rem] shadow-2xl text-white flex flex-col justify-between">
            <div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-6">System Management</h3>
                <div className="space-y-3">
                    <ActionButton icon={<UserPlus size={16}/>} label="Manage HR Access" />
                    <ActionButton icon={<Users size={16}/>} label="Talent Directory" />
                    <ActionButton icon={<Settings size={16}/>} label="Global Config" />
                </div>
            </div>
            <div className="mt-8 pt-8 border-t border-slate-800">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Version 4.0.2 Stable</p>
            </div>
        </div>
      </div>
    </div>
  );
};

// --- HELPER COMPONENTS ---

const StatCard = ({ icon, title, value, subtitle, color }) => (
  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
    <div className="flex items-center gap-4">
      <div className={`p-4 rounded-2xl bg-slate-50 ${color} group-hover:bg-slate-900 group-hover:text-white transition-all duration-300`}>
        {icon}
      </div>
      <div>
        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">{title}</p>
        <p className="text-3xl font-black text-slate-900 tracking-tighter">{value}</p>
        <p className="text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-tight">{subtitle}</p>
      </div>
    </div>
  </div>
);

const ActionButton = ({ label, icon }) => (
  <button className="flex items-center justify-between w-full bg-slate-800/40 hover:bg-indigo-600 p-4 rounded-2xl transition-all duration-500 group">
    <div className="flex items-center gap-3">
        <span className="text-slate-500 group-hover:text-white transition-colors">{icon}</span>
        <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
    </div>
    <ArrowUpRight size={14} className="text-slate-700 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
  </button>
);

export default Admindashboard;