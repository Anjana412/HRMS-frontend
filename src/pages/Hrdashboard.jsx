import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";
import { 
  Users, Calendar, CheckCircle, Activity, 
  ArrowUpRight, FileText, MessageSquare, Plus, 
  LayoutDashboard, Fingerprint, Clock, Loader2
} from "lucide-react";
import { getUsersByType, getAllTasks, checkIn, checkOut, getMyAttendance } from "../api/api";
import { toast } from "react-hot-toast";

const Hrdashboard = () => {
  const [employees, setEmployees] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- Attendance Logic (Fixed for Backend) ---
  const [todayRecord, setTodayRecord] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchAttendanceStatus = async () => {
    try {
      const records = await getMyAttendance();
      const todayStr = new Date().toISOString().split("T")[0];
      const found = records.find(rec => 
        new Date(rec.date).toISOString().split("T")[0] === todayStr
      );
      setTodayRecord(found);
    } catch (error) {
      console.error("Attendance Sync Error:", error);
    }
  };

  const handleClockToggle = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      if (!todayRecord) {
        await checkIn();
        toast.success("Clocked In successfully");
      } else if (!todayRecord.checkOut) {
        await checkOut();
        toast.success("Clocked Out successfully");
      }
      await fetchAttendanceStatus();
    } catch (error) {
      toast.error(error.response?.data?.message || "Attendance action failed");
    } finally {
      setIsProcessing(false);
    }
  };

  const isClockedIn = !!todayRecord && !todayRecord.checkOut;
  const isFinished = !!todayRecord?.checkOut;

  // --- Fetch Real Data ---
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [userData, taskData] = await Promise.all([
          getUsersByType("employee"),
          getAllTasks(),
          fetchAttendanceStatus()
        ]);
        
        setEmployees(userData?.users || userData || []);
        setTasks(taskData?.tasks || taskData || []);
      } catch (error) {
        console.error("Dashboard Sync Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  // --- Map Dynamic Data to Charts ---
  const overviewData = [
    { name: "Total Staff", value: employees.length },
    { name: "Active Tasks", value: tasks.length },
    { name: "Misc", value: 5 }, 
  ];

  const taskEfficiencyData = [
    { name: "Tasks", tasks: tasks.length },
    { name: "Staff", tasks: employees.length },
    { name: "Target", tasks: 50 },
  ];

  const COLORS = ["#4F46E5", "#10B981", "#F59E0B"];

  if (loading) return (
    <div className="h-screen w-full flex items-center justify-center bg-[#F8FAFC]">
      <Loader2 className="animate-spin text-indigo-600" size={48} />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 space-y-8 font-sans">
      
      {/* ===== HEADER & ATTENDANCE SECTION ===== */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <LayoutDashboard className="text-indigo-600" size={32} />
            HR Intelligence
          </h1>
          <p className="text-slate-500 font-medium ml-11">Manage your workforce and personal attendance.</p>
        </div>

        {/* --- HR ATTENDANCE MARKER --- */}
        <button 
          onClick={handleClockToggle}
          disabled={isFinished || isProcessing}
          className={`flex items-center gap-4 px-6 py-4 rounded-3xl border-2 transition-all duration-300 shadow-sm ${
            isFinished
            ? 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed'
            : isClockedIn 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-700 shadow-emerald-100' 
            : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300 shadow-slate-100'
          }`}
        >
          <div className={`p-2 rounded-xl ${isFinished ? 'bg-slate-200 text-slate-400' : isClockedIn ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
            {isProcessing ? <Loader2 className="animate-spin" size={24} /> : <Fingerprint size={24} />}
          </div>
          <div className="text-left">
            <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">My Attendance</p>
            <h3 className="text-sm font-bold">
              {isFinished ? "Shift Finished" : isClockedIn ? "Status: Clocked In" : "Status: Clocked Out"}
            </h3>
          </div>
          <div className={`h-3 w-3 rounded-full ml-2 ${isClockedIn ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></div>
        </button>
      </div>

      {/* ===== KPI STATS (DYNAMIC) ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Workforce", value: employees.length, icon: <Users size={22}/>, color: "text-indigo-600", bg: "bg-indigo-50" },
          { label: "Total Tasks", value: tasks.length, icon: <CheckCircle size={22}/>, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Pending Issues", value: 14, icon: <Calendar size={22}/>, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "System Health", value: "98%", icon: <Activity size={22}/>, color: "text-violet-600", bg: "bg-violet-50" },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
            <div className={`h-12 w-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-4`}>
                {stat.icon}
            </div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.15em]">{stat.label}</p>
            <h2 className="text-3xl font-black text-slate-900 mt-1">{stat.value}</h2>
          </div>
        ))}
      </div>

      {/* ===== QUICK ACCESS CONTROL PANEL ===== */}
      <div className="bg-slate-900 p-8 rounded-[3rem] shadow-xl">
        <div className="flex items-center gap-2 mb-6">
            <div className="h-2 w-8 bg-indigo-500 rounded-full"></div>
            <h3 className="text-white text-sm font-black uppercase tracking-widest">Quick Actions</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link to="employees" className="group bg-slate-800 hover:bg-white text-white hover:text-slate-900 p-5 rounded-2xl transition-all duration-300 flex items-center justify-between">
            <span className="font-bold text-sm">Add Employee</span>
            <Plus size={18} className="text-indigo-400" />
          </Link>
          <Link to="assigntask" className="group bg-slate-800 hover:bg-white text-white hover:text-slate-900 p-5 rounded-2xl transition-all duration-300 flex items-center justify-between">
            <span className="font-bold text-sm">Assign Task</span>
            <ArrowUpRight size={18} className="text-emerald-400" />
          </Link>
          <Link to="leave-requests" className="group bg-slate-800 hover:bg-white text-white hover:text-slate-900 p-5 rounded-2xl transition-all duration-300 flex items-center justify-between">
            <span className="font-bold text-sm">Approve Leaves</span>
            <Clock size={18} className="text-amber-400" />
          </Link>
          <Link to="/reports" className="group bg-slate-800 hover:bg-white text-white hover:text-slate-900 p-5 rounded-2xl transition-all duration-300 flex items-center justify-between">
            <span className="font-bold text-sm">Reports</span>
            <FileText size={18} className="text-violet-400" />
          </Link>
        </div>
      </div>

      {/* ===== DATA VISUALIZATION (DYNAMIC) ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
          <h3 className="text-lg font-black text-slate-800 mb-2 uppercase tracking-tight">Workforce Mix</h3>
          <p className="text-slate-400 text-xs mb-8">Real-time system distribution</p>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={overviewData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={10}
                >
                  {overviewData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i]} strokeWidth={0} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
          <h3 className="text-lg font-black text-slate-800 mb-2 uppercase tracking-tight">System Volume</h3>
          <p className="text-slate-400 text-xs mb-8">Records by category</p>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={taskEfficiencyData}>
                <CartesianGrid vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12, fontWeight: 700}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12}} />
                <Tooltip cursor={{fill: '#F8FAFC'}} contentStyle={{ borderRadius: '12px', border: 'none' }} />
                <Bar dataKey="tasks" fill="#4F46E5" radius={[8, 8, 8, 8]} barSize={45} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ===== MANAGEMENT MODULES ===== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: "Staffing", desc: "Manage employee profiles", icon: <Users />, link: "employees" },
          { title: "Absence", desc: "Leave request handling", icon: <Calendar />, link: "/hrleaves" },
          { title: "Docs", desc: "Secure company vault", icon: <FileText />, link: "/hrdocuments" },
          { title: "Chat", desc: "Team internal comms", icon: <MessageSquare />, link: "/hrmessages" },
        ].map((item, idx) => (
          <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-100 group hover:border-indigo-400 transition-all cursor-pointer">
            <div className={`h-10 w-10 mb-4 flex items-center justify-center rounded-xl bg-slate-50 text-slate-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors`}>
                {item.icon}
            </div>
            <h3 className="font-bold text-slate-900 text-sm mb-1">{item.title}</h3>
            <p className="text-xs text-slate-500 mb-4">{item.desc}</p>
            <Link to={item.link} className="text-[10px] font-black uppercase text-indigo-600 tracking-[0.2em] group-hover:translate-x-2 inline-block transition-transform">
                Open Module
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Hrdashboard;