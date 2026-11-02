import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  ArrowLeft, Edit3, Trash2, Check, X, Loader2,
  Calendar, Flag, Users, FileText, FolderKanban,
  Clock, User, Download, UserPlus, UserMinus, ExternalLink
} from "lucide-react";
import {
  getProjectById, updateProject, deleteProject,
  assignTeamMember, removeTeamMember, getUsersByType
} from "../api/api";

const PRIORITY_COLORS = {
  low:      "bg-slate-100 text-slate-700 border-slate-200",
  medium:   "bg-blue-100 text-blue-700 border-blue-200",
  high:     "bg-amber-100 text-amber-700 border-amber-200",
  critical: "bg-rose-100 text-rose-700 border-rose-200",
};

const STATUS_COLORS = {
  active:    "bg-emerald-100 text-emerald-700 border-emerald-200",
  "on-hold": "bg-amber-100 text-amber-700 border-amber-200",
  completed: "bg-indigo-100 text-indigo-700 border-indigo-200",
};

const ROLE_COLORS = {
  projectcoordinator: "bg-sky-100 text-sky-700",
  teamlead:           "bg-emerald-100 text-emerald-700",
  employee:           "bg-slate-100 text-slate-700",
};

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const role = localStorage.getItem("usertype") || "employee";

  const canEdit   = ["admin", "projectmanager"].includes(role);
  const canDelete = ["admin", "projectmanager"].includes(role);
  const canAssign = ["admin", "projectmanager"].includes(role);
  const canChangeStatus = ["admin", "manager"].includes(role);

  const [project, setProject]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving]     = useState(false);
  const [showAssign, setShowAssign] = useState(false);

  const [form, setForm] = useState({});

  // For assign modal
  const [coordinatorList, setCoordinatorList] = useState([]);
  const [loadingList, setLoadingList]         = useState(false);
  const [selectedUser, setSelectedUser]       = useState("");
  const [selectedRole, setSelectedRole]       = useState("projectcoordinator");
  const [assigning, setAssigning]             = useState(false);

  const fetchProject = async () => {
    try {
      setLoading(true);
      const data = await getProjectById(id);
      const p = data.project || data;
      setProject(p);
      setForm({
        name:        p.name        || "",
        description: p.description || "",
        category:    p.category    || "",
        priority:    p.priority    || "medium",
        status:      p.status      || "active",
        startDate:   p.startDate   || "",
        deadline:    p.deadline    || "",
        notes:       p.notes       || "",
      });
    } catch {
      toast.error("Failed to load project");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProject(); }, [id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProject(id, form);
      toast.success("Project updated!");
      setIsEditing(false);
      fetchProject();
    } catch (err) {
      toast.error(err?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${project.name}"? This cannot be undone.`)) return;
    try {
      await deleteProject(id);
      toast.success("Project deleted");
      navigate("/dashboard/myprojects");
    } catch (err) {
      toast.error(err?.message || "Delete failed");
    }
  };

  const handleRemoveMember = async (userId, memberName) => {
    if (!window.confirm(`Remove ${memberName} from this project?`)) return;
    try {
      await removeTeamMember(id, userId);
      toast.success("Member removed");
      fetchProject();
    } catch (err) {
      toast.error(err?.message || "Failed to remove member");
    }
  };

  const openAssignModal = async () => {
    setShowAssign(true);
    loadUsersForRole(selectedRole);
  };

  const loadUsersForRole = async (role) => {
    setLoadingList(true);
    try {
      const data = await getUsersByType(role);
      setCoordinatorList(data?.users || []);
    } catch {
      setCoordinatorList([]);
    } finally {
      setLoadingList(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedUser) return toast.error("Select a user first");
    setAssigning(true);
    try {
      await assignTeamMember(id, { userId: selectedUser, roleInProject: selectedRole });
      toast.success("Member assigned!");
      setShowAssign(false);
      setSelectedUser("");
      fetchProject();
    } catch (err) {
      toast.error(err?.message || "Failed to assign member");
    } finally {
      setAssigning(false);
    }
  };

  const [downloading, setDownloading] = useState(false);

  const handleDownloadFile = () => {
    if (!project?.projectFile) return;
    setDownloading(true);

    try {
      // Append fl_attachment to force Cloudinary to serve it as a download
      const url  = project.projectFile;
      const downloadUrl = url.includes("cloudinary.com")
        ? url.replace("/upload/", "/upload/fl_attachment/")
        : url;

      const a    = document.createElement("a");
      a.href     = downloadUrl;
      a.target   = "_blank";
      a.rel      = "noreferrer";
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast.success("Download started!");
    } catch (err) {
      window.open(project.projectFile, "_blank");
      toast("Opened in new tab — right-click to save", { icon: "ℹ️" });
    } finally {
      setTimeout(() => setDownloading(false), 1500);
    }
  };

  const daysLeft = project?.deadline
    ? Math.ceil((new Date(project.deadline) - new Date()) / (1000 * 60 * 60 * 24))
    : null;

  if (loading) return (
    <div className="h-full flex flex-col items-center justify-center gap-3">
      <Loader2 className="animate-spin text-teal-600" size={40} />
      <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Loading project...</p>
    </div>
  );

  if (!project) return (
    <div className="h-full flex items-center justify-center">
      <p className="text-slate-400 font-bold">Project not found</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50/30 p-4 lg:p-8 space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white rounded-[1.5rem] border border-slate-100 shadow-sm p-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-400 hover:text-slate-900 transition-all">
            <ArrowLeft size={18} />
          </button>
          <div>
            {isEditing ? (
              <input value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))}
                className="text-2xl font-black text-slate-900 tracking-tighter bg-slate-50 border-b-2 border-teal-400 outline-none px-2 py-1 rounded-t-lg" />
            ) : (
              <h1 className="text-2xl font-black text-slate-900 tracking-tighter">{project.name}</h1>
            )}
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                {project.projectCode}
              </span>
              {project.category && (
                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg">
                  {project.category}
                </span>
              )}
              <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${PRIORITY_COLORS[project.priority] || PRIORITY_COLORS.medium}`}>
                {project.priority}
              </span>
              <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${STATUS_COLORS[project.status] || STATUS_COLORS.active}`}>
                {project.status}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <button onClick={() => { setIsEditing(false); setForm({...project}); }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-500 font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all">
                <X size={14} /> Cancel
              </button>
              <button onClick={handleSave} disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-teal-700 transition-all shadow-lg shadow-teal-600/25 disabled:opacity-60">
                {saving ? <Loader2 size={13} className="animate-spin"/> : <Check size={13}/>} Save
              </button>
            </>
          ) : (
            <>
              {canEdit && (
                <button onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-teal-600 transition-all">
                  <Edit3 size={13} /> Edit
                </button>
              )}
              {canDelete && (
                <button onClick={handleDelete}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-rose-500 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-rose-50 hover:border-rose-200 transition-all">
                  <Trash2 size={13} /> Delete
                </button>
              )}
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left — main info */}
        <div className="lg:col-span-2 space-y-5">

          {/* Description */}
          <Section title="Description">
            {isEditing ? (
              <textarea value={form.description} onChange={e => setForm(p => ({...p, description: e.target.value}))}
                rows={4} placeholder="Project description..."
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-50 focus:border-teal-400 rounded-xl text-sm font-medium text-slate-700 outline-none transition-all resize-none" />
            ) : (
              <p className="text-sm font-medium text-slate-600 leading-relaxed">
                {project.description || <span className="text-slate-300">No description provided</span>}
              </p>
            )}
          </Section>

          {/* Timeline */}
          <Section title="Timeline">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <TimeCard label="Start Date" value={project.startDate ? new Date(project.startDate).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric"}) : "—"} icon={<Calendar size={14}/>} />
              <TimeCard label="Deadline"   value={project.deadline  ? new Date(project.deadline).toLocaleDateString("en-IN",  { day:"numeric", month:"short", year:"numeric"}) : "—"} icon={<Clock size={14}/>} color={daysLeft !== null && daysLeft < 7 ? "text-rose-600" : "text-slate-900"} />
              <TimeCard label="Days Left"  value={daysLeft === null ? "—" : daysLeft < 0 ? "Overdue" : `${daysLeft} days`} icon={<Flag size={14}/>} color={daysLeft !== null && daysLeft < 0 ? "text-rose-600" : daysLeft < 7 ? "text-amber-600" : "text-emerald-600"} />
            </div>

            {/* Edit timeline */}
            {isEditing && (
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">Start Date</label>
                  <input type="date" value={form.startDate} onChange={e => setForm(p => ({...p, startDate: e.target.value}))}
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-50 focus:border-teal-400 rounded-xl text-sm font-bold text-slate-700 outline-none" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">Deadline</label>
                  <input type="date" value={form.deadline} onChange={e => setForm(p => ({...p, deadline: e.target.value}))}
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-50 focus:border-teal-400 rounded-xl text-sm font-bold text-slate-700 outline-none" />
                </div>
              </div>
            )}
          </Section>

          {/* Status — only admin/director can change */}
          {isEditing && canChangeStatus && (
            <Section title="Project Status">
              <div className="flex gap-2 flex-wrap">
                {["active", "on-hold", "completed"].map(s => (
                  <button key={s} type="button" onClick={() => setForm(p => ({...p, status: s}))}
                    className={`px-4 py-2.5 rounded-xl border-2 text-xs font-black uppercase tracking-wider transition-all ${
                      form.status === s ? `${STATUS_COLORS[s]} border-current` : "bg-slate-50 text-slate-400 border-slate-100 hover:border-slate-300"
                    }`}>
                    {s}
                  </button>
                ))}
              </div>
            </Section>
          )}

          {/* Priority edit */}
          {isEditing && (
            <Section title="Priority">
              <div className="flex gap-2 flex-wrap">
                {["low","medium","high","critical"].map(p => (
                  <button key={p} type="button" onClick={() => setForm(prev => ({...prev, priority: p}))}
                    className={`px-4 py-2.5 rounded-xl border-2 text-xs font-black uppercase tracking-wider transition-all ${
                      form.priority === p ? `${PRIORITY_COLORS[p]} border-current` : "bg-slate-50 text-slate-400 border-slate-100 hover:border-slate-300"
                    }`}>
                    {p}
                  </button>
                ))}
              </div>
            </Section>
          )}

          {/* Notes */}
          <Section title="Notes">
            {isEditing ? (
              <textarea value={form.notes} onChange={e => setForm(p => ({...p, notes: e.target.value}))}
                rows={3} placeholder="Additional notes..."
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-50 focus:border-teal-400 rounded-xl text-sm font-medium text-slate-700 outline-none transition-all resize-none" />
            ) : (
              <p className="text-sm font-medium text-slate-600">
                {project.notes || <span className="text-slate-300">No notes</span>}
              </p>
            )}
          </Section>

          {/* Project file */}
          {project.projectFile && (
            <Section title="Project Document">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleDownloadFile}
                  disabled={downloading}
                  className="flex items-center gap-3 px-4 py-3 bg-teal-50 border border-teal-100 rounded-xl hover:bg-teal-100 transition-all disabled:opacity-60"
                >
                  {downloading
                    ? <Loader2 size={15} className="text-teal-600 animate-spin" />
                    : <Download size={15} className="text-teal-600" />
                  }
                  <span className="text-sm font-black text-teal-700">
                    {downloading ? "Downloading..." : "Download Project File"}
                  </span>
                </button>
                <a
                  href={project.projectFile}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-all"
                  title="Open in new tab"
                >
                  <ExternalLink size={15} className="text-slate-500" />
                  <span className="text-sm font-black text-slate-600">Open</span>
                </a>
              </div>
            </Section>
          )}
        </div>

        {/* Right — team & meta */}
        <div className="space-y-5">

          {/* Created by */}
          <Section title="Created By">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-teal-600 flex items-center justify-center text-white font-black text-sm">
                {project.createdBy?.name?.charAt(0) || "?"}
              </div>
              <div>
                <p className="text-sm font-black text-slate-900">{project.createdBy?.name || "—"}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{project.createdBy?.usertype || "—"}</p>
              </div>
            </div>
          </Section>

          {/* Team members */}
          <div className="bg-white rounded-[1.5rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Team ({project.members?.length || 0})</h3>
              {canAssign && (
                <button onClick={openAssignModal}
                  className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-teal-600 hover:text-teal-700 transition-colors">
                  <UserPlus size={13} /> Assign
                </button>
              )}
            </div>

            {(!project.members || project.members.length === 0) ? (
              <div className="py-10 text-center text-slate-300 font-bold text-sm">No members assigned yet</div>
            ) : (
              <div className="divide-y divide-slate-50">
                {project.members.map(m => (
                  <div key={m._id || m.user?._id} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50/50 transition-colors group">
                    {m.user?.photo
                      ? <img src={m.user.photo} alt={m.user.name} className="h-9 w-9 rounded-xl object-cover flex-shrink-0" />
                      : <div className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-xs flex-shrink-0">
                          {m.user?.name?.charAt(0) || "?"}
                        </div>
                    }
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black text-slate-900 truncate">{m.user?.name || "Unknown"}</p>
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg ${ROLE_COLORS[m.roleInProject] || "bg-slate-100 text-slate-600"}`}>
                        {m.roleInProject || m.user?.usertype}
                      </span>
                    </div>
                    {canAssign && (
                      <button onClick={() => handleRemoveMember(m.user?._id, m.user?.name)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all">
                        <UserMinus size={13} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick stats */}
          <Section title="Quick Info">
            <div className="space-y-3">
              <InfoRow label="Project Code" value={project.projectCode || "—"} />
              <InfoRow label="Category"     value={project.category    || "—"} />
              <InfoRow label="Priority"     value={project.priority    || "—"} />
              <InfoRow label="Status"       value={project.status      || "—"} />
              <InfoRow label="Members"      value={project.members?.length || 0} />
              <InfoRow label="Created"      value={project.createdAt ? new Date(project.createdAt).toLocaleDateString("en-IN") : "—"} />
            </div>
          </Section>
        </div>
      </div>

      {/* Assign Member Modal */}
      {showAssign && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowAssign(false)}>
          <div className="bg-white rounded-[1.5rem] shadow-2xl w-full max-w-md p-7 space-y-5" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">Assign Member</h2>
              <button onClick={() => setShowAssign(false)} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 transition-colors">
                <X size={15} />
              </button>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Role in Project</label>
              <select value={selectedRole} onChange={e => { setSelectedRole(e.target.value); setSelectedUser(""); loadUsersForRole(e.target.value); }}
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-50 focus:border-teal-400 rounded-xl text-sm font-bold text-slate-700 outline-none appearance-none">
                <option value="projectcoordinator">Project Coordinator</option>
                <option value="teamlead">Team Lead</option>
                <option value="employee">Employee</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Select Person</label>
              {loadingList ? (
                <div className="flex items-center justify-center py-6 text-slate-400 gap-2">
                  <Loader2 size={16} className="animate-spin" />
                  <span className="text-sm font-bold">Loading...</span>
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {coordinatorList.map(u => (
                    <button key={u._id} type="button" onClick={() => setSelectedUser(u._id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all ${
                        selectedUser === u._id ? "border-teal-400 bg-teal-50" : "border-slate-100 bg-slate-50 hover:border-slate-300"
                      }`}>
                      {u.photo
                        ? <img src={u.photo} alt={u.name} className="h-8 w-8 rounded-lg object-cover" />
                        : <div className="h-8 w-8 rounded-lg bg-teal-600 flex items-center justify-center text-white font-black text-xs">{u.name?.charAt(0)}</div>
                      }
                      <div>
                        <p className="text-sm font-black text-slate-900">{u.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">{u.department || u.employeeId}</p>
                      </div>
                      {selectedUser === u._id && <Check size={14} className="ml-auto text-teal-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowAssign(false)}
                className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-500 font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all">
                Cancel
              </button>
              <button onClick={handleAssign} disabled={assigning || !selectedUser}
                className="flex-1 py-3 rounded-xl bg-teal-600 text-white font-black text-xs uppercase tracking-widest hover:bg-teal-700 transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                {assigning ? <><Loader2 size={13} className="animate-spin"/> Assigning...</> : <><UserPlus size={13}/> Assign</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Section = ({ title, children }) => (
  <div className="bg-white rounded-[1.5rem] border border-slate-100 shadow-sm p-6">
    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">{title}</h3>
    {children}
  </div>
);

const TimeCard = ({ label, value, icon, color = "text-slate-900" }) => (
  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
    <div className="flex items-center gap-2 text-slate-400 mb-1">
      {icon}
      <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
    </div>
    <p className={`text-lg font-black tracking-tight ${color}`}>{value}</p>
  </div>
);

const InfoRow = ({ label, value }) => (
  <div className="flex justify-between items-center text-xs border-b border-slate-50 pb-2 last:border-0">
    <span className="font-black text-slate-400 uppercase tracking-widest">{label}</span>
    <span className="font-bold text-slate-700 capitalize">{value}</span>
  </div>
);

export default ProjectDetail;