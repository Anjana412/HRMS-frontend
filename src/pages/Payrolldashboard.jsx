import React, { useState, useEffect, useMemo } from "react";
import {
  DollarSign, Search, Loader2, Plus, X,
  CheckCircle2, Clock, Users, Trash2, BadgeCheck,
  AlertTriangle, Calendar, FileText, Eye, Download
} from "lucide-react";
import {
  getAllPayroll, generatePayroll, markPayrollAsPaid,
  deletePayrollRecord, getMyTeam, getAllLeaveRequests
} from "../api/api";
import { toast } from "react-hot-toast";

const MONTHS      = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const MONTHS_FULL = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const ROLE_COLORS = {
  employee: "bg-slate-100 text-slate-700 border-slate-200",
  teamlead: "bg-emerald-100 text-emerald-800 border-emerald-200",
  projectcoordinator: "bg-sky-100 text-sky-800 border-sky-200",
  projectmanager: "bg-teal-100 text-teal-800 border-teal-200",
  hr: "bg-indigo-100 text-indigo-800 border-indigo-200",
  manager: "bg-violet-100 text-violet-800 border-violet-200",
};
const ROLE_LABELS = {
  employee: "Employee", teamlead: "Team Lead",
  projectcoordinator: "PC", projectmanager: "PM",
  hr: "HR", manager: "Manager",
};

const PayrollDashboard = () => {
  const [payrolls,     setPayrolls]     = useState([]);
  const [team,         setTeam]         = useState([]);
  const [leaves,       setLeaves]       = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState("");
  const [monthFilter,  setMonthFilter]  = useState(new Date().getMonth() + 1);
  const [yearFilter,   setYearFilter]   = useState(new Date().getFullYear());
  const [statusFilter, setStatusFilter] = useState("");
  const [roleFilter,   setRoleFilter]   = useState("");
  const [showModal,    setShowModal]    = useState(false);
  const [selectedEmp,  setSelectedEmp]  = useState(null);
  const [viewPayslip,  setViewPayslip]  = useState(null);

  const fetchAll = async () => {
    try {
      const [payData, teamData, leaveData] = await Promise.all([
        getAllPayroll({ month: monthFilter, year: yearFilter, status: statusFilter }),
        getMyTeam(),
        getAllLeaveRequests(),
      ]);
      setPayrolls(Array.isArray(payData) ? payData : payData?.payrolls || []);
      // Admin should not appear in payroll list — exclude admin role
      const allTeam = Array.isArray(teamData) ? teamData : teamData?.users || [];
      setTeam(allTeam.filter(u => u.usertype !== "admin"));
      setLeaves(Array.isArray(leaveData) ? leaveData : leaveData?.leaves || leaveData?.data || []);
    } catch {
      toast.error("Failed to load payroll data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, [monthFilter, yearFilter, statusFilter]);

  const leaveStatsByEmployee = useMemo(() => {
    const stats = {};
    leaves.forEach(l => {
      const empId = l.employee?._id || l.employee;
      if (!empId) return;
      const start  = new Date(l.startDate);
      const end    = new Date(l.endDate);
      const mStart = new Date(yearFilter, monthFilter - 1, 1);
      const mEnd   = new Date(yearFilter, monthFilter, 0);
      if (start > mEnd || end < mStart) return;
      if (!stats[empId]) stats[empId] = { approved: 0, pending: 0, rejected: 0 };
      const overlapStart = start < mStart ? mStart : start;
      const overlapEnd   = end   > mEnd   ? mEnd   : end;
      const days = Math.ceil((overlapEnd - overlapStart) / (1000 * 60 * 60 * 24)) + 1;
      stats[empId][l.status] = (stats[empId][l.status] || 0) + days;
    });
    return stats;
  }, [leaves, monthFilter, yearFilter]);

  const payrollByEmployee = useMemo(() => {
    const map = {};
    payrolls.forEach(p => { const id = p.employee?._id || p.employee; if (id) map[id] = p; });
    return map;
  }, [payrolls]);

  const filtered = team.filter(u => {
    const matchSearch = u.name?.toLowerCase().includes(search.toLowerCase()) ||
                        u.employeeId?.toLowerCase().includes(search.toLowerCase()) ||
                        u.department?.toLowerCase().includes(search.toLowerCase());
    const p = payrollByEmployee[u._id];
    const matchStatus =
      statusFilter === ""        ? true :
      statusFilter === "paid"    ? p?.status === "paid" :
      statusFilter === "draft"   ? p?.status === "draft" :
      statusFilter === "pending" ? !p : true;
    const matchRole = roleFilter === "" || u.usertype === roleFilter;
    return matchSearch && matchStatus && matchRole;
  });

  const totalDisbursed = payrolls.filter(p => p.status === "paid").reduce((s, p) => s + (p.netSalary || 0), 0);
  const paidCount      = payrolls.filter(p => p.status === "paid").length;
  const draftCount     = payrolls.filter(p => p.status === "draft").length;
  const unpaidCount    = Math.max(0, team.length - paidCount - draftCount);

  const handleMarkPaid = async (id) => {
    try { await markPayrollAsPaid(id); toast.success("Marked as paid!"); fetchAll(); }
    catch (err) { toast.error(err?.message || "Failed"); }
  };
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this draft?")) return;
    try { await deletePayrollRecord(id); toast.success("Deleted"); fetchAll(); }
    catch (err) { toast.error(err?.message || "Failed"); }
  };

  if (loading) return (
    <div className="h-full flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Loading Payroll...</p>
      </div>
    </div>
  );

  const totalApprovedDays = Object.values(leaveStatsByEmployee).reduce((s, e) => s + (e.approved || 0), 0);
  const totalPendingDays  = Object.values(leaveStatsByEmployee).reduce((s, e) => s + (e.pending  || 0), 0);
  const staffOnLeave      = Object.keys(leaveStatsByEmployee).length;

  return (
    <div className="p-6 md:p-8 space-y-6 min-h-screen bg-slate-50/30">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Payroll</h1>
          <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-1">
            {MONTHS_FULL[monthFilter - 1]} {yearFilter} · {filtered.length} of {team.length} staff members
          </p>
        </div>
        <button onClick={() => { setSelectedEmp(null); setShowModal(true); }}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-lg shadow-indigo-600/25 hover:-translate-y-0.5">
          <Plus size={16} /> Generate Payslip
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<DollarSign size={18} />}   title="Total Disbursed" value={`₹${totalDisbursed.toLocaleString()}`} color="text-emerald-600" bg="bg-emerald-50" />
        <StatCard icon={<CheckCircle2 size={18} />} title="Paid"            value={paidCount}    color="text-indigo-600" bg="bg-indigo-50" />
        <StatCard icon={<FileText size={18} />}     title="Draft"           value={draftCount}   color="text-amber-600"  bg="bg-amber-50" />
        <StatCard icon={<Users size={18} />}        title="Not Generated"   value={unpaidCount}  color="text-rose-500"   bg="bg-rose-50" />
      </div>

      {/* Leave Summary */}
      <div className="bg-white rounded-[1.5rem] border border-slate-100 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <Calendar size={16} className="text-indigo-600" />
          <p className="text-xs font-black uppercase tracking-widest text-slate-600">
            Leave Impact — {MONTHS_FULL[monthFilter - 1]} {yearFilter}
          </p>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-rose-50 rounded-xl p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Approved Leave Days</p>
            <p className="text-2xl font-black text-rose-600">{totalApprovedDays}</p>
            <p className="text-[10px] text-slate-400 font-bold mt-0.5">affecting salary</p>
          </div>
          <div className="bg-amber-50 rounded-xl p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Pending Leave Days</p>
            <p className="text-2xl font-black text-amber-600">{totalPendingDays}</p>
            <p className="text-[10px] text-slate-400 font-bold mt-0.5">awaiting approval</p>
          </div>
          <div className="bg-indigo-50 rounded-xl p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Staff on Leave</p>
            <p className="text-2xl font-black text-indigo-600">{staffOnLeave}</p>
            <p className="text-[10px] text-slate-400 font-bold mt-0.5">employees this month</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search name, ID, department..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none focus:border-indigo-400 shadow-sm" />
        </div>
        <select value={monthFilter} onChange={e => setMonthFilter(Number(e.target.value))}
          className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-indigo-400 shadow-sm">
          {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
        </select>
        <select value={yearFilter} onChange={e => setYearFilter(Number(e.target.value))}
          className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-indigo-400 shadow-sm">
          {[0, 1, 2].map(i => new Date().getFullYear() - i).map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-indigo-400 shadow-sm">
          <option value="">All Status</option>
          <option value="paid">Paid</option>
          <option value="draft">Draft</option>
          <option value="pending">Not Generated</option>
        </select>
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
          className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-indigo-400 shadow-sm">
          <option value="">All Roles</option>
          <option value="manager">Manager</option>
          <option value="hr">HR</option>
          <option value="projectmanager">Project Manager</option>
          <option value="projectcoordinator">Project Coordinator</option>
          <option value="teamlead">Team Lead</option>
          <option value="employee">Employee</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[1.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                {["Employee","Role","Leave This Month","Basic","Deductions","Net Salary","Status","Actions"].map(h => (
                  <th key={h} className="text-left px-5 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-16 text-slate-400 font-bold text-sm">No staff found</td></tr>
              ) : filtered.map(emp => {
                const payroll   = payrollByEmployee[emp._id];
                const leaveData = leaveStatsByEmployee[emp._id] || { approved: 0, pending: 0 };
                const roleColor = ROLE_COLORS[emp.usertype] || ROLE_COLORS.employee;
                const roleLabel = ROLE_LABELS[emp.usertype] || emp.usertype;
                return (
                  <tr key={emp._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {emp.photo
                          ? <img src={emp.photo} alt={emp.name} className="h-9 w-9 rounded-xl object-cover border border-slate-100" />
                          : <div className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white text-xs font-black">{emp.name?.charAt(0).toUpperCase()}</div>
                        }
                        <div>
                          <p className="text-sm font-black text-slate-900">{emp.name}</p>
                          <p className="text-[10px] font-bold text-slate-400">{emp.employeeId || emp.department || "—"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border ${roleColor}`}>{roleLabel}</span>
                    </td>
                    <td className="px-5 py-4">
                      {leaveData.approved > 0 ? (
                        <div className="flex items-center gap-1.5">
                          <div>
                            <p className="text-xs font-black text-rose-500">{leaveData.approved} days approved</p>
                            {leaveData.pending > 0 && <p className="text-[10px] font-bold text-amber-500">{leaveData.pending} pending</p>}
                          </div>
                          <AlertTriangle size={13} className="text-rose-400" />
                        </div>
                      ) : (
                        <span className="text-[10px] font-bold text-emerald-500">Full attendance</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-sm font-bold text-slate-700">
                      {payroll ? `₹${(payroll.basicSalary || 0).toLocaleString()}` : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-5 py-4 text-sm font-bold text-rose-500">
                      {payroll ? `-₹${(payroll.totalDeductions || 0).toLocaleString()}` : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-5 py-4 text-sm font-black text-slate-900">
                      {payroll ? `₹${(payroll.netSalary || 0).toLocaleString()}` : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-5 py-4">
                      {payroll ? (
                        <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1.5 rounded-full ${
                          payroll.status === "paid" ? "bg-emerald-50 text-emerald-600 border border-emerald-200" : "bg-amber-50 text-amber-600 border border-amber-200"
                        }`}>{payroll.status}</span>
                      ) : (
                        <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1.5 rounded-full bg-slate-100 text-slate-400 border border-slate-200">Not Generated</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        {!payroll && (
                          <button onClick={() => { setSelectedEmp(emp); setShowModal(true); }}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-100 transition-colors border border-indigo-200">
                            <Plus size={11} /> Generate
                          </button>
                        )}
                        {payroll && (
                          <button onClick={() => setViewPayslip({ ...payroll, employee: emp })} title="View & Download"
                            className="p-2 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors border border-indigo-200">
                            <Eye size={14} />
                          </button>
                        )}
                        {payroll?.status === "draft" && (
                          <>
                            <button onClick={() => handleMarkPaid(payroll._id)} title="Mark as Paid"
                              className="p-2 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors border border-emerald-200">
                              <BadgeCheck size={14} />
                            </button>
                            <button onClick={() => handleDelete(payroll._id)} title="Delete"
                              className="p-2 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-100 transition-colors border border-rose-200">
                              <Trash2 size={14} />
                            </button>
                          </>
                        )}
                        {payroll?.status === "paid" && (
                          <span className="text-[10px] font-bold text-slate-400">{payroll.paidOn || "Paid"}</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <GeneratePayrollModal
          employees={team}
          preselectedEmp={selectedEmp}
          leaveStats={leaveStatsByEmployee}
          month={monthFilter}
          year={yearFilter}
          onClose={() => { setShowModal(false); setSelectedEmp(null); }}
          onGenerated={() => { setShowModal(false); setSelectedEmp(null); fetchAll(); }}
        />
      )}

      {viewPayslip && (
        <PayslipViewerModal
          payslip={viewPayslip}
          onClose={() => setViewPayslip(null)}
        />
      )}
    </div>
  );
};

const GeneratePayrollModal = ({ employees, preselectedEmp, leaveStats, month, year, onClose, onGenerated }) => {
  const [selectedId, setSelectedId] = useState(preselectedEmp?._id || "");
  const [form, setForm] = useState({ basicSalary:"", hra:"", da:"", allowances:"", pf:"", esi:"", tds:"", otherDeductions:"", remarks:"" });
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const empLeave = leaveStats[selectedId] || { approved: 0, pending: 0 };
  const basic    = Number(form.basicSalary) || 0;
  const perDay   = basic > 0 ? Math.round(basic / 26) : 0;
  const leaveDeduction = empLeave.approved * perDay;

  const p = {
    hra:   Number(form.hra)   || Math.round(basic * 0.4),
    da:    Number(form.da)    || Math.round(basic * 0.1),
    allow: Number(form.allowances) || 0,
    pf:    Number(form.pf)    || Math.round(basic * 0.12),
    esi:   Number(form.esi)   || Math.round(basic * 0.0075),
    tds:   Number(form.tds)   || 0,
    other: Number(form.otherDeductions) || 0,
  };
  p.gross  = basic + p.hra + p.da + p.allow;
  p.deduct = p.pf + p.esi + p.tds + p.other + leaveDeduction;
  p.net    = p.gross - p.deduct;

  const handleSubmit = async () => {
    if (!selectedId)   return toast.error("Select an employee");
    if (basic <= 0)    return toast.error("Enter a valid basic salary");
    setLoading(true);
    try {
      await generatePayroll({
        employeeId:      selectedId,
        month, year,
        basicSalary:     basic,
        hra:             form.hra        ? Number(form.hra)        : undefined,
        da:              form.da         ? Number(form.da)         : undefined,
        allowances:      form.allowances ? Number(form.allowances) : undefined,
        pf:              form.pf         ? Number(form.pf)         : undefined,
        esi:             form.esi        ? Number(form.esi)        : undefined,
        tds:             form.tds        ? Number(form.tds)        : undefined,
        otherDeductions: (Number(form.otherDeductions) || 0) + leaveDeduction || undefined,
        remarks: leaveDeduction > 0
          ? `${form.remarks ? form.remarks + " | " : ""}Leave deduction: ${empLeave.approved} days (Rs. ${leaveDeduction.toLocaleString()})`
          : form.remarks || "",
      });
      toast.success("Payslip generated!");
      onGenerated();
    } catch (err) {
      toast.error(err?.message || "Failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-white rounded-t-[2rem] px-8 pt-8 pb-4 border-b border-slate-100 flex items-center justify-between z-10">
          <div>
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Generate Payslip</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{MONTHS_FULL[month - 1]} {year}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400"><X size={16} /></button>
        </div>

        <div className="px-8 py-6 space-y-5">
          <Field label="Employee *">
            <select value={selectedId} onChange={e => setSelectedId(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none focus:border-indigo-400">
              <option value="">Select employee...</option>
              {employees.map(emp => (
                <option key={emp._id} value={emp._id}>
                  {emp.name} — {ROLE_LABELS[emp.usertype] || emp.usertype}{emp.employeeId ? ` (${emp.employeeId})` : ""}
                </option>
              ))}
            </select>
          </Field>

          {selectedId && empLeave.approved > 0 && (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-start gap-3">
              <AlertTriangle size={16} className="text-rose-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-black text-rose-700">Leave Detected This Month</p>
                <p className="text-xs font-bold text-rose-500 mt-0.5">
                  {empLeave.approved} approved leave day{empLeave.approved !== 1 ? "s" : ""} in {MONTHS_FULL[month - 1]}.
                  {basic > 0 ? ` Deduction: ₹${perDay.toLocaleString()}/day × ${empLeave.approved} = ₹${leaveDeduction.toLocaleString()}.` : " Enter basic salary to calculate deduction."}
                </p>
                {empLeave.pending > 0 && <p className="text-[10px] font-bold text-amber-600 mt-1">⚠ {empLeave.pending} pending days not included yet.</p>}
              </div>
            </div>
          )}
          {selectedId && empLeave.approved === 0 && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 flex items-center gap-2">
              <CheckCircle2 size={14} className="text-emerald-500" />
              <p className="text-xs font-bold text-emerald-700">No approved leaves in {MONTHS_FULL[month - 1]} — full salary applies.</p>
            </div>
          )}

          <Field label="Basic Salary (₹) *">
            <input type="number" value={form.basicSalary} onChange={e => set("basicSalary", e.target.value)} placeholder="e.g. 30000"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none focus:border-indigo-400" />
          </Field>

          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Override amounts — leave blank to auto-calculate</p>
          <div className="grid grid-cols-2 gap-3">
            {[["hra","HRA (₹)"],["da","DA (₹)"],["allowances","Allowances (₹)"],["pf","PF (₹)"],["esi","ESI (₹)"],["tds","TDS (₹)"],["otherDeductions","Other Deductions (₹)"]].map(([key, label]) => (
              <Field key={key} label={label}>
                <input type="number" value={form[key]} placeholder="Auto" onChange={e => set(key, e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none focus:border-indigo-400" />
              </Field>
            ))}
            <div className="col-span-2">
              <Field label="Remarks">
                <input type="text" value={form.remarks} placeholder="Optional note" onChange={e => set("remarks", e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none focus:border-indigo-400" />
              </Field>
            </div>
          </div>

          {basic > 0 && (
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Salary Breakdown Preview</p>
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Earnings</p>
              {[["Basic Salary", basic],["HRA", p.hra],["DA", p.da],["Allowances", p.allow],["Gross Salary", p.gross, true]].map(([l,v,b]) => <PreviewRow key={l} label={l} value={v} bold={b} />)}
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 pt-2">Deductions</p>
              {[["PF", p.pf],["ESI", p.esi],["TDS", p.tds],["Other", p.other]].map(([l,v]) => <PreviewRow key={l} label={l} value={v} deduct />)}
              {leaveDeduction > 0 && <PreviewRow label={`Leave (${empLeave.approved}d × ₹${perDay.toLocaleString()})`} value={leaveDeduction} deduct />}
              <PreviewRow label="Total Deductions" value={p.deduct} bold deduct />
              <div className="bg-indigo-600 rounded-xl p-4 flex items-center justify-between mt-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-200">Net Salary</span>
                <span className="text-2xl font-black text-white">₹{p.net.toLocaleString()}</span>
              </div>
            </div>
          )}
        </div>

        <div className="px-8 pb-8 flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-500 font-black text-sm uppercase tracking-widest hover:bg-slate-50">Cancel</button>
          <button onClick={handleSubmit} disabled={loading}
            className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-black text-sm uppercase tracking-widest hover:bg-indigo-700 shadow-lg shadow-indigo-600/25 disabled:opacity-60 flex items-center justify-center gap-2">
            {loading ? <><Loader2 size={14} className="animate-spin" /> Generating...</> : "Generate Payslip"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// PAYSLIP VIEWER MODAL — HR view & download any employee's payslip
// ─────────────────────────────────────────────────────────────────────────────
const PayslipViewerModal = ({ payslip, onClose }) => {
  const [downloading, setDownloading] = useState(false);
  const emp        = payslip.employee || {};
  const monthName  = MONTHS_FULL[(payslip.month || 1) - 1];
  const isPaid     = payslip.status === "paid";

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const { default: JsPDF } = await import("jspdf");
      const doc    = new JsPDF("p", "mm", "a4");
      const pageW  = doc.internal.pageSize.getWidth();
      const margin = 20;
      const col2   = pageW / 2 + 5;
      let y        = 0;

      const rect = (x, yy, w, h, fill) => { doc.setFillColor(...fill); doc.rect(x, yy, w, h, "F"); };
      const txt  = (str, x, yy, opts = {}) => {
        doc.setFontSize(opts.size || 10);
        doc.setFont("helvetica", opts.style || "normal");
        doc.setTextColor(...(opts.color || [30,41,59]));
        doc.text(String(str || "—"), x, yy, { align: opts.align || "left" });
      };
      const rs = (v) => `Rs.${(v || 0).toLocaleString()}`;

      // Header
      rect(0, 0, pageW, 28, [67,56,202]);
      txt("INTERNALLINK", margin, 16, { size: 16, style: "bold", color: [255,255,255] });
      txt("PAYSLIP", pageW - margin, 16, { size: 14, style: "bold", color: [255,255,255], align: "right" });
      txt(`${monthName} ${payslip.year}`, pageW - margin, 22, { size: 9, color: [199,210,254], align: "right" });
      const sc = isPaid ? [16,185,129] : [245,158,11];
      rect(pageW - margin - 22, 18, 22, 7, sc);
      txt((payslip.status || "DRAFT").toUpperCase(), pageW - margin - 11, 23, { size: 7, style: "bold", color: [255,255,255], align: "center" });

      y = 36;
      // Employee info
      rect(margin, y, pageW - margin * 2, 30, [248,250,252]);
      doc.setDrawColor(226,232,240); doc.rect(margin, y, pageW - margin * 2, 30);
      y += 7;
      const infoL = [["Name", emp.name], ["Employee ID", emp.employeeId], ["Department", emp.department]];
      const infoR = [["Pay Period", `${monthName} ${payslip.year}`], ["Joining Date", emp.joiningdate], ["Processed By", payslip.generatedBy?.name || "HR"]];
      infoL.forEach(([l, v], i) => { txt(l + ":", margin + 3, y + i * 7, { size: 8, style: "bold", color: [100,116,139] }); txt(v || "—", margin + 28, y + i * 7, { size: 8 }); });
      infoR.forEach(([l, v], i) => { txt(l + ":", col2, y + i * 7, { size: 8, style: "bold", color: [100,116,139] }); txt(v || "—", col2 + 26, y + i * 7, { size: 8 }); });
      y += 28;

      const half = (pageW - margin * 2 - 5) / 2;
      rect(margin,   y, half, 8, [238,242,255]); txt("EARNINGS",   margin + 3, y + 5.5, { size: 8, style: "bold", color: [79,70,229] });
      rect(col2 - 5, y, half, 8, [255,241,242]); txt("DEDUCTIONS", col2 - 2,   y + 5.5, { size: 8, style: "bold", color: [239,68,68] });
      y += 12;

      const earns = [["Basic Salary", payslip.basicSalary], ["HRA", payslip.hra], ["DA", payslip.da], ["Allowances", payslip.allowances]];
      const dedus = [["Provident Fund", payslip.pf], ["ESI", payslip.esi], ["TDS", payslip.tds], ["Other", payslip.otherDeductions]];
      for (let i = 0; i < Math.max(earns.length, dedus.length); i++) {
        if (i % 2 === 0) { rect(margin, y - 2, half, 8, [250,251,255]); rect(col2 - 5, y - 2, half, 8, [255,252,252]); }
        if (earns[i]) { txt(earns[i][0], margin + 3, y + 4, { size: 8 }); txt(rs(earns[i][1]), margin + half - 3, y + 4, { size: 8, style: "bold", align: "right" }); }
        if (dedus[i]) { txt(dedus[i][0], col2 - 2, y + 4, { size: 8 }); txt(`-${rs(dedus[i][1])}`, col2 + half - 8, y + 4, { size: 8, style: "bold", color: [239,68,68], align: "right" }); }
        y += 8;
      }
      y += 2;
      doc.setDrawColor(226,232,240); doc.line(margin, y, margin + half, y); doc.line(col2 - 5, y, col2 + half - 5, y);
      y += 5;
      txt("Gross Salary", margin + 3, y + 4, { size: 9, style: "bold" }); txt(rs(payslip.grossSalary), margin + half - 3, y + 4, { size: 9, style: "bold", align: "right" });
      txt("Total Deductions", col2 - 2, y + 4, { size: 9, style: "bold" }); txt(`-${rs(payslip.totalDeductions)}`, col2 + half - 8, y + 4, { size: 9, style: "bold", color: [239,68,68], align: "right" });
      y += 14;

      rect(margin, y, pageW - margin * 2, 18, [67,56,202]);
      txt("NET PAY", margin + 5, y + 11, { size: 10, style: "bold", color: [199,210,254] });
      txt(rs(payslip.netSalary), pageW - margin - 5, y + 11, { size: 16, style: "bold", color: [255,255,255], align: "right" });
      y += 24;

      if (payslip.remarks) {
        rect(margin, y, pageW - margin * 2, 14, [255,251,235]);
        doc.setDrawColor(253,230,138); doc.rect(margin, y, pageW - margin * 2, 14);
        txt("REMARKS:", margin + 3, y + 5.5, { size: 7, style: "bold", color: [180,130,0] });
        txt(payslip.remarks.replace(/₹/g, "Rs."), margin + 3, y + 11, { size: 7.5, color: [120,80,0] });
        y += 20;
      }
      if (payslip.paidOn) { txt(`Paid on: ${payslip.paidOn}`, margin, y, { size: 8, color: [100,116,139] }); y += 8; }

      doc.setDrawColor(226,232,240); doc.line(margin, y + 4, pageW - margin, y + 4);
      txt("System-generated payslip · Does not require physical signature · INTERNALLINK Confidential", pageW / 2, y + 10, { size: 7, color: [148,163,184], align: "center" });

      doc.save(`Payslip_${(emp.name || "Employee").replace(/\s+/g,"_")}_${monthName}_${payslip.year}.pdf`);
      toast.success("PDF downloaded!");
    } catch (err) {
      console.error(err);
      toast.error("PDF generation failed");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}>

        {/* Modal header */}
        <div className="sticky top-0 bg-white rounded-t-[2rem] px-8 pt-6 pb-4 border-b border-slate-100 flex items-center justify-between z-10">
          <div>
            <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">
              Payslip — {emp.name}
            </h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
              {monthName} {payslip.year}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-indigo-600/25 disabled:opacity-60"
            >
              {downloading
                ? <><Loader2 size={13} className="animate-spin" /> Generating...</>
                : <><Download size={13} /> Download PDF</>}
            </button>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 ml-1">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Printable payslip body */}
        <div className="bg-white px-8 py-6">

          {/* Company header */}
          <div className="flex justify-between items-start pb-5 border-b border-slate-200 mb-5">
            <div>
            <h2 className="text-xl font-black tracking-tighter text-slate-900">
              INTERNAL<span className="text-indigo-600">LINK</span>
            </h2>
            </div>
            <div className="text-right">
              <p className="text-sm font-black text-slate-700 uppercase">Payslip</p>
              <p className="text-xs text-slate-400 font-bold mt-0.5">{monthName} {payslip.year}</p>
              <span className={`mt-1 inline-block px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                isPaid
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-amber-50 text-amber-700 border border-amber-200"
              }`}>{payslip.status?.toUpperCase()}</span>
            </div>
          </div>

          {/* Employee info grid */}
          <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
            <div className="space-y-1.5">
              <InfoRow label="Name"        value={emp.name} />
              <InfoRow label="Employee ID" value={emp.employeeId} />
              <InfoRow label="Department"  value={emp.department} />
              <InfoRow label="Designation" value={ROLE_LABELS[emp.usertype] || emp.usertype} />
            </div>
            <div className="space-y-1.5">
              <InfoRow label="Pay Period"   value={`${monthName} ${payslip.year}`} />
              <InfoRow label="Joining Date" value={emp.joiningdate} />
              {payslip.paidOn && <InfoRow label="Paid On"      value={payslip.paidOn} />}
              {payslip.generatedBy?.name && <InfoRow label="Processed By" value={payslip.generatedBy.name} />}
            </div>
          </div>

          {/* Earnings & Deductions */}
          <div className="grid grid-cols-2 gap-6 mb-5">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 border-b border-slate-100 pb-2 mb-3">Earnings</p>
              <div className="space-y-1.5 text-sm">
                <SlipRow label="Basic Salary" value={payslip.basicSalary} />
                <SlipRow label="HRA"          value={payslip.hra} />
                <SlipRow label="DA"           value={payslip.da} />
                <SlipRow label="Allowances"   value={payslip.allowances} />
                <SlipRow label="Gross Salary" value={payslip.grossSalary} bold />
              </div>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 border-b border-slate-100 pb-2 mb-3">Deductions</p>
              <div className="space-y-1.5 text-sm">
                <SlipRow label="Provident Fund (PF)" value={payslip.pf}              deduct />
                <SlipRow label="ESI"                  value={payslip.esi}             deduct />
                <SlipRow label="TDS"                  value={payslip.tds}             deduct />
                <SlipRow label="Other Deductions"     value={payslip.otherDeductions} deduct />
                <SlipRow label="Total Deductions"     value={payslip.totalDeductions} bold deduct />
              </div>
            </div>
          </div>

          {/* Net pay */}
          <div className="bg-indigo-600 rounded-xl p-5 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-indigo-200">Net Pay</p>
              <p className="text-xs text-indigo-300 font-bold mt-0.5">
                Gross ₹{(payslip.grossSalary || 0).toLocaleString()} − Deductions ₹{(payslip.totalDeductions || 0).toLocaleString()}
              </p>
            </div>
            <p className="text-3xl font-black text-white tracking-tighter">
              ₹{(payslip.netSalary || 0).toLocaleString()}
            </p>
          </div>

          {/* Remarks */}
          {payslip.remarks && (
            <div className="mt-4 bg-amber-50 border border-amber-100 rounded-xl p-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-amber-600 mb-1">Remarks</p>
              <p className="text-xs text-amber-700 font-medium">{payslip.remarks}</p>
            </div>
          )}

          <p className="text-[10px] text-slate-300 text-center mt-6 font-medium">
            This is a system-generated payslip and does not require a physical signature.
          </p>
        </div>

        {/* Bottom download button */}
        <div className="px-8 pb-6 pt-2 flex justify-end border-t border-slate-100">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-indigo-600/25 disabled:opacity-60"
          >
            {downloading
              ? <><Loader2 size={13} className="animate-spin" /> Generating...</>
              : <><Download size={13} /> Download PDF</>}
          </button>
        </div>
      </div>
    </div>
  );
};

const InfoRow = ({ label, value }) => (
  <div className="flex gap-2">
    <span className="text-slate-400 w-28 shrink-0 font-medium">{label}:</span>
    <span className="text-slate-800 font-bold capitalize">{value || "—"}</span>
  </div>
);

const SlipRow = ({ label, value, bold, deduct }) => (
  <div className={`flex justify-between py-0.5 ${bold ? "font-black border-t border-slate-100 pt-2 mt-1" : "font-medium"} ${deduct ? "text-rose-500" : "text-slate-700"}`}>
    <span>{label}</span>
    <span>{deduct && (value > 0) ? "−" : ""}₹{(value || 0).toLocaleString()}</span>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
const StatCard = ({ icon, title, value, color, bg }) => (
  <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
    <div className="flex items-center gap-3">
      <div className={`p-3 rounded-xl ${bg} ${color}`}>{icon}</div>
      <div>
        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{title}</p>
        <p className="text-2xl font-black text-slate-900 tracking-tighter">{value}</p>
      </div>
    </div>
  </div>
);
const Field = ({ label, children }) => (
  <div>
    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">{label}</label>
    {children}
  </div>
);
const PreviewRow = ({ label, value, bold, deduct }) => (
  <div className={`flex justify-between py-0.5 text-sm ${bold ? "font-black border-t border-slate-200 pt-2 mt-1" : "font-medium"} ${deduct ? "text-rose-500" : "text-slate-700"}`}>
    <span>{label}</span><span>{deduct && value > 0 ? "-" : ""}₹{(value || 0).toLocaleString()}</span>
  </div>
);

export default PayrollDashboard;