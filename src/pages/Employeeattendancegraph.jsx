import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar, Cell
} from "recharts";
import {
  ArrowLeft, Loader2, TrendingUp,
  CalendarCheck, Clock, Calendar
} from "lucide-react";
import { getAllAttendance, getUserById } from "../api/api";
import { toast } from "react-hot-toast";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const calcWorkHours = (rec) => {
  if (!rec.checkIn || !rec.checkOut) return 0;
  const raw   = new Date(rec.checkOut) - new Date(rec.checkIn);
  const brkMs = (rec.breaks || [])
    .filter(b => b.startTime && b.endTime)
    .reduce((s, b) => s + (new Date(b.endTime) - new Date(b.startTime)), 0);
  return Math.max(0, (raw - brkMs) / 3600000);
};

const EmployeeAttendanceGraph = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [employee,   setEmployee]   = useState(null);
  const [attRecords, setAttRecords] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [attMonth,   setAttMonth]   = useState(new Date().getMonth());
  const [attYear,    setAttYear]    = useState(new Date().getFullYear());

  useEffect(() => {
    const load = async () => {
      try {
        const [empData, attData] = await Promise.all([
          getUserById(id),
          getAllAttendance(),
        ]);
        const emp  = empData.user || empData;
        const all  = attData?.attendance || (Array.isArray(attData) ? attData : []);
        const mine = all.filter(r => String(r.employee?._id || r.employee) === String(id));
        setEmployee(emp);
        setAttRecords(mine);
      } catch {
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  // ── Stats ────────────────────────────────────────────────────────────────
  const monthRecords = attRecords
    .filter(r => {
      const d = new Date(r.date);
      return d.getMonth() === attMonth && d.getFullYear() === attYear;
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const daysInMonth = new Date(attYear, attMonth + 1, 0).getDate();
  let workingDays = 0;
  for (let d = 1; d <= daysInMonth; d++) {
    const day = new Date(attYear, attMonth, d).getDay();
    if (day !== 0 && day !== 6) workingDays++;
  }

  const present    = monthRecords.length;
  const totalHours = monthRecords.reduce((s, r) => s + calcWorkHours(r), 0);
  const avgHours   = present > 0 ? (totalHours / present).toFixed(1) : 0;
  const attRate    = workingDays > 0 ? Math.round((present / workingDays) * 100) : 0;
  const lateCount  = monthRecords.filter(r => {
    if (!r.checkIn) return false;
    const ci = new Date(r.checkIn);
    return ci.getHours() > 9 || (ci.getHours() === 9 && ci.getMinutes() > 30);
  }).length;

  const lineData = monthRecords.map(r => ({
    date:  new Date(r.date).getDate() + " " + MONTHS[new Date(r.date).getMonth()],
    hours: +calcWorkHours(r).toFixed(1),
  }));

  const last6 = Array.from({ length: 6 }, (_, i) => {
    const d    = new Date(attYear, attMonth - i, 1);
    const m    = d.getMonth();
    const y    = d.getFullYear();
    const recs = attRecords.filter(r => {
      const rd = new Date(r.date);
      return rd.getMonth() === m && rd.getFullYear() === y;
    });
    let wd = 0;
    for (let dd = 1; dd <= new Date(y, m + 1, 0).getDate(); dd++) {
      if (new Date(y, m, dd).getDay() !== 0 && new Date(y, m, dd).getDay() !== 6) wd++;
    }
    return {
      month: MONTHS[m],
      rate:  wd > 0 ? Math.round((recs.length / wd) * 100) : 0,
    };
  }).reverse();

  if (loading) return (
    <div className="h-full flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Loading...</p>
      </div>
    </div>
  );

  return (
    <div className="p-6 md:p-8 space-y-6 min-h-screen bg-slate-50/30">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-black text-[10px] uppercase tracking-widest transition-all">
            <ArrowLeft size={16} /> Back
          </button>
          <div className="h-5 w-px bg-slate-200" />
          <div className="flex items-center gap-3">
            {employee?.photo
              ? <img src={employee.photo} alt={employee.name} className="h-10 w-10 rounded-xl object-cover border border-slate-100" />
              : <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-sm">
                  {employee?.name?.charAt(0).toUpperCase()}
                </div>
            }
            <div>
              <p className="font-black text-slate-900">{employee?.name}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{employee?.usertype} · {employee?.department}</p>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <select value={attMonth} onChange={e => setAttMonth(Number(e.target.value))}
            className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-indigo-400 shadow-sm">
            {MONTHS.map((m, i) => <option key={m} value={i}>{m}</option>)}
          </select>
          <select value={attYear} onChange={e => setAttYear(Number(e.target.value))}
            className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-indigo-400 shadow-sm">
            {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Present Days",    value: `${present} / ${workingDays}`, icon: <CalendarCheck size={18} />, color: "text-indigo-600",  bg: "bg-indigo-50"  },
          { label: "Attendance Rate", value: `${attRate}%`,                  icon: <TrendingUp size={18} />,    color: attRate >= 80 ? "text-emerald-600" : "text-amber-600", bg: attRate >= 80 ? "bg-emerald-50" : "bg-amber-50" },
          { label: "Avg Work Hours",  value: `${avgHours}h`,                 icon: <Clock size={18} />,         color: "text-teal-600",    bg: "bg-teal-50"    },
          { label: "Late Arrivals",   value: lateCount,                       icon: <Calendar size={18} />,      color: lateCount > 0 ? "text-amber-600" : "text-emerald-600", bg: lateCount > 0 ? "bg-amber-50" : "bg-emerald-50" },
        ].map(({ label, value, icon, color, bg }) => (
          <div key={label} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${bg} ${color}`}>{icon}</div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{label}</p>
                <p className="text-xl font-black text-slate-900 tracking-tighter">{value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Daily hours line chart */}
      {lineData.length > 1 && (
        <div className="bg-white rounded-[1.5rem] border border-slate-100 shadow-sm p-6">
          <p className="text-xs font-black uppercase tracking-widest text-slate-500 mb-5">
            Daily Work Hours — {MONTHS[attMonth]} {attYear}
          </p>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 10 }} />
                <YAxis axisLine={false} tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 10 }}
                  tickFormatter={v => `${v}h`} />
                <Tooltip
                  contentStyle={{ borderRadius: "12px", border: "0.5px solid #e2e8f0", fontSize: 12 }}
                  formatter={v => [`${v}h`, "Work Hours"]} />
                <Line type="monotone" dataKey="hours" stroke="#6366f1" strokeWidth={2}
                  dot={{ fill: "#6366f1", r: 3 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Last 6 months bar chart */}
      {last6.some(d => d.rate > 0) && (
        <div className="bg-white rounded-[1.5rem] border border-slate-100 shadow-sm p-6">
          <p className="text-xs font-black uppercase tracking-widest text-slate-500 mb-5">
            Attendance Rate — Last 6 Months
          </p>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={last6} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 700 }} />
                <YAxis domain={[0, 100]} axisLine={false} tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 10 }}
                  tickFormatter={v => `${v}%`} />
                <Tooltip
                  contentStyle={{ borderRadius: "12px", border: "0.5px solid #e2e8f0", fontSize: 12 }}
                  formatter={v => [`${v}%`, "Attendance Rate"]} />
                <Bar dataKey="rate" radius={[6, 6, 0, 0]} barSize={32}>
                  {last6.map((entry, i) => (
                    <Cell key={i} fill={entry.rate >= 80 ? "#6366f1" : entry.rate >= 60 ? "#f59e0b" : "#ef4444"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Daily log with breaks */}
      <div className="bg-white rounded-[1.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-50">
          <p className="text-xs font-black uppercase tracking-widest text-slate-500">
            Daily Log — {MONTHS[attMonth]} {attYear}
          </p>
        </div>
        {monthRecords.length === 0 ? (
          <div className="py-12 text-center text-slate-400 font-bold text-sm">
            No attendance records for {MONTHS[attMonth]} {attYear}
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {monthRecords.map((rec, i) => {
              const hours    = calcWorkHours(rec);
              const checkIn  = rec.checkIn  ? new Date(rec.checkIn).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—";
              const checkOut = rec.checkOut ? new Date(rec.checkOut).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—";
              const isLate   = rec.checkIn && (() => {
                const ci = new Date(rec.checkIn);
                return ci.getHours() > 9 || (ci.getHours() === 9 && ci.getMinutes() > 30);
              })();
              const breaks = rec.breaks || [];
              return (
                <div key={i} className="px-6 py-4 hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <p className="text-sm font-black text-slate-900 w-24">
                        {new Date(rec.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                      </p>
                      {isLate && (
                        <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          Late
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      <span className="text-emerald-600 font-bold">↓ {checkIn}</span>
                      <span className="text-rose-500 font-bold">↑ {checkOut}</span>
                      <span className="font-black text-slate-700 bg-slate-100 px-3 py-1 rounded-xl text-xs">
                        {hours.toFixed(1)}h
                      </span>
                    </div>
                  </div>
                  {breaks.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2 pl-24">
                      {breaks.map((b, bi) => (
                        <div key={bi} className="flex items-center gap-1.5">
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                            b.type === "lunch"
                              ? "bg-amber-50 text-amber-600 border border-amber-200"
                              : "bg-teal-50 text-teal-600 border border-teal-200"
                          }`}>
                            {b.type}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400">
                            {b.startTime ? new Date(b.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                            {b.endTime ? ` → ${new Date(b.endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : " (active)"}
                            {b.duration ? ` · ${b.duration}m` : ""}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeAttendanceGraph;