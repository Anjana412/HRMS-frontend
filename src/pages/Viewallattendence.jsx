import React, { useState, useEffect } from "react";
import { 
  Search, Filter, Calendar, 
  Loader2, UserCircle, AlertCircle, FileText, Upload
} from "lucide-react";
// Importing the central API functions to fix port/path issues
import { getAllAttendance, exportAttendanceApi, importAttendanceApi } from "../api/api";

const Viewallattendence = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterDate, setFilterDate] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        const response = await getAllAttendance();
        // Extracting data based on your specific backend structure
        const attendanceData = response?.attendance || response?.data || (Array.isArray(response) ? response : []);
        setLogs(attendanceData);
        setError(null);
      } catch (err) {
        setError("Failed to connect to the server. Ensure backend is on Port 4000.");
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  // EXPORT LOGIC: Uses api.js to hit Port 4000 with Auth Token
  const handleExportPDF = async () => {
    if (filteredLogs.length === 0) return alert("No data to export");
    
    try {
        setIsExporting(true);
        const blob = await exportAttendanceApi(filteredLogs);

        // Create a temporary download link and click it
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `attendance_${Date.now()}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url); // Clean up memory
    } catch (err) {
        console.error("Export Error:", err);
        alert("Export failed. Check backend console.");
    } finally {
        setIsExporting(false);
    }
};

  // IMPORT LOGIC: Uses api.js to handle Multipart/FormData
  const handleImportPDF = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check if it's actually a PDF
    if (file.type !== "application/pdf") {
      return alert("Please upload a PDF file only.");
    }

    const formData = new FormData();
    formData.append("image", file); // Key matches backend: upload.single("image")

    try {
      const response = await importAttendanceApi(formData);
      alert("Report successfully imported to Cloudinary!");
      if (response.url) window.open(response.url, "_blank");
    } catch (err) {
      console.error("Import Error:", err);
      alert("Import failed: " + (err.message || "Check server logs."));
    }
  };

  const filteredLogs = logs.filter((log) => {
    const name = log.employee?.name || "Unknown";
    const role = log.employee?.usertype || "none";
    const nameMatch = name.toLowerCase().includes(searchTerm.toLowerCase());
    const roleMatch = filterRole === "all" || role === filterRole;
    const dateMatch = !filterDate || log.date?.startsWith(filterDate);
    return nameMatch && roleMatch && dateMatch;
  });

  if (loading) return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50 gap-4">
      <Loader2 className="animate-spin text-indigo-600" size={48} />
      <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">Accessing Secure Logs...</p>
    </div>
  );

  return (
    <div className="p-4 lg:p-8 space-y-8 bg-slate-50/30 min-h-screen font-sans">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Presence Vault</h1>
          <p className="text-slate-500 font-bold text-xs uppercase tracking-widest flex items-center gap-2 mt-1">
            <Calendar size={14} className="text-indigo-600" />
            Admin: Global Attendance View
          </p>
        </div>
        
        <div className="flex gap-3">
          {/* IMPORT BUTTON */}
          <label className="flex items-center gap-2 bg-white border border-slate-200 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 cursor-pointer transition-all shadow-sm">
            <Upload size={14} /> Import PDF
            <input type="file" className="hidden" accept=".pdf" onChange={handleImportPDF} />
          </label>

          {/* EXPORT BUTTON */}
          <button 
            onClick={handleExportPDF}
            disabled={isExporting}
            className="flex items-center gap-2 bg-slate-900 border border-slate-900 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white hover:bg-slate-800 transition-all shadow-sm disabled:opacity-50"
          >
            {isExporting ? <Loader2 className="animate-spin" size={14} /> : <FileText size={14} />}
            {isExporting ? "Generating..." : "Export PDF"}
          </button>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm">
        <div className="relative col-span-2">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search personnel by name..." 
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <select 
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm text-slate-700 font-medium appearance-none focus:ring-2 focus:ring-indigo-500 outline-none"
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
          >
            <option value="all"                className="text-slate-700 bg-white">All Roles</option>
            <option value="manager"            className="text-slate-700 bg-white">Manager</option>
            <option value="hr"                 className="text-slate-700 bg-white">HR</option>
            <option value="projectmanager"     className="text-slate-700 bg-white">Project Manager</option>
            <option value="projectcoordinator" className="text-slate-700 bg-white">Project Coordinator</option>
            <option value="teamlead"           className="text-slate-700 bg-white">Team Lead</option>
            <option value="employee"           className="text-slate-700 bg-white">Employee</option>
          </select>
        </div>
        <div className="relative">
          <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="date"
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm text-slate-700 font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />
        </div>
      </div>

      {/* Result count + clear */}
      <div className="flex items-center justify-between px-1">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          Showing {filteredLogs.length} of {logs.length} records
        </p>
        {(searchTerm || filterRole !== "all" || filterDate) && (
          <button
            onClick={() => { setSearchTerm(""); setFilterRole("all"); setFilterDate(""); }}
            className="text-xs font-black text-indigo-500 hover:text-indigo-700 uppercase tracking-widest"
          >
            Clear Filters ×
          </button>
        )}
      </div>

      {/* ATTENDANCE TABLE */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
        {error ? (
          <div className="p-20 text-center text-rose-500 flex flex-col items-center gap-4">
            <AlertCircle size={40} />
            <p className="font-bold uppercase tracking-widest text-sm">{error}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white">
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest">Personnel</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-center">Role</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest">Date</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest">Clock In</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest">Clock Out</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest">Breaks</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredLogs.map((log, index) => (
                  <tr key={log._id || index} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100">
                          <UserCircle size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{log.employee?.name || "Unknown User"}</p>
                          <p className="text-[10px] text-slate-400 font-medium">{log.employee?.email || "No email"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <span className={`text-xs font-black uppercase px-4 py-1.5 rounded-xl ${
                        log.employee?.usertype === 'hr' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {log.employee?.usertype || "Staff"}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-sm font-medium text-slate-600">
                      {log.date ? new Date(log.date).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-8 py-5 text-sm font-bold text-emerald-600">
                      {log.checkIn ? new Date(log.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "--:--"}
                    </td>
                    <td className="px-8 py-5 text-sm font-bold text-rose-600">
                      {log.checkOut ? new Date(log.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "--:--"}
                    </td>
                    <td className="px-8 py-5">
                      {log.breaks?.length > 0 ? (
                        <div className="space-y-1">
                          {log.breaks.map((b, bi) => (
                            <div key={bi} className="flex items-center gap-1.5">
                              <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${b.type === "lunch" ? "bg-amber-50 text-amber-600" : "bg-teal-50 text-teal-600"}`}>
                                {b.type}
                              </span>
                              <span className="text-[10px] font-bold text-slate-500">
                                {b.startTime ? new Date(b.startTime).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}) : ""}
                                {b.endTime ? ` → ${new Date(b.endTime).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}` : " (active)"}
                                {b.duration ? ` · ${b.duration}m` : ""}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-300 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-8 py-5">
                      {log.checkOut ? (
                        <span className="flex items-center gap-1.5 text-[10px] font-black uppercase text-emerald-600">
                          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Completed
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-[10px] font-black uppercase text-amber-500">
                          <div className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" /> On Duty
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Viewallattendence;