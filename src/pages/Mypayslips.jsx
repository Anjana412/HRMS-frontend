import React, { useState, useEffect } from "react";
import {
  DollarSign, Calendar, Loader2, ChevronDown, ChevronUp, Download
} from "lucide-react";
import { getMyPayslips } from "../api/api";
import { toast } from "react-hot-toast";

const MONTHS_FULL = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
const MyPayslips = () => {
  const [payslips,   setPayslips]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [expanded,   setExpanded]   = useState(null);
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear());

  // Logged-in user info from localStorage — used as fallback if backend
  // doesn't populate the employee field on payslips
  const lsName  = localStorage.getItem("name")       || "Employee";
  const lsEmpId = localStorage.getItem("employeeId") || "—";
  const lsDept  = localStorage.getItem("department") || "—";
  const lsRole  = localStorage.getItem("usertype")   || "—";

  useEffect(() => {
    getMyPayslips()
      .then(data => setPayslips(Array.isArray(data) ? data : data?.payslips || []))
      .catch(() => toast.error("Failed to load payslips"))
      .finally(() => setLoading(false));
  }, []);

  const sorted      = [...payslips].sort((a, b) => b.year - a.year || b.month - a.month);
  const filtered    = yearFilter ? sorted.filter(p => p.year === yearFilter) : sorted;
  const currentYear = new Date().getFullYear();
  const ytdPaid     = payslips.filter(p => p.status === "paid" && p.year === currentYear);
  const totalEarned = payslips.filter(p => p.status === "paid").reduce((s, p) => s + (p.netSalary || 0), 0);
  const ytdNet      = ytdPaid.reduce((s, p) => s + (p.netSalary || 0), 0);
  const ytdDeduct   = ytdPaid.reduce((s, p) => s + (p.totalDeductions || 0), 0);
  const latest      = sorted[0];
  const years       = [...new Set(payslips.map(p => p.year))].sort((a, b) => b - a);

  if (loading) return (
    <div className="h-full flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Loading Payslips...</p>
      </div>
    </div>
  );

  return (
    <div className="p-6 md:p-8 space-y-6 min-h-screen bg-slate-50/30">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">My Payslips</h1>
          <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-1">
            {payslips.length} payslip{payslips.length !== 1 ? "s" : ""} on record
          </p>
        </div>
        {years.length > 1 && (
          <select value={yearFilter} onChange={e => setYearFilter(Number(e.target.value))}
            className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-indigo-400 shadow-sm">
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        )}
      </div>

      {/* YTD Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-indigo-600 text-white rounded-[1.5rem] p-6 shadow-lg shadow-indigo-600/25 sm:col-span-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-indigo-200 mb-2">Total Earned</p>
          <p className="text-3xl font-black tracking-tighter">₹{totalEarned.toLocaleString()}</p>
          <p className="text-indigo-300 text-xs font-bold mt-1">All paid payslips</p>
        </div>
        <div className="bg-white rounded-[1.5rem] p-6 border border-slate-100 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Latest Net Pay</p>
          <p className="text-3xl font-black text-slate-900 tracking-tighter">
            ₹{latest ? (latest.netSalary || 0).toLocaleString() : "—"}
          </p>
          <p className="text-slate-400 text-xs font-bold mt-1">
            {latest ? `${MONTHS_FULL[(latest.month || 1) - 1]} ${latest.year}` : "No records"}
          </p>
        </div>
        <div className="bg-white rounded-[1.5rem] p-6 border border-slate-100 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">YTD {currentYear} Net</p>
          <p className="text-3xl font-black text-emerald-600 tracking-tighter">₹{ytdNet.toLocaleString()}</p>
          <p className="text-slate-400 text-xs font-bold mt-1">{ytdPaid.length} months paid</p>
        </div>
        <div className="bg-white rounded-[1.5rem] p-6 border border-slate-100 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">YTD Deductions</p>
          <p className="text-3xl font-black text-rose-500 tracking-tighter">₹{ytdDeduct.toLocaleString()}</p>
          <p className="text-slate-400 text-xs font-bold mt-1">PF + ESI + TDS + leaves</p>
        </div>
      </div>

      {/* Payslip list */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <DollarSign size={48} className="text-slate-300 mb-4" />
          <p className="text-slate-400 font-black text-sm uppercase tracking-widest">No payslips yet</p>
          <p className="text-slate-300 text-xs mt-1">Your payslips will appear here once HR generates them</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((slip, i) => (
            <PayslipCard
              key={slip._id || i}
              slip={slip}
              lsName={lsName}
              lsEmpId={lsEmpId}
              lsDept={lsDept}
              lsRole={lsRole}
              isOpen={expanded === (slip._id || i)}
              onToggle={() => setExpanded(expanded === (slip._id || i) ? null : (slip._id || i))}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// PAYSLIP CARD
// ─────────────────────────────────────────────────────────────────────────────
const PayslipCard = ({ slip, lsName, lsEmpId, lsDept, lsRole, isOpen, onToggle }) => {
  const isPaid    = slip.status === "paid";
  const monthName = MONTHS_FULL[(slip.month || 1) - 1];
  const [downloading, setDownloading] = useState(false);

  // Prefer populated backend data, fall back to localStorage
  const empName = slip.employee?.name       || lsName;
  const empId   = slip.employee?.employeeId || lsEmpId;
  const empDept = slip.employee?.department || lsDept;
  const empRole = slip.employee?.usertype   || lsRole;

  const handleDownload = (e) => {
    e.stopPropagation();
    triggerDownload();
  };

  const triggerDownload = async () => {
    setDownloading(true);
    try {
      const { default: JsPDF } = await import("jspdf");
      const doc    = new JsPDF("p", "mm", "a4");
      const pageW  = doc.internal.pageSize.getWidth();
      const margin = 20;
      const col2   = pageW / 2 + 5;
      let y        = 0;

      const rect = (x, yy, w, h, fill) => {
        doc.setFillColor(...fill);
        doc.rect(x, yy, w, h, "F");
      };
      const txt = (str, x, yy, opts = {}) => {
        doc.setFontSize(opts.size || 10);
        doc.setFont("helvetica", opts.style || "normal");
        doc.setTextColor(...(opts.color || [30,41,59]));
        doc.text(String(str || "—"), x, yy, { align: opts.align || "left" });
      };
      const rs = (v) => `Rs.${(v || 0).toLocaleString()}`;

      // ── Header band ────────────────────────────────────────────────────────
      rect(0, 0, pageW, 28, [67,56,202]);
      txt("INTERNALLINK", margin, 16, { size: 16, style: "bold", color: [255,255,255] });
      txt("PAYSLIP", pageW - margin, 16, { size: 14, style: "bold", color: [255,255,255], align: "right" });
      txt(`${monthName} ${slip.year}`, pageW - margin, 22, { size: 9, color: [199,210,254], align: "right" });
      const sc = isPaid ? [16,185,129] : [245,158,11];
      rect(pageW - margin - 22, 18, 22, 7, sc);
      txt((slip.status || "DRAFT").toUpperCase(), pageW - margin - 11, 23, { size: 7, style: "bold", color: [255,255,255], align: "center" });

      y = 36;

      // ── Employee info box ──────────────────────────────────────────────────
      rect(margin, y, pageW - margin * 2, 30, [248,250,252]);
      doc.setDrawColor(226,232,240);
      doc.rect(margin, y, pageW - margin * 2, 30);
      y += 7;
      const infoL = [["Name", empName], ["Employee ID", empId], ["Department", empDept]];
      const infoR = [["Pay Period", `${monthName} ${slip.year}`], ["Designation", empRole], ["Processed By", slip.generatedBy?.name || "HR"]];
      infoL.forEach(([l, v], i) => {
        txt(l + ":", margin + 3, y + i * 7, { size: 8, style: "bold", color: [100,116,139] });
        txt(v || "—", margin + 28, y + i * 7, { size: 8 });
      });
      infoR.forEach(([l, v], i) => {
        txt(l + ":", col2, y + i * 7, { size: 8, style: "bold", color: [100,116,139] });
        txt(v || "—", col2 + 26, y + i * 7, { size: 8 });
      });
      y += 28;

      // ── Earnings / Deductions ──────────────────────────────────────────────
      const half = (pageW - margin * 2 - 5) / 2;
      rect(margin,   y, half, 8, [238,242,255]);
      txt("EARNINGS", margin + 3, y + 5.5, { size: 8, style: "bold", color: [79,70,229] });
      rect(col2 - 5, y, half, 8, [255,241,242]);
      txt("DEDUCTIONS", col2 - 2, y + 5.5, { size: 8, style: "bold", color: [239,68,68] });
      y += 12;

      const earns = [["Basic Salary", slip.basicSalary], ["HRA", slip.hra], ["DA", slip.da], ["Allowances", slip.allowances]];
      const dedus = [["Provident Fund", slip.pf], ["ESI", slip.esi], ["TDS", slip.tds], ["Other", slip.otherDeductions]];

      for (let i = 0; i < Math.max(earns.length, dedus.length); i++) {
        if (i % 2 === 0) {
          rect(margin, y - 2, half, 8, [250,251,255]);
          rect(col2 - 5, y - 2, half, 8, [255,252,252]);
        }
        if (earns[i]) {
          txt(earns[i][0], margin + 3, y + 4, { size: 8 });
          txt(rs(earns[i][1]), margin + half - 3, y + 4, { size: 8, style: "bold", align: "right" });
        }
        if (dedus[i]) {
          txt(dedus[i][0], col2 - 2, y + 4, { size: 8 });
          txt(`-${rs(dedus[i][1])}`, col2 + half - 8, y + 4, { size: 8, style: "bold", color: [239,68,68], align: "right" });
        }
        y += 8;
      }

      y += 2;
      doc.setDrawColor(226,232,240);
      doc.line(margin, y, margin + half, y);
      doc.line(col2 - 5, y, col2 + half - 5, y);
      y += 5;
      txt("Gross Salary", margin + 3, y + 4, { size: 9, style: "bold" });
      txt(rs(slip.grossSalary), margin + half - 3, y + 4, { size: 9, style: "bold", align: "right" });
      txt("Total Deductions", col2 - 2, y + 4, { size: 9, style: "bold" });
      txt(`-${rs(slip.totalDeductions)}`, col2 + half - 8, y + 4, { size: 9, style: "bold", color: [239,68,68], align: "right" });
      y += 14;

      // ── Net pay band ───────────────────────────────────────────────────────
      rect(margin, y, pageW - margin * 2, 18, [67,56,202]);
      txt("NET PAY", margin + 5, y + 11, { size: 10, style: "bold", color: [199,210,254] });
      txt(rs(slip.netSalary), pageW - margin - 5, y + 11, { size: 16, style: "bold", color: [255,255,255], align: "right" });
      y += 24;

      // ── Remarks ────────────────────────────────────────────────────────────
      if (slip.remarks) {
        rect(margin, y, pageW - margin * 2, 14, [255,251,235]);
        doc.setDrawColor(253,230,138);
        doc.rect(margin, y, pageW - margin * 2, 14);
        txt("REMARKS:", margin + 3, y + 5.5, { size: 7, style: "bold", color: [180,130,0] });
        txt(slip.remarks.replace(/₹/g, "Rs."), margin + 3, y + 11, { size: 7.5, color: [120,80,0] });
        y += 20;
      }
      if (slip.paidOn) {
        txt(`Paid on: ${slip.paidOn}`, margin, y, { size: 8, color: [100,116,139] });
        y += 8;
      }

      // ── Footer ─────────────────────────────────────────────────────────────
      doc.setDrawColor(226,232,240);
      doc.line(margin, y + 4, pageW - margin, y + 4);
      txt(
        "System-generated payslip · Does not require physical signature · INTERNALLINK Confidential",
        pageW / 2, y + 10, { size: 7, color: [148,163,184], align: "center" }
      );

      doc.save(`Payslip_${monthName}_${slip.year}.pdf`);
      toast.success("PDF downloaded!");
    } catch (err) {
      console.error(err);
      toast.error("PDF generation failed. Make sure jspdf is installed.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="bg-white rounded-[1.25rem] border border-slate-100 shadow-sm overflow-hidden">

      {/* Collapsed row */}
      <div className="flex items-center justify-between p-5 cursor-pointer hover:bg-slate-50/50 transition-colors"
        onClick={onToggle}>
        <div className="flex items-center gap-4">
          <div className="h-11 w-11 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
            <Calendar size={18} className="text-indigo-600" />
          </div>
          <div>
            <p className="font-black text-slate-900 text-sm">{monthName} {slip.year}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Monthly Payslip</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleDownload} disabled={downloading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-100 transition-colors border border-indigo-200 disabled:opacity-60">
            {downloading ? <Loader2 size={11} className="animate-spin" /> : <Download size={11} />}
            PDF
          </button>
          <div className="text-right">
            <p className="font-black text-slate-900 text-lg tracking-tight">₹{(slip.netSalary || 0).toLocaleString()}</p>
            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
              isPaid ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
            }`}>{slip.status || "draft"}</span>
          </div>
          {isOpen
            ? <ChevronUp   size={16} className="text-slate-400 shrink-0" />
            : <ChevronDown size={16} className="text-slate-400 shrink-0" />}
        </div>
      </div>

      {/* Expanded — full payslip view */}
      {isOpen && (
        <div className="border-t border-slate-50">
          <div className="bg-white p-8">

            {/* Company header */}
            <div className="flex justify-between items-start pb-5 border-b border-slate-200 mb-5">
              <div>
                <h2 className="text-xl font-black tracking-tighter text-slate-900">
                  INTERNAL<span className="text-indigo-600">LINK</span>
                </h2>
              </div>
              <div className="text-right">
                <p className="text-sm font-black text-slate-700 uppercase tracking-tight">Payslip</p>
                <p className="text-xs text-slate-400 font-bold mt-0.5">{monthName} {slip.year}</p>
                <span className={`mt-1 inline-block px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                  isPaid
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-amber-50 text-amber-700 border border-amber-200"
                }`}>{slip.status?.toUpperCase()}</span>
              </div>
            </div>

            {/* Employee info — resolved values with localStorage fallback */}
            <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
              <div className="space-y-1.5">
                <InfoRow label="Name"        value={empName} />
                <InfoRow label="Employee ID" value={empId} />
                <InfoRow label="Department"  value={empDept} />
                <InfoRow label="Designation" value={empRole} />
              </div>
              <div className="space-y-1.5">
                <InfoRow label="Pay Period"   value={`${monthName} ${slip.year}`} />
                {slip.paidOn && <InfoRow label="Paid On"      value={slip.paidOn} />}
                {slip.generatedBy?.name && <InfoRow label="Processed By" value={slip.generatedBy.name} />}
              </div>
            </div>

            {/* Earnings + Deductions */}
            <div className="grid grid-cols-2 gap-6 mb-5">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 border-b border-slate-100 pb-2 mb-3">Earnings</p>
                <div className="space-y-1.5 text-sm">
                  <SlipRow label="Basic Salary" value={slip.basicSalary} />
                  <SlipRow label="HRA"          value={slip.hra} />
                  <SlipRow label="DA"           value={slip.da} />
                  <SlipRow label="Allowances"   value={slip.allowances} />
                  <SlipRow label="Gross Salary" value={slip.grossSalary} bold />
                </div>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 border-b border-slate-100 pb-2 mb-3">Deductions</p>
                <div className="space-y-1.5 text-sm">
                  <SlipRow label="Provident Fund (PF)" value={slip.pf}              deduct />
                  <SlipRow label="ESI"                  value={slip.esi}             deduct />
                  <SlipRow label="TDS"                  value={slip.tds}             deduct />
                  <SlipRow label="Other Deductions"     value={slip.otherDeductions} deduct />
                  <SlipRow label="Total Deductions"     value={slip.totalDeductions} bold deduct />
                </div>
              </div>
            </div>

            {/* Net pay */}
            <div className="bg-indigo-600 rounded-xl p-5 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-200">Net Pay</p>
                <p className="text-xs text-indigo-300 font-bold mt-0.5">
                  Gross ₹{(slip.grossSalary || 0).toLocaleString()} − Deductions ₹{(slip.totalDeductions || 0).toLocaleString()}
                </p>
              </div>
              <p className="text-3xl font-black text-white tracking-tighter">₹{(slip.netSalary || 0).toLocaleString()}</p>
            </div>

            {/* Remarks */}
            {slip.remarks && (
              <div className="mt-4 bg-amber-50 border border-amber-100 rounded-xl p-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-amber-600 mb-1">Remarks</p>
                <p className="text-xs text-amber-700 font-medium">{slip.remarks}</p>
              </div>
            )}

            <p className="text-[10px] text-slate-300 text-center mt-6 font-medium">
              This is a system-generated payslip and does not require a physical signature.
            </p>
          </div>

          {/* Bottom download button */}
          <div className="px-8 pb-6 flex justify-end border-t border-slate-50 pt-4 bg-slate-50/30">
            <button onClick={triggerDownload} disabled={downloading}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-indigo-600/25 disabled:opacity-60">
              {downloading
                ? <><Loader2 size={13} className="animate-spin" /> Generating...</>
                : <><Download size={13} /> Download PDF</>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
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

export default MyPayslips;