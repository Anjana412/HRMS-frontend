import React, { useEffect, useState, useRef } from "react";
import {
  CalendarCheck, History, LogIn, LogOut,
  CheckCircle2, Clock, Calendar as CalendarIcon,
  Coffee, Play, Square
} from "lucide-react";
import { getMyAttendance, checkIn, checkOut, startBreak, endBreak } from "../api/api";
import { toast } from "react-hot-toast";

// ── Break timer logic ────────────────────────────────────────
const BREAKS = [
  { label: "Lunch",      minutes: 30, color: "bg-amber-500",   hover: "hover:bg-amber-600" },
  { label: "Tea Break",  minutes: 15, color: "bg-teal-500",    hover: "hover:bg-teal-600" },
];

const EmployeeAttendance = () => {
  const [history, setHistory]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // Break timer state
  const [activeBreak, setActiveBreak] = useState(null); // index of active break
  const [remaining, setRemaining]     = useState(0);
  const timerRef = useRef(null);

  const fetchHistory = async () => {
    try {
      const data = await getMyAttendance();
      setHistory(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch history:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHistory(); }, []);

  // Break timer tick
  useEffect(() => {
    if (activeBreak !== null && remaining > 0) {
      timerRef.current = setInterval(() => {
        setRemaining(r => {
          if (r <= 1) {
            clearInterval(timerRef.current);
            endBreak().then(() => fetchHistory()).catch(() => {});
            toast.success(`${BREAKS[activeBreak].label} over! Back to work.`);
            setActiveBreak(null);
            return 0;
          }
          return r - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [activeBreak]);

  const handleStartBreak = async (index) => {
    if (activeBreak !== null) { toast.error("A break is already running!"); return; }
    try {
      const breakType = index === 0 ? "lunch" : "tea";
      await startBreak(breakType);
      setActiveBreak(index);
      setRemaining(BREAKS[index].minutes * 60);
      toast.success(`${BREAKS[index].label} started — ${BREAKS[index].minutes} mins`);
    } catch (err) {
      toast.error(err?.message || "Failed to start break");
    }
  };

  const handleStopBreak = async () => {
    clearInterval(timerRef.current);
    try {
      await endBreak();
      await fetchHistory();
    } catch {}
    toast(`${BREAKS[activeBreak].label} ended`);
    setActiveBreak(null);
    setRemaining(0);
  };

  const fmt = (s) => `${Math.floor(s/60).toString().padStart(2,"0")}:${(s%60).toString().padStart(2,"0")}`;

  const todayStr    = new Date().toISOString().split("T")[0];
  const todayRecord = history.find(r => new Date(r.date).toISOString().split("T")[0] === todayStr);
  const hasCheckedIn  = !!todayRecord;
  const hasCheckedOut = !!todayRecord?.checkOut;

  const handleAction = async () => {
    setIsProcessing(true);
    try {
      if (!hasCheckedIn) { await checkIn();  toast.success("Checked in!"); }
      else               { await checkOut(); toast.success("Checked out!"); }
      await fetchHistory();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Operation failed");
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) return (
    <div className="p-10 text-center font-black animate-pulse text-slate-400 uppercase tracking-widest">
      Accessing Records...
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in zoom-in duration-500">

      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Attendance Log</h1>
          <p className="text-slate-500 font-bold text-xs uppercase tracking-[0.2em] mt-2">Verified Employment Records</p>
        </div>
        <div className="hidden md:block text-right">
          <p className="text-[10px] font-black text-slate-400 uppercase">Current Date</p>
          <p className="text-sm font-bold text-slate-900">{new Date().toDateString()}</p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ACTION CARD */}
        <div className="bg-slate-950 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
            <CalendarCheck size={120} />
          </div>

          <h3 className="text-xs font-black uppercase tracking-widest text-indigo-400 mb-2">Shift Control</h3>
          <p className="text-2xl font-bold mb-6">Daily Clock-in</p>

          <div className="space-y-4 relative z-10">
            {/* Status */}
            <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
              <div className={`h-3 w-3 rounded-full animate-pulse ${hasCheckedIn ? "bg-emerald-500" : "bg-amber-500"}`} />
              <div>
                <p className="text-[10px] font-black uppercase text-slate-500">Status</p>
                <p className="text-sm font-bold uppercase">
                  {hasCheckedOut ? "Duty Finished" : hasCheckedIn ? "On Clock" : "Ready"}
                </p>
              </div>
              {todayRecord?.checkIn && (
                <p className="ml-auto text-xs font-bold text-slate-400">
                  In: {new Date(todayRecord.checkIn).toLocaleTimeString([], {hour:"2-digit", minute:"2-digit"})}
                </p>
              )}
            </div>

            {/* Check in/out button */}
            <button
              disabled={hasCheckedOut || isProcessing}
              onClick={handleAction}
              className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${
                hasCheckedOut
                  ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                  : hasCheckedIn
                  ? "bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-900/40"
                  : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/40"
              }`}
            >
              {isProcessing ? "Processing..." : hasCheckedIn
                ? <><LogOut size={18}/> Finish Shift</>
                : <><LogIn size={18}/> Start Shift</>
              }
            </button>

            {/* Break timer — only show when checked in and not checked out */}
            {hasCheckedIn && !hasCheckedOut && (
              <div className="pt-2 border-t border-white/10">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">Breaks</p>

                {activeBreak !== null ? (
                  // Timer running
                  <div className={`flex items-center justify-between px-4 py-3 ${BREAKS[activeBreak].color} rounded-2xl`}>
                    <div className="flex items-center gap-2">
                      <Coffee size={14} className="text-white" />
                      <span className="text-xs font-black uppercase text-white tracking-widest">
                        {BREAKS[activeBreak].label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-black text-white tabular-nums bg-black/20 px-2 py-0.5 rounded-lg">
                        {fmt(remaining)}
                      </span>
                      <button onClick={handleStopBreak} className="p-1 rounded-lg bg-black/20 hover:bg-black/30 text-white transition-colors">
                        <Square size={12} />
                      </button>
                    </div>
                  </div>
                ) : (
                  // Break buttons
                  <div className="flex gap-2">
                    {BREAKS.map((b, i) => (
                      <button key={b.label} onClick={() => handleStartBreak(i)}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 ${b.color} ${b.hover} text-white rounded-xl font-black text-[10px] uppercase tracking-wider transition-all`}>
                        <Coffee size={12} /> {b.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* SUMMARY STATS */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <SummaryCard title="Present Days" value={history.length} icon={<CheckCircle2 className="text-emerald-500"/>} desc="Total logged days" />
          <SummaryCard title="Today" value={hasCheckedOut ? "Done" : hasCheckedIn ? "Active" : "Absent"} icon={<Clock className="text-indigo-500"/>} desc="Current shift status" />
          <div className="sm:col-span-2 bg-white rounded-[2rem] p-6 border border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
                <CalendarIcon size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Attendance consistency</p>
                <p className="text-lg font-black text-slate-900">
                  {history.length > 0 ? Math.min(100, Math.round((history.length / 22) * 100)) : 0}%
                </p>
              </div>
            </div>
            <div className="h-2 w-32 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-600 rounded-full transition-all"
                style={{ width: `${Math.min(100, Math.round((history.length / 22) * 100))}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* HISTORY TABLE */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-50 flex items-center gap-3">
          <History size={20} className="text-indigo-600" />
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-900">Activity Log</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase">Date</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase">Check In</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase">Check Out</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase">Breaks</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {history.map((item, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-5">
                    <p className="text-sm font-bold text-slate-900">{new Date(item.date).toLocaleDateString()}</p>
                  </td>
                  <td className="px-8 py-5 text-sm font-medium text-slate-600">
                    {item.checkIn ? new Date(item.checkIn).toLocaleTimeString([], {hour:"2-digit", minute:"2-digit"}) : "--:--"}
                  </td>
                  <td className="px-8 py-5 text-sm font-medium text-slate-600">
                    {item.checkOut ? new Date(item.checkOut).toLocaleTimeString([], {hour:"2-digit", minute:"2-digit"}) : "--:--"}
                  </td>
                  <td className="px-8 py-5">
                    {item.breaks?.length > 0 ? (
                      <div className="space-y-1">
                        {item.breaks.map((b, bi) => (
                          <div key={bi} className="flex items-center gap-1.5">
                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${b.type === "lunch" ? "bg-amber-50 text-amber-600" : "bg-teal-50 text-teal-600"}`}>
                              {b.type}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400">
                              {b.duration ? `${b.duration}m` : b.startTime ? new Date(b.startTime).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}) : ""}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-slate-300 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-8 py-5 text-right">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                      item.checkOut ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                    }`}>
                      {item.checkOut ? "Completed" : "On Duty"}
                    </span>
                  </td>
                </tr>
              ))}
              {history.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-8 py-10 text-center text-slate-400 font-bold text-xs uppercase tracking-widest">
                    No records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const SummaryCard = ({ title, value, icon, desc }) => (
  <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all">
    <div className="flex justify-between items-start mb-4">
      <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center">{icon}</div>
    </div>
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</p>
    <p className="text-3xl font-black text-slate-900 tracking-tighter">{value}</p>
    <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">{desc}</p>
  </div>
);

export default EmployeeAttendance;