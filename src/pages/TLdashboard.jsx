import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Users, ListTodo, CalendarCheck, Loader2, ChevronRight, CheckCircle2, Clock } from "lucide-react";
import { getMyTeam, getAllTasks, getMyAttendance, checkIn, checkOut } from "../api/api";
import { toast } from "react-hot-toast";

const TLdashboard = () => {
  const navigate = useNavigate();
  const [team, setTeam]             = useState([]);
  const [tasks, setTasks]           = useState([]);
  const [todayRecord, setTodayRecord] = useState(null);
  const [loading, setLoading]       = useState(true);
  const [processing, setProcessing] = useState(false);

  const fetchAttendance = async () => {
    try {
      const records = await getMyAttendance();
      const todayStr = new Date().toISOString().split("T")[0];
      const found = (Array.isArray(records) ? records : []).find(r =>
        new Date(r.date).toISOString().split("T")[0] === todayStr
      );
      setTodayRecord(found || null);
    } catch {}
  };

  useEffect(() => {
    const fetch = async () => {
      try {
        const [teamData, taskData] = await Promise.allSettled([
          getMyTeam(),
          getAllTasks(),
        ]);
        setTeam(teamData.status === "fulfilled" ? (teamData.value?.users || []) : []);
        setTasks(taskData.status === "fulfilled" ? (Array.isArray(taskData.value) ? taskData.value : []) : []);
        await fetchAttendance();
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleClock = async () => {
    if (processing) return;
    setProcessing(true);
    try {
      if (!todayRecord) {
        await checkIn();
        toast.success("Clocked in!");
      } else if (!todayRecord.checkOut) {
        await checkOut();
        toast.success("Clocked out!");
      }
      await fetchAttendance();
    } catch (err) {
      toast.error(err?.message || "Attendance action failed");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return (
    <div className="h-full flex flex-col items-center justify-center gap-3">
      <Loader2 className="animate-spin text-emerald-600" size={40} />
      <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Loading dashboard...</p>
    </div>
  );

  const employees     = team.filter(u => u.usertype === "employee");
  const pendingTasks  = tasks.filter(t => t.status === "pending" || t.status === "assigned");
  const doneTasks     = tasks.filter(t => t.status === "completed");
  const clockedIn     = todayRecord && !todayRecord.checkOut;
  const clockedOut    = todayRecord && todayRecord.checkOut;

  return (
    <div className="p-4 md:p-8 space-y-6 min-h-screen bg-slate-50/30">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Team Lead Hub</h1>
          <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-1 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Team Lead · Manage your crew
          </p>
        </div>

        {/* Clock in/out */}
        <button onClick={handleClock} disabled={processing || clockedOut}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-lg disabled:opacity-60 ${
            clockedOut    ? "bg-slate-100 text-slate-400 cursor-not-allowed" :
            clockedIn     ? "bg-rose-600 text-white hover:bg-rose-700 shadow-rose-600/25" :
            "bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-600/25"
          }`}>
          <Clock size={16} />
          {processing ? "Processing..." : clockedOut ? "Done for today" : clockedIn ? "Clock Out" : "Clock In"}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Users size={18}/>}         title="My Employees"   value={employees.length}     sub="Under you"      color="text-emerald-600" onClick={() => navigate("/dashboard/employees")} />
        <StatCard icon={<ListTodo size={18}/>}      title="Pending Tasks"  value={pendingTasks.length}  sub="Need attention" color="text-amber-600"   onClick={() => navigate("/dashboard/tasks")} />
        <StatCard icon={<CheckCircle2 size={18}/>}  title="Completed"      value={doneTasks.length}     sub="Tasks done"     color="text-teal-600" />
        <StatCard icon={<CalendarCheck size={18}/>} title="Today"
          value={clockedOut ? "Done" : clockedIn ? "In" : "Out"}
          sub={clockedIn ? `Since ${new Date(todayRecord.checkIn).toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"})}` : "Not clocked in"}
          color="text-indigo-600" />
      </div>

      {/* My employees + tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <div className="bg-white rounded-[1.5rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">My Employees</h3>
            <button onClick={() => navigate("/dashboard/employees")} className="text-[10px] font-black uppercase tracking-widest text-emerald-600 flex items-center gap-1">
              View All <ChevronRight size={12} />
            </button>
          </div>
          {employees.length === 0 ? (
            <div className="py-12 text-center text-slate-300 font-bold text-sm">No employees assigned yet</div>
          ) : (
            <div className="divide-y divide-slate-50">
              {employees.map(emp => (
                <div key={emp._id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50/50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/profile/${emp._id}`)}>
                  {emp.photo
                    ? <img src={emp.photo} alt={emp.name} className="h-10 w-10 rounded-xl object-cover" />
                    : <div className="h-10 w-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-black text-sm">{emp.name?.charAt(0)}</div>
                  }
                  <div className="flex-1">
                    <p className="text-sm font-black text-slate-900">{emp.name}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">{emp.department || "Employee"}</p>
                  </div>
                  <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg ${
                    emp.employmentstatus === "Active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-50 text-slate-500"
                  }`}>{emp.employmentstatus || "Active"}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-[1.5rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Pending Tasks</h3>
            <button onClick={() => navigate("/dashboard/tasks")} className="text-[10px] font-black uppercase tracking-widest text-emerald-600 flex items-center gap-1">
              View All <ChevronRight size={12} />
            </button>
          </div>
          {pendingTasks.length === 0 ? (
            <div className="py-12 text-center text-slate-300 font-bold text-sm">All tasks completed!</div>
          ) : (
            <div className="divide-y divide-slate-50">
              {pendingTasks.slice(0, 5).map(task => (
                <div key={task._id} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50/50 cursor-pointer"
                  onClick={() => navigate(`/dashboard/tasks/${task._id}`)}>
                  <div>
                    <p className="text-sm font-black text-slate-900">{task.title}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">
                      {task.assignedTo?.name || "Unassigned"} · {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No deadline"}
                    </p>
                  </div>
                  <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg ml-3 ${
                    task.priority === "high"   ? "bg-rose-50 text-rose-700" :
                    task.priority === "medium" ? "bg-amber-50 text-amber-700" :
                    "bg-slate-50 text-slate-600"
                  }`}>{task.priority || "normal"}</span>
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

export default TLdashboard;