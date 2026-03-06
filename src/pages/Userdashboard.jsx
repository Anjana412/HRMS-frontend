import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ListTodo, 
  CalendarCheck, 
  FileText, 
  Zap, 
  ArrowUpRight, 
  LogIn, 
  LogOut,
  Clock as ClockIcon,
  ChevronRight
} from "lucide-react";
import {
  AreaChart, Area, XAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";
import { 
  getAllTasks, 
  getMyAttendance, 
  getMyLeaves, 
  checkIn, 
  checkOut 
} from "../api/api";
import EmpleaveStatus from "./EmpleaveStatus"; // IMPORT THE COMPONENT

const COLORS = ["#6366f1", "#1e293b"];

const Userdashboard = () => {
  const navigate = useNavigate();
  const [time, setTime] = useState(new Date());
  const [isProcessing, setIsProcessing] = useState(false);
  const [stats, setStats] = useState({
    tasks: [],
    attendance: [],
    leaves: [],
    loading: true
  });

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [tasks, attendance, leaves] = await Promise.all([
        getAllTasks(),
        getMyAttendance(),
        getMyLeaves()
      ]);
      setStats({ 
        tasks: Array.isArray(tasks) ? tasks : [], 
        attendance: Array.isArray(attendance) ? attendance : [], 
        leaves: Array.isArray(leaves) ? leaves : [], 
        loading: false 
      });
    } catch (error) {
      console.error("Dashboard Load Error:", error);
      setStats(prev => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const todayStr = new Date().toISOString().split("T")[0];
  const todayRecord = stats.attendance.find(rec => {
    const recDate = new Date(rec.date).toISOString().split("T")[0];
    return recDate === todayStr;
  });

  const hasCheckedIn = !!todayRecord;
  const hasCheckedOut = !!todayRecord?.checkOut;

  const handleAttendanceAction = async () => {
    setIsProcessing(true);
    try {
      if (!hasCheckedIn) {
        await checkIn();
      } else {
        await checkOut();
      }
      await fetchDashboardData();
    } catch (error) {
      alert(error.response?.data?.message || error.message || "Action failed");
    } finally {
      setIsProcessing(false);
    }
  };

  if (stats.loading) return (
    <div className="flex items-center justify-center min-h-screen">
       <div className="font-black animate-pulse uppercase tracking-widest text-slate-400">Initialising Dashboard...</div>
    </div>
  );

  const completedTasks = stats.tasks.filter(t => t.status === "completed").length;
  const totalTasks = stats.tasks.length;
  const taskCompletionPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  const taskPieData = [
    { name: "Completed", value: completedTasks },
    { name: "Pending", value: totalTasks - completedTasks },
  ];

  const attendanceChartData = stats.attendance.slice(0, 7).reverse().map(record => ({
    day: new Date(record.date).toLocaleDateString('en-US', { weekday: 'short' }),
    status: 1 
  }));

  return (
    <div className="p-4 lg:p-6 space-y-8 animate-in fade-in duration-700 bg-slate-50/20 min-h-screen">
      
      {/* 1. TOP ATTENDANCE BAR */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm gap-4 transition-all hover:shadow-md">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-inner">
            <ClockIcon size={24} className={hasCheckedIn && !hasCheckedOut ? "animate-spin-slow" : ""} />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight leading-none">
              {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Operational Clock</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="text-right hidden sm:block px-4 border-r border-slate-100 mr-2">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Current Status</p>
                <p className={`text-xs font-bold ${hasCheckedOut ? 'text-slate-400' : hasCheckedIn ? 'text-emerald-500' : 'text-amber-500'}`}>
                    {hasCheckedOut ? "Shift Finished" : hasCheckedIn ? "System Active" : "Ready to Start"}
                </p>
            </div>
            
            <button
                disabled={isProcessing || hasCheckedOut}
                onClick={handleAttendanceAction}
                className={`flex-1 md:flex-none flex items-center justify-center gap-3 px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-[0.15em] transition-all duration-300 shadow-lg group ${
                hasCheckedOut 
                    ? "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none" 
                    : hasCheckedIn 
                    ? "bg-rose-600 text-white hover:bg-rose-700 shadow-rose-200" 
                    : "bg-slate-900 text-white hover:bg-indigo-600 shadow-slate-200"
                }`}
            >
                {isProcessing ? <span className="animate-pulse">Syncing...</span> : hasCheckedIn && !hasCheckedOut ? <><LogOut size={16} /> Finish Shift</> : <><LogIn size={16} /> Check In Now</>}
            </button>
        </div>
      </div>

      {/* 2. BENTO STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard icon={<ListTodo size={20} />} title="Tasks" value={totalTasks} subtitle={`${completedTasks} Finished`} />
        <StatCard icon={<CalendarCheck size={20} />} title="Attendance" value={stats.attendance.length} subtitle="Total Records" />
        <StatCard icon={<FileText size={20} />} title="Leaves" value={stats.leaves.length} subtitle="Requests Found" />
      </div>

      {/* 3. CHARTS & LEAVE HISTORY INTEGRATION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: Activity Chart */}
        <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden group">
                <div className="flex justify-between items-center mb-10">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Activity Trend</h3>
                    <Zap size={16} className="text-indigo-500" />
                </div>
                <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={attendanceChartData.length > 0 ? attendanceChartData : [{day: 'No Data', status: 0}]}>
                        <defs>
                        <linearGradient id="colorArea" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                        </defs>
                        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 800, fill: '#94a3b8'}} />
                        <Tooltip cursor={{ stroke: '#6366f1', strokeWidth: 1 }} />
                        <Area type="monotone" dataKey="status" stroke="#6366f1" strokeWidth={4} fill="url(#colorArea)" />
                    </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* --- INTEGRATED LEAVE STATUS LIST --- */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
                <div className="p-8 pb-4 flex justify-between items-center">
                    <div>
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Leave Protocol</h3>
                        <p className="text-slate-900 font-black text-lg tracking-tight mt-1">Status Overview</p>
                    </div>
                    <button 
                        onClick={() => navigate("/dashboard/request-leave")}
                        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:gap-3 transition-all"
                    >
                        New Request <ChevronRight size={14}/>
                    </button>
                </div>
                <div className="p-4">
                    <EmpleaveStatus hideHeader={true} />
                </div>
            </div>
        </div>

        {/* Right: Pie Chart and Quick Links */}
        <div className="space-y-8">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl flex flex-col items-center justify-center">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6 w-full text-left">Task Engagement</h3>
                <div className="relative w-44 h-44">
                    <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie data={taskPieData} innerRadius={55} outerRadius={75} paddingAngle={8} dataKey="value">
                        {taskPieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} cornerRadius={10} stroke="none" />
                        ))}
                        </Pie>
                    </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <span className="text-3xl font-black text-slate-900 leading-none">{taskCompletionPercent}%</span>
                        <span className="text-[8px] font-black uppercase text-indigo-500 tracking-widest mt-1">Efficiency</span>
                    </div>
                </div>
            </div>

            <QuickAction label="New Request" desc="Apply for Leave" onClick={() => navigate("/dashboard/request-leave")} />
            <QuickAction label="My Tasks" desc="View Assignments" onClick={() => navigate("/dashboard/tasks")} />
        </div>
      </div>
    </div>
  );
};

// --- HELPERS ---
const StatCard = ({ icon, title, value, subtitle }) => (
  <div className="bg-white p-6 rounded-3xl border border-slate-50 shadow-sm hover:shadow-md transition-all group">
    <div className="flex items-center gap-4">
      <div className="p-3.5 rounded-2xl bg-slate-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">{icon}</div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{title}</p>
        <p className="text-2xl font-black text-slate-900 tracking-tighter">{value}</p>
        <p className="text-[10px] font-bold text-slate-400 mt-0.5">{subtitle}</p>
      </div>
    </div>
  </div>
);

const QuickAction = ({ label, desc, onClick }) => (
  <button onClick={onClick} className="w-full group bg-slate-900 p-6 rounded-[2rem] text-left hover:bg-indigo-600 transition-all duration-300 shadow-xl flex justify-between items-center">
    <div>
      <span className="text-white font-black uppercase tracking-widest text-xs block">{label}</span>
      <p className="text-slate-400 group-hover:text-indigo-100 text-[9px] font-bold uppercase mt-1">{desc}</p>
    </div>
    <div className="h-8 w-8 rounded-full border border-slate-800 flex items-center justify-center text-slate-500 group-hover:text-white group-hover:border-white/30 transition-all"><ArrowUpRight size={14} /></div>
  </button>
);

export default Userdashboard;