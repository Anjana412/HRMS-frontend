import React, { useState, useEffect, useRef } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { toast } from "react-hot-toast";
import { 
  Users, Search, UserPlus, Trash2, 
  Mail, Briefcase, Filter, Download, Upload,
  CheckCircle, XCircle, Loader2, FileText
} from "lucide-react";
import { getUsersByType, deleteUserApi, userRegister } from "../api/api";

// ── CSV template columns (must match your User model fields) ─────────────────
const CSV_HEADERS = ["name", "email", "password", "department", "employeeId"];

const Employeemanagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [importResult, setImportResult] = useState(null); // { imported, skipped }
  const [isImporting, setIsImporting] = useState(false);
  const importInputRef = useRef(null);
  const location = useLocation();
  const isAdding = location.pathname.includes("/add");

  const fetchEmployees = async () => {
    try {
      const data = await getUsersByType("employee");
      setEmployees(data.users || []);
    } catch (error) {
      toast.error(error.message || "Failed to fetch employees");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEmployees(); }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Permanent Action: Remove this employee record?")) {
      try {
        await deleteUserApi(id);
        toast.success("Employee record purged");
        setEmployees(employees.filter((emp) => emp._id !== id));
      } catch (error) {
        toast.error(error.message || "Delete failed");
      }
    }
  };

  // ── EXPORT: Generate PDF of current filtered employee list ──────────────────
  const handleExportPDF = async () => {
    if (filteredEmployees.length === 0) return toast.error("No employees to export");
    setIsExporting(true);

    try {
      // Dynamically import jsPDF so it only loads when needed
      const { default: jsPDF } = await import("https://cdn.jsdelivr.net/npm/jspdf@2.5.1/+esm");

      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageW = doc.internal.pageSize.getWidth();

      // Header bar
      doc.setFillColor(15, 23, 42); // slate-900
      doc.rect(0, 0, pageW, 28, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.setTextColor(255, 255, 255);
      doc.text("HRMS — TEAM DIRECTORY", 14, 12);

      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(148, 163, 184); // slate-400
      doc.text(`Generated: ${new Date().toLocaleString()}   |   Total: ${filteredEmployees.length} personnel`, 14, 21);

      // Table header
      let y = 38;
      doc.setFillColor(241, 245, 249); // slate-100
      doc.rect(10, y - 5, pageW - 20, 10, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105); // slate-600
      doc.text("NAME",        14,  y);
      doc.text("EMAIL",       75,  y);
      doc.text("DEPARTMENT",  140, y);
      doc.text("ID",          175, y);
      y += 4;

      // Divider
      doc.setDrawColor(226, 232, 240);
      doc.line(10, y, pageW - 10, y);
      y += 6;

      // Rows
      filteredEmployees.forEach((emp, i) => {
        if (y > 270) { // new page
          doc.addPage();
          y = 20;
        }

        if (i % 2 === 0) {
          doc.setFillColor(248, 250, 252);
          doc.rect(10, y - 4, pageW - 20, 9, "F");
        }

        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(15, 23, 42);
        doc.text(emp.name || "—",                         14,  y);

        doc.setFont("helvetica", "normal");
        doc.setTextColor(71, 85, 105);
        doc.text(emp.email || "—",                        75,  y, { maxWidth: 60 });
        doc.text(emp.department || "General",             140, y);
        doc.text(emp.employeeId || emp._id?.slice(-6) || "—", 175, y);

        y += 10;
      });

      // Footer
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(148, 163, 184);
      doc.text(`HRMS Confidential — ${filteredEmployees.length} records`, 14, 290);

      doc.save(`team_directory_${Date.now()}.pdf`);
      toast.success("PDF downloaded!");
    } catch (err) {
      console.error(err);
      toast.error("Export failed");
    } finally {
      setIsExporting(false);
    }
  };

  // ── EXPORT CSV TEMPLATE: let admin download a blank CSV to fill in ──────────
  const handleDownloadTemplate = () => {
    const csvContent = CSV_HEADERS.join(",") + "\n" +
      "John Doe,john@company.com,Pass@1234,Engineering,EMP001\n" +
      "Jane Smith,jane@company.com,Pass@1234,HR,EMP002";

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = "employee_import_template.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Template downloaded");
  };

  // ── IMPORT: Parse CSV and register each employee via API ───────────────────
  const handleImportCSV = async (e) => {
    const file = e.target.files[0];
    if (!importInputRef.current) return;
    importInputRef.current.value = ""; // reset so same file can be re-uploaded

    if (!file) return;
    if (!file.name.endsWith(".csv")) {
      return toast.error("Please upload a .csv file");
    }

    setIsImporting(true);
    setImportResult(null);

    const text = await file.text();
    const lines = text.split("\n").map(l => l.trim()).filter(Boolean);

    if (lines.length < 2) {
      setIsImporting(false);
      return toast.error("CSV is empty or missing data rows");
    }

    const headers = lines[0].split(",").map(h => h.trim().toLowerCase());
    const rows    = lines.slice(1);

    const imported = [];
    const skipped  = [];

    for (const row of rows) {
      const values = row.split(",").map(v => v.trim());
      const record = {};
      headers.forEach((h, i) => { record[h] = values[i] || ""; });

      // Validate required fields
      if (!record.name || !record.email || !record.password) {
        skipped.push({ name: record.name || "Unknown", reason: "Missing name, email, or password" });
        continue;
      }

      try {
        await userRegister({
          name:       record.name,
          email:      record.email,
          password:   record.password,
          department: record.department || "General",
          employeeId: record.employeeid || record.employeeId || "",
          usertype:   "employee",
        });
        imported.push(record.name);
      } catch (err) {
        const msg = typeof err === "string" ? err : err?.message || "Registration failed";
        skipped.push({ name: record.name, reason: msg });
      }
    }

    setImportResult({ imported, skipped });
    setIsImporting(false);

    if (imported.length > 0) {
      toast.success(`${imported.length} employee(s) imported!`);
      fetchEmployees(); // Refresh the list
    }
    if (skipped.length > 0) {
      toast.error(`${skipped.length} row(s) skipped`);
    }
  };

  const filteredEmployees = employees.filter((emp) =>
    emp.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isAdding) return <Outlet />;

  return (
    <div className="w-full min-h-screen bg-[#F8FAFC] p-4 lg:p-8">
      
      {/* HEADER SECTION */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200 pb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-4">
            <div className="p-2.5 bg-slate-900 rounded-xl text-white shadow-lg">
              <Users size={24} />
            </div>
            Team Directory
          </h1>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-2 ml-1">
            Managing {employees.length} Active Personnel
          </p>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex flex-wrap items-center gap-3">

          {/* Download CSV Template */}
          <button
            onClick={handleDownloadTemplate}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-slate-200 rounded-xl text-xs font-black uppercase tracking-widest text-slate-500 hover:border-slate-400 hover:text-slate-700 transition-all"
            title="Download CSV import template"
          >
            <FileText size={14} />
            CSV Template
          </button>

          {/* Import CSV */}
          <label className="flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-emerald-200 rounded-xl text-xs font-black uppercase tracking-widest text-emerald-700 hover:bg-emerald-50 hover:border-emerald-400 transition-all cursor-pointer">
            {isImporting
              ? <><Loader2 size={14} className="animate-spin" /> Importing...</>
              : <><Upload size={14} /> Import CSV</>
            }
            <input
              ref={importInputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleImportCSV}
              disabled={isImporting}
            />
          </label>

          {/* Export PDF */}
          <button
            onClick={handleExportPDF}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-indigo-200 rounded-xl text-xs font-black uppercase tracking-widest text-indigo-700 hover:bg-indigo-50 hover:border-indigo-400 transition-all disabled:opacity-50"
          >
            {isExporting
              ? <><Loader2 size={14} className="animate-spin" /> Exporting...</>
              : <><Download size={14} /> Export PDF</>
            }
          </button>

          {/* Add New */}
          <Link
            to="add"
            className="flex items-center gap-3 bg-indigo-600 text-white px-6 py-3 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95"
          >
            <UserPlus size={18} />
            Add New Member
          </Link>
        </div>
      </div>

      {/* IMPORT RESULT BANNER */}
      {importResult && (
        <div className="mb-6 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-black text-sm uppercase tracking-widest text-slate-700">Import Summary</h3>
            <button onClick={() => setImportResult(null)} className="text-slate-400 hover:text-slate-600 text-xs font-bold">Dismiss</button>
          </div>
          <div className="flex flex-wrap gap-4 mb-3">
            <span className="flex items-center gap-2 text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg text-xs font-black uppercase">
              <CheckCircle size={14} /> {importResult.imported.length} Imported
            </span>
            {importResult.skipped.length > 0 && (
              <span className="flex items-center gap-2 text-rose-700 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-lg text-xs font-black uppercase">
                <XCircle size={14} /> {importResult.skipped.length} Skipped
              </span>
            )}
          </div>
          {importResult.skipped.length > 0 && (
            <div className="mt-3 border-t border-slate-100 pt-3 space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Skipped Rows:</p>
              {importResult.skipped.map((s, i) => (
                <div key={i} className="flex items-center gap-3 text-xs text-slate-600">
                  <XCircle size={12} className="text-rose-400 shrink-0" />
                  <span className="font-bold">{s.name}</span>
                  <span className="text-slate-400">— {s.reason}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SEARCH & FILTERS BAR */}
      <div className="mb-8 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
          <input
            type="text"
            placeholder="Search personnel database..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-14 pr-6 py-4 bg-white border-2 border-slate-100 rounded-2xl focus:border-indigo-600 outline-none transition-all text-base font-bold text-slate-900 placeholder:text-slate-400 shadow-sm"
          />
        </div>
        <button className="flex items-center gap-3 px-6 py-4 bg-white border-2 border-slate-100 rounded-2xl text-slate-700 font-black text-sm uppercase tracking-widest hover:bg-slate-50 transition-all">
          <Filter size={18} />
          Filters
        </button>
      </div>

      {/* EMPLOYEES TABLE */}
      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-slate-100">
          <thead className="bg-slate-50/50">
            <tr>
              <th className="px-10 py-5 text-left text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Member Info</th>
              <th className="px-8 py-5 text-left text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Department</th>
              <th className="px-8 py-5 text-left text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Contact Details</th>
              <th className="px-8 py-5 text-center text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Manage</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan="4" className="text-center py-24 text-base font-bold text-slate-400 animate-pulse">Syncing Directory...</td></tr>
            ) : filteredEmployees.length > 0 ? (
              filteredEmployees.map((emp) => (
                <tr key={emp._id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-5">
                      <div className="h-12 w-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-sm shadow-xl shadow-slate-200 group-hover:bg-indigo-600 transition-colors">
                        {emp.name?.charAt(0)}
                      </div>
                      <div>
                        <div className="text-base font-black text-slate-900 leading-tight">{emp.name}</div>
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">ID: {emp.employeeId || emp._id.slice(-6)}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="inline-flex items-center gap-2.5 px-4 py-1.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-black uppercase tracking-widest border border-slate-200">
                      <Briefcase size={14} className="text-indigo-600" />
                      {emp.department || "General"}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3 text-sm font-bold text-slate-600">
                      <Mail size={16} className="text-slate-400" />
                      {emp.email}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center justify-center">
                      <button 
                        onClick={() => handleDelete(emp._id)}
                        className="p-3 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                        title="Remove Record"
                      >
                        <Trash2 size={22} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center py-24">
                  <div className="text-slate-200 mb-4 flex justify-center"><Users size={60} /></div>
                  <p className="text-base font-bold text-slate-400 uppercase tracking-[0.2em]">No personnel matching your criteria</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      <Outlet />
    </div>
  );
};

export default Employeemanagement;