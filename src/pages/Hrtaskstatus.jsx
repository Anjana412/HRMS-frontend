import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { 
  Search, Save, Activity, Sparkles, Plus, Trash2, Download, Loader2, Paperclip, X
} from "lucide-react";
import { getAllTasks, updateTask, deleteTaskApi } from "../api/api";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const HRtaskstatus = () => {
  const [tasks, setTasks]             = useState([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [proofModal, setProofModal]   = useState(null);
  const [downloading, setDownloading] = useState({});
  const navigate = useNavigate();

  const role = localStorage.getItem("usertype");  // "admin" | "hr" | "employee"

  const fetchData = async () => {
    try {
      const data = await getAllTasks();
      setTasks(data || []);
    } catch (error) {
      toast.error("Sync failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleFeedbackChange = (id, value) => {
    setTasks(prev => prev.map(t => t._id === id ? { ...t, feedback: value } : t));
  };

  const saveChanges = async (task) => {
    try {
      await updateTask(task._id, { feedback: task.feedback });
      toast.success(`Feedback saved for ${task.assignedTo?.name}`);
    } catch (error) {
      toast.error("Save failed");
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Delete this task permanently?")) return;
    try {
      await deleteTaskApi(id);
      setTasks(prev => prev.filter(t => t._id !== id));
      toast.success("Task deleted");
    } catch (error) {
      toast.error("Failed to delete task");
    }
  };

  const handleDownloadFile = async (file, index) => {
    setDownloading(prev => ({ ...prev, [index]: true }));
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_URL}/tasks/download-proof?filename=${encodeURIComponent(file.url)}&name=${encodeURIComponent(file.name || "proof_file")}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!response.ok) {
        try {
          const err = await response.json();
          toast.error(err.message || "Download failed");
        } catch {
          toast.error("This file cannot be downloaded. Please ask the employee to re-upload it.");
        }
        return;
      }

      const blob = await response.blob();
      const url  = window.URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = file.name || "proof_file";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      toast.error("Download failed — " + err.message);
    } finally {
      setDownloading(prev => ({ ...prev, [index]: false }));
    }
  };

  const handleExportPDF = async () => {
    if (filteredTasks.length === 0) return toast.error("No tasks to export");
    setIsExporting(true);
    try {
      const { default: jsPDF } = await import("https://cdn.jsdelivr.net/npm/jspdf@2.5.1/+esm");
      const doc   = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageW = doc.internal.pageSize.getWidth();

      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, pageW, 30, "F");
      doc.setFont("helvetica", "bold").setFontSize(15).setTextColor(255, 255, 255);
      doc.text("HRMS — OPERATIONAL FLOW REPORT", 14, 13);
      doc.setFontSize(8).setFont("helvetica", "normal").setTextColor(148, 163, 184);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 22);
      doc.text(`Total: ${filteredTasks.length}`, pageW - 14, 22, { align: "right" });

      let y = 42;
      doc.setFillColor(241, 245, 249);
      doc.roundedRect(10, y - 6, pageW - 20, 20, 3, 3, "F");
      doc.setFont("helvetica", "bold").setFontSize(9).setTextColor(71, 85, 105);
      const pending   = filteredTasks.filter(t => t.status === "pending").length;
      const active    = filteredTasks.filter(t => t.status === "in-progress").length;
      const completed = filteredTasks.filter(t => t.status === "completed").length;
      doc.text(`Pending: ${pending}`, 18, y + 3);
      doc.text(`In Progress: ${active}`, 80, y + 3);
      doc.setTextColor(22, 163, 74);
      doc.text(`Completed: ${completed}`, 150, y + 3);
      y += 22;

      doc.setFillColor(30, 41, 59);
      doc.rect(10, y, pageW - 20, 10, "F");
      doc.setFont("helvetica", "bold").setFontSize(8).setTextColor(255, 255, 255);
      doc.text("EMPLOYEE", 16, y + 7);
      doc.text("TASK",     65, y + 7);
      doc.text("PRIORITY", 125, y + 7);
      doc.text("STATUS",   152, y + 7);
      doc.text("FILES",    180, y + 7);
      doc.text("FEEDBACK", 190, y + 7);
      y += 14;

      filteredTasks.forEach((task, i) => {
        if (y > 270) { doc.addPage(); y = 20; }
        doc.setFillColor(i % 2 === 0 ? 248 : 255, i % 2 === 0 ? 250 : 255, i % 2 === 0 ? 252 : 255);
        doc.rect(10, y - 4, pageW - 20, 10, "F");
        doc.setFont("helvetica", "bold").setFontSize(9).setTextColor(15, 23, 42);
        doc.text(task.assignedTo?.name || "—", 16, y + 2, { maxWidth: 45 });
        doc.setFont("helvetica", "normal").setTextColor(71, 85, 105);
        doc.text(task.title || "—", 65, y + 2, { maxWidth: 55 });
        const pc = task.priority === "High" ? [220,38,38] : task.priority === "Medium" ? [37,99,235] : [100,116,139];
        doc.setTextColor(...pc);
        doc.text(task.priority || "Medium", 125, y + 2);
        const sc = task.status === "completed" ? [22,163,74] : task.status === "in-progress" ? [37,99,235] : [217,119,6];
        doc.setTextColor(...sc).setFont("helvetica", "bold");
        doc.text(statusLabel(task.status), 152, y + 2);
        doc.setTextColor(99, 102, 241).setFont("helvetica", "normal");
        doc.text(`${task.proofFiles?.length || 0}`, 183, y + 2);
        doc.setTextColor(100, 116, 139);
        doc.text(task.feedback || "—", 190, y + 2, { maxWidth: 25 });
        y += 10;
      });

      doc.setFont("helvetica", "normal").setFontSize(7).setTextColor(148, 163, 184);
      doc.text(`HRMS Confidential — ${filteredTasks.length} record(s)`, 14, 290);
      doc.save(`tasks_report_${Date.now()}.pdf`);
      toast.success("Report downloaded!");
    } catch (err) {
      toast.error("Export failed");
    } finally {
      setIsExporting(false);
    }
  };

  const statusStyle = (status) => {
    if (status === "completed")   return "bg-emerald-50 border-emerald-100 text-emerald-600";
    if (status === "in-progress") return "bg-blue-50 border-blue-100 text-blue-600";
    return "bg-amber-50 border-amber-100 text-amber-600";
  };

  const statusLabel = (status) => {
    if (status === "completed")   return "Finished";
    if (status === "in-progress") return "Active";
    return "Pending";
  };

  const filteredTasks = tasks.filter(t =>
    t.assignedTo?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#FBFCFE] text-slate-900 font-sans selection:bg-indigo-100">
      <div className="fixed top-0 left-0 w-full h-[500px] bg-gradient-to-b from-indigo-50/40 via-white to-transparent -z-10" />

      <div className="max-w-[1300px] mx-auto px-8 py-10">

        {/* HEADER */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-indigo-100 shadow-sm rounded-full">
              <Sparkles size={12} className="text-indigo-500 fill-indigo-500" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-600">Executive Console</span>
            </div>
            <h1 className="text-4xl font-black tracking-tight text-slate-900">
              Operational <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Flow</span>
            </h1>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative group min-w-[280px]">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-all" size={18} />
              <input
                type="text"
                placeholder="Filter intelligence..."
                className="w-full pl-12 pr-6 py-4 bg-white/70 backdrop-blur-xl rounded-2xl border border-slate-200/60 shadow-sm focus:border-indigo-500/40 outline-none transition-all font-semibold text-sm text-slate-600"
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button onClick={handleExportPDF} disabled={isExporting}
              className="flex items-center gap-2 px-5 py-4 bg-white border border-slate-200 rounded-2xl font-bold text-sm text-slate-600 hover:text-indigo-600 hover:border-indigo-200 hover:shadow-md transition-all disabled:opacity-50">
              {isExporting ? <><Loader2 size={18} className="animate-spin" /> Exporting...</> : <><Download size={18} /> Export PDF</>}
            </button>

            {/* Only HR can assign tasks — hidden for admin */}
            {role === "hr" && (
              <button onClick={() => navigate("/dashboard/assigntask")}
                className="flex items-center gap-2 px-6 py-4 bg-slate-900 text-white rounded-2xl font-bold text-sm shadow-xl hover:bg-indigo-600 hover:-translate-y-0.5 transition-all duration-300 active:scale-95 group">
                <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
                Assign Task
              </button>
            )}
          </div>
        </header>

        {/* COLUMN HEADERS */}
        <div className="hidden lg:grid grid-cols-12 px-10 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400/80">
          <div className="col-span-3">Team Member</div>
          <div className="col-span-3">Deliverable</div>
          <div className="col-span-2 text-center">Status</div>
          <div className="col-span-1 text-center">Proof</div>
          <div className="col-span-2">HR Feedback</div>
          <div className="col-span-1 text-right">Actions</div>
        </div>

        {/* TASK ROWS */}
        <div className="space-y-4">
          {filteredTasks.map((task) => (
            <div key={task._id}
              className="group grid grid-cols-1 lg:grid-cols-12 items-center gap-4 bg-white/80 backdrop-blur-sm p-5 lg:px-10 lg:py-6 rounded-[2rem] border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(79,70,229,0.08)] hover:-translate-y-1.5 transition-all duration-500">
              <div className="col-span-3 flex items-center gap-4">
                <div className="relative">
                  <div className="h-11 w-11 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-sm shadow-xl shadow-slate-200">
                    {task.assignedTo?.name?.charAt(0)}
                  </div>
                  <div className="absolute -top-1 -right-1 h-3 w-3 bg-indigo-500 border-2 border-white rounded-full shadow-sm" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm leading-none mb-1">{task.assignedTo?.name}</h4>
                  <p className="text-[10px] font-bold text-slate-400 tracking-tighter uppercase">Verified</p>
                </div>
              </div>

              <div className="col-span-3">
                <p className="font-bold text-slate-600 text-sm group-hover:text-indigo-600 transition-colors leading-tight">{task.title}</p>
              </div>

              <div className="col-span-2 flex justify-center">
                <span className={`text-center w-full max-w-[130px] px-4 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest border ${statusStyle(task.status)}`}>
                  {statusLabel(task.status)}
                </span>
              </div>

              <div className="col-span-1 flex justify-center">
                <button onClick={() => setProofModal(task)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                    task.proofFiles?.length > 0
                      ? "bg-indigo-50 text-indigo-600 border border-indigo-100 hover:bg-indigo-100"
                      : "bg-slate-50 text-slate-300 border border-slate-100 cursor-default"
                  }`}>
                  <Paperclip size={12} />
                  {task.proofFiles?.length || 0}
                </button>
              </div>

              <div className="col-span-2 px-2">
                <div className="bg-slate-50/50 p-0.5 rounded-xl border border-transparent focus-within:border-indigo-500/20 focus-within:bg-white focus-within:ring-4 focus-within:ring-indigo-500/5 transition-all">
                  <input type="text" value={task.feedback || ""} placeholder="Drop a note..."
                    className="w-full bg-transparent px-4 py-2 text-[13px] font-semibold text-slate-600 outline-none placeholder:text-slate-300"
                    onChange={(e) => handleFeedbackChange(task._id, e.target.value)} />
                </div>
              </div>

              <div className="col-span-1 flex items-center justify-end gap-2">
                <button onClick={() => saveChanges(task)} title="Save feedback"
                  className="inline-flex items-center justify-center h-11 w-11 rounded-xl bg-white border border-slate-100 text-slate-300 hover:text-white hover:bg-slate-900 hover:border-slate-900 transition-all duration-300 active:scale-90">
                  <Save size={16} />
                </button>
                <button onClick={(e) => handleDelete(e, task._id)} title="Delete task"
                  className="inline-flex items-center justify-center h-11 w-11 rounded-xl bg-white border border-slate-100 text-slate-300 hover:text-white hover:bg-rose-500 hover:border-rose-500 transition-all duration-300 active:scale-90">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}

          {filteredTasks.length === 0 && !loading && (
            <div className="text-center py-20 bg-white rounded-[2rem] border border-dashed border-slate-200">
              <p className="text-slate-400 font-black uppercase tracking-widest text-sm">No tasks found</p>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="mt-12 flex justify-between items-center px-4 border-t border-slate-100 pt-8">
          <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
            <Activity size={14} className="text-indigo-500" />
            Intelligence Feed: <span className="text-slate-900 ml-1">{tasks.length} Active Records</span>
          </div>
          <div className="flex gap-4">
            <div className="flex items-center gap-1.5"><div className="h-1.5 w-1.5 rounded-full bg-amber-400" /><span className="text-[9px] font-black uppercase text-slate-400">Queue</span></div>
            <div className="flex items-center gap-1.5"><div className="h-1.5 w-1.5 rounded-full bg-blue-500" /><span className="text-[9px] font-black uppercase text-slate-400">Process</span></div>
            <div className="flex items-center gap-1.5"><div className="h-1.5 w-1.5 rounded-full bg-emerald-500" /><span className="text-[9px] font-black uppercase text-slate-400">Stable</span></div>
          </div>
        </div>
      </div>

      {/* PROOF FILES MODAL */}
      {proofModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Proof Files</p>
                  <h3 className="text-xl font-black text-slate-900">{proofModal.title}</h3>
                  <p className="text-sm text-slate-500 mt-1">
                    Submitted by: <span className="font-bold text-slate-700">{proofModal.assignedTo?.name}</span>
                  </p>
                </div>
                <button onClick={() => setProofModal(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                  <X size={20} />
                </button>
              </div>

              {proofModal.proofFiles?.length > 0 ? (
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {proofModal.proofFiles.map((file, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                          <Paperclip size={16} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800 truncate max-w-[200px]">{file.name}</p>
                          <p className="text-[10px] text-slate-400">{new Date(file.uploadedAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDownloadFile(file, i)}
                        disabled={downloading[i]}
                        className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all disabled:opacity-50"
                      >
                        {downloading[i]
                          ? <><Loader2 size={12} className="animate-spin" /> Wait...</>
                          : <><Download size={12} /> Download</>
                        }
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400">
                  <Paperclip size={32} className="mx-auto mb-3 opacity-30" />
                  <p className="font-bold uppercase tracking-widest text-xs">No proof files uploaded yet</p>
                </div>
              )}

              <button onClick={() => setProofModal(null)}
                className="w-full mt-6 py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 transition-all">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HRtaskstatus;