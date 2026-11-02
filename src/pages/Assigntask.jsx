import React, { useState, useEffect, useRef } from "react";
import { toast } from "react-hot-toast";
import {
  Plus, Search, ClipboardList, Clock,
  Trash2, User, ArrowUpRight, X, Calendar, UserCheck,
  Paperclip, FileText, Upload, Eye, AlertCircle, FolderKanban
} from "lucide-react";
import { getAllTasks, getMyTeam, createTask, deleteTaskApi, getTaskById, getAllProjects, getMyProjects } from "../api/api";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const Assigntask = () => {
  const role = localStorage.getItem("usertype") || "employee";

  const [teamMembers, setTeamMembers] = useState([]);
  const [tasks, setTasks]             = useState([]);
  const [projects, setProjects]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState("");
  const [showList, setShowList]       = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [attachedFile, setAttachedFile] = useState(null);
  const [uploading, setUploading]     = useState(false);
  const [errors, setErrors]           = useState({});
  const fileInputRef = useRef(null);

  const [newTask, setNewTask] = useState({
    assignedTo:     "",
    title:          "",
    description:    "",
    priority:       "Medium",
    category:       "other",
    dueDate:        "",
    estimatedHours: "",
    project:        "",
    remarks:        "",
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [teamData, taskData, projData] = await Promise.allSettled([
        getMyTeam(),
        getAllTasks(),
        ["admin", "manager", "hr"].includes(role) ? getAllProjects() : getMyProjects(),
      ]);

      setTeamMembers(teamData.status === "fulfilled"  ? (teamData.value?.users  || []) : []);
      setTasks(      taskData.status === "fulfilled"  ? (Array.isArray(taskData.value) ? taskData.value : []) : []);
      setProjects(   projData.status === "fulfilled"  ? (projData.value?.projects || []) : []);
    } catch {
      toast.error("Error connecting to server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleOpenTask = async (t) => {
    setSelectedTask(t);
    try {
      const fresh = await getTaskById(t._id);
      setSelectedTask(fresh?.task || fresh || t);
    } catch { }
  };

  const validate = () => {
    const e = {};
    if (!newTask.assignedTo)        e.assignedTo = "Please select a team member";
    if (!newTask.title.trim())      e.title      = "Task title is required";
    else if (newTask.title.trim().length < 3) e.title = "Title must be at least 3 characters";
    if (!newTask.description.trim()) e.description = "Description is required";
    return e;
  };

  const handleAssignTask = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    try {
      setUploading(true);
      const payload = {
        ...newTask,
        dueDate: newTask.dueDate || new Date(),
        project: newTask.project || undefined,
      };
      const res     = await createTask(payload);
      const taskId  = res?.task?._id || res?._id;

      if (attachedFile && taskId) {
        const formData = new FormData();
        formData.append("file", attachedFile);
        const token = localStorage.getItem("token");
        await fetch(`${API_URL}/tasks/uploadproof/${taskId}`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
        toast.success("Task assigned with document!");
      } else {
        toast.success("Task assigned successfully");
      }

      setNewTask({ assignedTo:"", title:"", description:"", priority:"Medium", category:"other", dueDate:"", estimatedHours:"", project:"", remarks:"" });
      setSearch("");
      setAttachedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      fetchData();
    } catch (error) {
      toast.error(error.message || "Assignment failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Delete this task?")) return;
    try {
      await deleteTaskApi(id);
      setTasks(tasks.filter(t => t._id !== id));
      toast.success("Task deleted");
    } catch {
      toast.error("Failed to delete task");
    }
  };

  const FieldError = ({ msg }) => msg ? (
    <p className="flex items-center gap-1.5 text-rose-500 text-xs font-semibold mt-1.5">
      <AlertCircle size={12} />{msg}
    </p>
  ) : null;

  const filteredMembers = teamMembers.filter(m =>
    m.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F1F5F9] px-4 pt-2 pb-10 lg:px-10 text-slate-900 font-sans">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="bg-blue-600 p-2 rounded-lg text-white">
                <ClipboardList size={24} />
              </span>
              <h1 className="text-4xl font-black tracking-tight text-slate-900">Workload</h1>
            </div>
            <p className="text-slate-500 font-medium ml-12">Assign and monitor team deliverables.</p>
          </div>
          <div className="flex gap-4 ml-12 md:ml-0">
            <SummaryCard label="Pending"   count={tasks.filter(t => t.status === "pending").length}   color="amber" />
            <SummaryCard label="Total"     count={tasks.length}                                        color="blue" />
            <SummaryCard label="Completed" count={tasks.filter(t => t.status === "completed").length}  color="green" />
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

          {/* FORM SIDEBAR */}
          <aside className="lg:col-span-4">
            <div className="bg-white p-7 rounded-[2.5rem] shadow-xl border border-slate-200 sticky top-4 space-y-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-blue-50 p-2 rounded-xl text-blue-600">
                  <Plus size={20} strokeWidth={3} />
                </div>
                <h2 className="text-xl font-black text-slate-800 tracking-tight">New Task</h2>
              </div>

              {/* Link to Project */}
              <div>
                <label className="text-[11px] font-black uppercase text-slate-400 mb-1.5 ml-1 block tracking-widest">
                  <FolderKanban size={11} className="inline mr-1" /> Link to Project (optional)
                </label>
                <select value={newTask.project} onChange={e => setNewTask({...newTask, project: e.target.value})}
                  className="w-full px-4 py-3 bg-white border-2 border-slate-100 rounded-2xl focus:border-blue-400 outline-none font-semibold text-slate-700 text-sm appearance-none">
                  <option value="">— Standalone task —</option>
                  {projects.map(p => (
                    <option key={p._id} value={p._id}>{p.name} ({p.projectCode})</option>
                  ))}
                </select>
              </div>

              {/* Assign To */}
              <div className="relative">
                <label className="text-[11px] font-bold uppercase text-slate-500 mb-1.5 ml-1 block tracking-wider">Assign To *</label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input type="text" placeholder="Search team member..."
                    value={search}
                    onChange={e => { setSearch(e.target.value); setShowList(true); if (errors.assignedTo) setErrors({...errors, assignedTo:""}); }}
                    onFocus={() => setShowList(true)}
                    className={`w-full pl-11 pr-4 py-3 bg-white border-2 rounded-2xl focus:border-blue-400 outline-none font-semibold text-slate-700 text-sm transition-all ${errors.assignedTo ? "border-rose-300 bg-rose-50" : "border-slate-100"}`}
                  />
                </div>
                {showList && search && filteredMembers.length > 0 && (
                  <div className="absolute mt-1 w-full bg-white border border-slate-100 rounded-2xl shadow-2xl z-50 overflow-hidden max-h-48 overflow-y-auto">
                    {filteredMembers.map(m => (
                      <button key={m._id} type="button"
                        onClick={() => { setSearch(m.name); setNewTask({...newTask, assignedTo: m._id}); setShowList(false); setErrors({...errors, assignedTo:""}); }}
                        className="w-full text-left px-4 py-3 hover:bg-blue-50 font-bold text-slate-700 text-sm transition-colors flex items-center gap-3">
                        {m.photo
                          ? <img src={m.photo} alt={m.name} className="h-7 w-7 rounded-lg object-cover" />
                          : <div className="h-7 w-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-xs">{m.name?.charAt(0)}</div>
                        }
                        <div>
                          <p className="font-black text-slate-800">{m.name}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">{m.usertype}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                <FieldError msg={errors.assignedTo} />
              </div>

              {/* Title */}
              <div>
                <label className="text-[11px] font-bold uppercase text-slate-500 mb-1.5 ml-1 block tracking-wider">Task Title *</label>
                <input type="text" value={newTask.title}
                  onChange={e => { setNewTask({...newTask, title: e.target.value}); if (errors.title) setErrors({...errors, title:""}); }}
                  placeholder="e.g. Design homepage mockup"
                  className={`w-full px-4 py-3 bg-white border-2 rounded-2xl focus:border-blue-400 outline-none font-semibold text-slate-700 text-sm transition-all ${errors.title ? "border-rose-300 bg-rose-50" : "border-slate-100"}`}
                />
                <FieldError msg={errors.title} />
              </div>

              {/* Description */}
              <div>
                <label className="text-[11px] font-bold uppercase text-slate-500 mb-1.5 ml-1 block tracking-wider">Description *</label>
                <textarea rows={3} value={newTask.description}
                  onChange={e => { setNewTask({...newTask, description: e.target.value}); if (errors.description) setErrors({...errors, description:""}); }}
                  placeholder="What needs to be done?"
                  className={`w-full px-4 py-3 bg-white border-2 rounded-2xl focus:border-blue-400 outline-none font-semibold text-slate-700 text-sm resize-none transition-all ${errors.description ? "border-rose-300 bg-rose-50" : "border-slate-100"}`}
                />
                <FieldError msg={errors.description} />
              </div>

              {/* Priority + Category */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-black uppercase text-slate-400 mb-1.5 block tracking-widest">Priority</label>
                  <select value={newTask.priority} onChange={e => setNewTask({...newTask, priority: e.target.value})}
                    className="w-full px-3 py-2.5 bg-white border-2 border-slate-100 rounded-xl focus:border-blue-400 outline-none font-bold text-slate-700 text-sm appearance-none">
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                    <option>Critical</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-black uppercase text-slate-400 mb-1.5 block tracking-widest">Category</label>
                  <select value={newTask.category} onChange={e => setNewTask({...newTask, category: e.target.value})}
                    className="w-full px-3 py-2.5 bg-white border-2 border-slate-100 rounded-xl focus:border-blue-400 outline-none font-bold text-slate-700 text-sm appearance-none">
                    <option value="development">Development</option>
                    <option value="design">Design</option>
                    <option value="testing">Testing</option>
                    <option value="documentation">Documentation</option>
                    <option value="research">Research</option>
                    <option value="meeting">Meeting</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              {/* Due Date + Est. Hours */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-black uppercase text-slate-400 mb-1.5 block tracking-widest">Due Date</label>
                  <input type="date" value={newTask.dueDate} onChange={e => setNewTask({...newTask, dueDate: e.target.value})}
                    className="w-full px-3 py-2.5 bg-white border-2 border-slate-100 rounded-xl focus:border-blue-400 outline-none font-bold text-slate-700 text-sm" />
                </div>
                <div>
                  <label className="text-[11px] font-black uppercase text-slate-400 mb-1.5 block tracking-widest">Est. Hours</label>
                  <input type="number" value={newTask.estimatedHours} onChange={e => setNewTask({...newTask, estimatedHours: e.target.value})}
                    placeholder="0" min="0"
                    className="w-full px-3 py-2.5 bg-white border-2 border-slate-100 rounded-xl focus:border-blue-400 outline-none font-bold text-slate-700 text-sm" />
                </div>
              </div>

              {/* Remarks */}
              <div>
                <label className="text-[11px] font-bold uppercase text-slate-500 mb-1.5 ml-1 block tracking-wider">Remarks</label>
                <input type="text" value={newTask.remarks} onChange={e => setNewTask({...newTask, remarks: e.target.value})}
                  placeholder="Any additional notes..."
                  className="w-full px-4 py-3 bg-white border-2 border-slate-100 rounded-2xl focus:border-blue-400 outline-none font-semibold text-slate-700 text-sm" />
              </div>

              {/* File Attachment */}
              <div>
                <label className="text-[11px] font-bold uppercase text-slate-500 mb-1.5 ml-1 block tracking-wider">
                  Attach Document <span className="text-slate-300 normal-case font-normal">(optional)</span>
                </label>
                <input type="file" ref={fileInputRef} className="hidden"
                  onChange={e => setAttachedFile(e.target.files[0] || null)} />
                {attachedFile ? (
                  <div className="flex items-center justify-between px-4 py-3 bg-blue-50 border-2 border-blue-100 rounded-2xl">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <FileText size={16} className="text-blue-500 flex-shrink-0" />
                      <span className="text-sm font-semibold text-blue-700 truncate">{attachedFile.name}</span>
                    </div>
                    <button type="button" onClick={() => { setAttachedFile(null); fileInputRef.current.value = ""; }}
                      className="text-slate-400 hover:text-rose-500 transition-colors ml-2">
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <button type="button" onClick={() => fileInputRef.current.click()}
                    className="w-full py-3 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 text-sm font-semibold hover:border-blue-300 hover:text-blue-500 hover:bg-blue-50 transition-all flex items-center justify-center gap-2">
                    <Upload size={16} /> Click to attach a file
                  </button>
                )}
              </div>

              {/* Submit */}
              <button onClick={handleAssignTask} disabled={uploading}
                className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-blue-600 transition-all shadow-lg flex items-center justify-center gap-2 group disabled:opacity-60">
                {uploading ? <span className="animate-pulse">Assigning...</span> : (
                  <><span>Assign Task</span><ArrowUpRight size={18} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" /></>
                )}
              </button>
            </div>
          </aside>

          {/* TASK FEED */}
          <main className="lg:col-span-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Active Feed</h3>
              <div className="h-px flex-1 mx-6 bg-slate-200" />
            </div>
            <div className="space-y-4">
              {loading ? (
                <p className="text-center py-10 font-bold text-slate-400 animate-pulse">Syncing...</p>
              ) : tasks.length === 0 ? (
                <p className="text-center py-16 font-bold text-slate-300 uppercase tracking-widest">No tasks yet</p>
              ) : tasks.map(t => (
                <div key={t._id}
                  className="group bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center gap-5 hover:shadow-xl transition-all cursor-pointer"
                  onClick={() => handleOpenTask(t)}>
                  <div className="flex items-center gap-4 flex-1">
                    <div className="h-14 w-14 rounded-[1.25rem] bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all flex-shrink-0">
                      <User size={24} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h4 className="text-base font-black text-slate-800">{t.title}</h4>
                        <PriorityBadge priority={t.priority} />
                        {t.project && (
                          <span className="flex items-center gap-1 text-[9px] px-2 py-0.5 rounded-full font-bold bg-teal-50 text-teal-600 border border-teal-100">
                            <FolderKanban size={9} /> {t.project?.name || "Project"}
                          </span>
                        )}
                        {t.proofFiles?.length > 0 && (
                          <span className="flex items-center gap-1 text-[9px] px-2 py-0.5 rounded-full font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
                            <Paperclip size={9} /> {t.proofFiles.length}
                          </span>
                        )}
                      </div>
                      <p className="text-slate-500 font-semibold text-sm truncate">
                        → <span className="text-slate-900">{t.assignedTo?.name || "Unassigned"}</span>
                        {t.dueDate && <span className="text-slate-400 ml-2">· Due {new Date(t.dueDate).toLocaleDateString()}</span>}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between md:justify-end gap-4">
                    <StatusBadge status={t.status} />
                    <button onClick={e => handleDelete(e, t._id)} className="p-2.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </main>
        </div>
      </div>

      {/* TASK DETAIL MODAL */}
      {selectedTask && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-8 overflow-y-auto space-y-5">
              <div className="flex justify-between items-start">
                <div className="flex gap-2 flex-wrap">
                  <span className="text-[10px] px-3 py-1.5 bg-slate-100 text-slate-600 rounded-full font-black uppercase tracking-widest">
                    #{selectedTask._id?.slice(-6)}
                  </span>
                  {selectedTask.project && (
                    <span className="text-[10px] px-3 py-1.5 bg-teal-50 text-teal-600 rounded-full font-black uppercase tracking-widest flex items-center gap-1">
                      <FolderKanban size={10} /> {selectedTask.project?.name}
                    </span>
                  )}
                </div>
                <button onClick={() => setSelectedTask(null)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
                  <X size={20} />
                </button>
              </div>

              <h2 className="text-3xl font-black text-slate-900 leading-tight">{selectedTask.title}</h2>

              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Description</p>
                <p className="text-slate-700 font-medium leading-relaxed">{selectedTask.description || "No description."}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <InfoItem label="Assigned To" value={selectedTask.assignedTo?.name} />
                <InfoItem label="Priority"    value={selectedTask.priority} />
                <InfoItem label="Category"    value={selectedTask.category} />
                <InfoItem label="Status"      value={selectedTask.status} />
                {selectedTask.dueDate && <InfoItem label="Due Date" value={new Date(selectedTask.dueDate).toLocaleDateString()} />}
                {selectedTask.estimatedHours > 0 && <InfoItem label="Est. Hours" value={`${selectedTask.estimatedHours}h`} />}
                {selectedTask.remarks && <div className="col-span-2"><InfoItem label="Remarks" value={selectedTask.remarks} /></div>}
              </div>

              {selectedTask.proofFiles?.length > 0 && (
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Paperclip size={11} /> Documents ({selectedTask.proofFiles.length})
                  </p>
                  <div className="space-y-2">
                    {selectedTask.proofFiles.map((file, i) => (
                      <div key={i} className="flex items-center justify-between px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl">
                        <div className="flex items-center gap-2">
                          <FileText size={14} className="text-blue-500" />
                          <span className="text-sm font-semibold text-slate-700 truncate">{file.name || `Document ${i+1}`}</span>
                        </div>
                        <a href={`${API_URL}/tasks/download-proof?filename=${encodeURIComponent(file.url)}&name=${encodeURIComponent(file.name)}`}
                          target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}
                          className="text-[10px] font-black uppercase tracking-wider text-blue-500 hover:text-blue-700 flex items-center gap-1 ml-2">
                          <Eye size={11} /> View
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button onClick={() => setSelectedTask(null)}
                className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 transition-all">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const SummaryCard = ({ label, count, color }) => (
  <div className="bg-white px-5 py-3.5 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-start min-w-[90px]">
    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
    <span className={`text-2xl font-black ${color === "amber" ? "text-amber-500" : color === "green" ? "text-emerald-500" : "text-blue-600"}`}>
      {count < 10 ? `0${count}` : count}
    </span>
  </div>
);

const PriorityBadge = ({ priority }) => {
  const colors = { Low: "bg-slate-100 text-slate-500", Medium: "bg-blue-100 text-blue-600", High: "bg-amber-100 text-amber-600", Critical: "bg-rose-100 text-rose-600" };
  return <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${colors[priority] || colors.Medium}`}>{priority}</span>;
};

const StatusBadge = ({ status }) => {
  const s = { "pending": "bg-slate-100 text-slate-600", "in-progress": "bg-blue-600 text-white", "completed": "bg-emerald-500 text-white", "cancelled": "bg-rose-100 text-rose-600" };
  return (
    <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 ${s[status] || s.pending}`}>
      {status === "pending" ? <Clock size={12} /> : <div className="w-1.5 h-1.5 rounded-full bg-white" />}
      {status}
    </div>
  );
};

const InfoItem = ({ label, value }) => (
  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">{label}</p>
    <p className="text-sm font-black text-slate-800 capitalize">{value || "—"}</p>
  </div>
);

export default Assigntask;