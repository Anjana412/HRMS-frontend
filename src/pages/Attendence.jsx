import React, { useEffect, useState } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom"; 
import { 
  Users, CheckCircle, Calendar, 
  Search, Filter, ArrowUpRight, ChevronRight,
  UserPlus, MoreVertical, Download, Clock, Loader2
} from "lucide-react";
import { getAllAttendance } from "../api/api";
import { toast } from "react-hot-toast";

const Attendance = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAdding = location.pathname.includes("/add");

  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [isExporting, setIsExporting] = useState(false);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const data = await getAllAttendance();
      // getAllAttendance now returns { attendance: [...] }
      const records = data?.attendance || (Array.isArray(data) ? data : []);
      setAttendanceRecords(records);
    } catch (error) {
      console.error("Attendance Fetch Error:", error);
      toast.error("Failed to sync workforce logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAttendance(); }, []);

  const filteredRecords = attendanceRecords.filter((rec) => {
    const recordDate = new Date(rec.date).toISOString().split("T")[0];
    const matchesDate = recordDate === selectedDate;
    const name  = rec.employee?.name?.toLowerCase()  || "";
    const email = rec.employee?.email?.toLowerCase() || "";
    const matchesSearch = name.includes(searchQuery.toLowerCase()) || 
                          email.includes(searchQuery.toLowerCase());
    return matchesDate && matchesSearch;
  });

  const totalUniqueStaff     = new Set(attendanceRecords.map(r => r.employee?._id)).size;
  const presentToday         = filteredRecords.length;
  const attendancePercentage = totalUniqueStaff > 0 
    ? Math.round((presentToday / totalUniqueStaff) * 100) 
    : 0;

  // ── EXPORT: Download filtered records as PDF ──────────────────────────────
  const handleExportPDF = async () => {
    if (filteredRecords.length === 0) {
      return toast.error("No records to export for this date");
    }

    setIsExporting(true);
    try {
      const { default: jsPDF } = await import("https://cdn.jsdelivr.net/npm/jspdf@2.5.1/+esm");

      const doc  = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageW = doc.internal.pageSize.getWidth();
      const dateLabel = new Date(selectedDate).toLocaleDateString("en-US", {
        weekday: "long", year: "numeric", month: "long", day: "numeric"
      });

      // ── Header bar ──────────────────────────────────────────────────────
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, pageW, 30, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(15);
      doc.setTextColor(255, 255, 255);
      doc.text("HRMS — WORKFORCE PRESENCE", 14, 13);

      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(148, 163, 184);
      doc.text(`Date: ${dateLabel}`, 14, 22);
      doc.text(`Generated: ${new Date().toLocaleString()}`, pageW - 14, 22, { align: "right" });

      // ── Stats row ───────────────────────────────────────────────────────
      let y = 42;
      doc.setFillColor(241, 245, 249);
      doc.roundedRect(10, y - 6, pageW - 20, 20, 3, 3, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(71, 85, 105);
      doc.text(`Total Staff in DB: ${totalUniqueStaff}`, 18, y + 3);
      doc.text(`Present on this date: ${presentToday}`, 80, y + 3);
      doc.setTextColor(79, 70, 229);
      doc.text(`Attendance Rate: ${attendancePercentage}%`, 160, y + 3);

      y += 22;

      // ── Table column headers ─────────────────────────────────────────────
      doc.setFillColor(30, 41, 59);
      doc.rect(10, y, pageW - 20, 10, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(255, 255, 255);
      doc.text("EMPLOYEE",   16, y + 7);
      doc.text("EMAIL",      70, y + 7);
      doc.text("CLOCK IN",  130, y + 7);
      doc.text("CLOCK OUT", 160, y + 7);
      doc.text("STATUS",    190, y + 7);
      y += 14;

      // ── Rows ─────────────────────────────────────────────────────────────
      filteredRecords.forEach((rec, i) => {
        if (y > 272) {
          doc.addPage();
          y = 20;
        }

        // Alternating row background
        doc.setFillColor(i % 2 === 0 ? 248 : 255, i % 2 === 0 ? 250 : 255, i % 2 === 0 ? 252 : 255);
        doc.rect(10, y - 4, pageW - 20, 10, "F");

        const name     = rec.employee?.name  || "Unknown";
        const email    = rec.employee?.email || "—";
        const checkIn  = rec.checkIn  ? new Date(rec.checkIn).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "--:--";
        const checkOut = rec.checkOut ? new Date(rec.checkOut).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "--:--";
        const status   = rec.checkOut ? "Completed" : "Active";

        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(15, 23, 42);
        doc.text(name, 16, y + 2, { maxWidth: 50 });

        doc.setFont("helvetica", "normal");
        doc.setTextColor(71, 85, 105);
        doc.text(email, 70, y + 2, { maxWidth: 55 });

        doc.setTextColor(22, 163, 74); // green for clock in
        doc.text(checkIn, 130, y + 2);

        doc.setTextColor(225, 29, 72); // red for clock out
        doc.text(checkOut, 160, y + 2);

        // Status badge colour
        if (rec.checkOut) {
          doc.setTextColor(71, 85, 105);
        } else {
          doc.setTextColor(217, 119, 6); // amber for active
        }
        doc.setFont("helvetica", "bold");
        doc.text(status, 190, y + 2);

        y += 10;
      });

      // ── Footer ───────────────────────────────────────────────────────────
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(148, 163, 184);
      doc.text(
        `HRMS Confidential  —  ${filteredRecords.length} record(s) for ${dateLabel}`,
        14, 290
      );

      doc.save(`attendance_${selectedDate}.pdf`);
      toast.success("Attendance report downloaded!");
    } catch (err) {
      console.error("Export error:", err);
      toast.error("Export failed. Try again.");
    } finally {
      setIsExporting(false);
    }
  };

  if (isAdding) return <Outlet />;

  return (
    <div className="min-h-screen bg-[#FDFDFF]  pb-10  md:px-10 font-sans text-slate-900 m-0">
      
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-12 pt-10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="h-2 w-2 rounded-full bg-indigo-600 animate-ping"></span>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-600">Live Roster</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900">
            Workforce Presence
          </h1>
        </div>

        <div className="flex items-center gap-3 bg-white p-1.5 rounded-[2rem] shadow-xl shadow-slate-100 border border-slate-100">
          <button 
            onClick={() => navigate("add")}
            className="px-6 py-3 rounded-[1.5rem] bg-slate-900 text-white text-sm font-bold flex items-center gap-2 hover:bg-indigo-600 transition-all active:scale-95 shadow-lg shadow-slate-200"
          >
            <UserPlus size={18} /> Add Member
          </button>
          
          <div className="h-8 w-[1px] bg-slate-100 mx-2"></div>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-transparent border-none focus:ring-0 text-slate-700 font-black outline-none cursor-pointer text-xs uppercase tracking-widest px-4"
          />
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <div className="md:col-span-2 bg-indigo-600 rounded-[2.5rem] p-8 text-white relative overflow-hidden group transition-all hover:shadow-2xl hover:shadow-indigo-500/20">
          <div className="relative z-10">
            <p className="text-indigo-100 text-xs font-black uppercase tracking-widest mb-1">Company Availability</p>
            <h2 className="text-6xl font-black mb-4">{attendancePercentage}%</h2>
            <div className="flex items-center gap-2 text-sm font-bold text-indigo-200">
              <ArrowUpRight size={18} /> On {new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </div>
          </div>
          <div className="absolute -right-10 -bottom-10 opacity-10 group-hover:scale-110 transition-transform duration-700">
            <CheckCircle size={200} />
          </div>
        </div>
        
        <StatCardSmall label="Database Staff" value={totalUniqueStaff} icon={<Users />} color="slate" />
        <StatCardSmall label="Active Logs"    value={presentToday}     icon={<Clock />}  color="amber" />
      </div>

      {/* ACTION BAR */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Search by name or email..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-14 pr-6 py-4 bg-white border border-slate-100 rounded-[2rem] shadow-sm outline-none focus:ring-4 focus:ring-indigo-500/5 font-medium transition-all"
          />
        </div>
        
        <div className="flex items-center gap-3">
          {/* ── DOWNLOAD BUTTON — now wired up ── */}
          <button
            onClick={handleExportPDF}
            disabled={isExporting}
            title="Download attendance report as PDF"
            className="p-4 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-indigo-600 hover:border-indigo-200 hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExporting ? <Loader2 size={20} className="animate-spin" /> : <Download size={20} />}
          </button>
          <button className="px-6 py-4 bg-white border border-slate-100 rounded-2xl text-slate-900 font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:border-indigo-600 transition-all">
            <Filter size={18} /> Filter
          </button>
        </div>
      </div>

      {/* ROSTER */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-20 font-black text-slate-300 uppercase tracking-widest animate-pulse">Syncing Presence...</div>
        ) : filteredRecords.length > 0 ? (
          filteredRecords.map((rec) => (
            <div key={rec._id} className="bg-white border border-slate-100 p-4 lg:p-6 rounded-[2rem] flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:shadow-2xl hover:shadow-indigo-500/5 transition-all group">
              <div className="flex items-center gap-5 lg:w-1/3">
                <div className="h-16 w-16 rounded-[1.5rem] bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 text-xl font-black group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-inner">
                  {rec.employee?.name?.charAt(0) || "U"}
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 leading-tight">{rec.employee?.name || "Unknown User"}</h3>
                  <p className="text-sm font-bold text-slate-400 tracking-tight">{rec.employee?.email}</p>
                </div>
              </div>

              <div className="hidden lg:block lg:w-1/4">
                <p className="text-[10px] font-black uppercase text-slate-300 tracking-widest mb-1">Shift Timing</p>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                  <span className="text-emerald-500">IN:</span>
                  {rec.checkIn ? new Date(rec.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "--:--"}
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                  <span className="text-rose-400">OUT:</span>
                  {rec.checkOut ? new Date(rec.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "---"}
                </div>
              </div>

              <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-[1.5rem] lg:w-auto self-start lg:self-center">
                <span className={`px-8 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm ${
                  rec.checkOut 
                    ? 'bg-white text-slate-400 border border-slate-100' 
                    : 'bg-white text-emerald-600 shadow-emerald-500/10 ring-1 ring-emerald-500/20 animate-pulse'
                }`}>
                  {rec.checkOut ? 'Shift Completed' : 'Active Now'}
                </span>
              </div>

              <button className="hidden lg:flex p-3 text-slate-300 hover:text-slate-900 transition-colors">
                <MoreVertical size={20} />
              </button>
            </div>
          ))
        ) : (
          <div className="text-center py-20 bg-white rounded-[2rem] border border-dashed border-slate-200">
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No logs found for this date</p>
          </div>
        )}
      </div>
    </div>
  );
};

const StatCardSmall = ({ label, value, icon, color }) => {
  const colors = {
    slate: "text-slate-900 border-slate-100 hover:border-indigo-100",
    amber: "text-amber-600 border-amber-50 hover:border-amber-200",
  };
  return (
    <div className={`bg-white p-8 rounded-[2.5rem] border shadow-sm transition-all hover:shadow-xl ${colors[color]}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
          {icon}
        </div>
        <ChevronRight className="text-slate-200" size={20} />
      </div>
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</p>
      <h3 className="text-4xl font-black">{value}</h3>
    </div>
  );
};

export default Attendance;