import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  ChevronLeft, ChevronRight, Check, AlertCircle,
  FolderKanban, Calendar, Flag, Users, FileText, Upload
} from "lucide-react";
import { createProject, getUsersByType } from "../api/api";

const CATEGORIES = [
  "Web Development", "Mobile App", "Design", "Marketing",
  "Research", "Operations", "IT Infrastructure", "HR Initiative", "Other"
];

const PRIORITIES = [
  { value: "low",      label: "Low",      color: "bg-slate-100 text-slate-700 border-slate-300" },
  { value: "medium",   label: "Medium",   color: "bg-blue-100 text-blue-700 border-blue-300" },
  { value: "high",     label: "High",     color: "bg-amber-100 text-amber-700 border-amber-300" },
  { value: "critical", label: "Critical", color: "bg-rose-100 text-rose-700 border-rose-300" },
];

const STEPS = [
  { label: "Details" },
  { label: "Timeline" },
  { label: "Team" },
  { label: "Files" },
];

const EMPTY = {
  name: "", category: "", description: "", notes: "",
  priority: "medium",
  startDate: new Date().toISOString().split("T")[0],
  deadline: "",
  coordinators: [],
  projectFile: null,
};

const CreateProject = () => {
  const navigate  = useNavigate();
  const [step, setStep]       = useState(0);
  const [form, setForm]       = useState(EMPTY);
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState("");

  // Team lists
  const [coordinatorList, setCoordinatorList] = useState([]);
  const [loadingTeam,     setLoadingTeam]     = useState(false);

  useEffect(() => {
    setLoadingTeam(true);
    getUsersByType("projectcoordinator")
      .then(d => setCoordinatorList(d?.users || []))
      .catch(() => setCoordinatorList([]))
      .finally(() => setLoadingTeam(false));
  }, []);

  const set = (key, val) => {
    setForm(p => ({ ...p, [key]: val }));
    if (errors[key]) setErrors(p => ({ ...p, [key]: "" }));
  };

  const toggleMember = (listKey, id) => {
    setForm(p => ({
      ...p,
      [listKey]: p[listKey].includes(id)
        ? p[listKey].filter(x => x !== id)
        : [...p[listKey], id]
    }));
  };

  const handleFile = e => {
    const file = e.target.files[0];
    if (!file) return;
    set("projectFile", file);
    setFileName(file.name);
  };

  const validateStep = () => {
    const e = {};
    if (step === 0) {
      if (!form.name.trim())  e.name     = "Project name is required";
      if (!form.category)     e.category = "Category is required";
    }
    if (step === 1) {
      if (!form.deadline)     e.deadline = "Deadline is required";
    }
    if (step === 2) {
      if (form.coordinators.length === 0) e.coordinators = "Assign at least one coordinator";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => { if (validateStep()) setStep(s => s + 1); };
  const prev = () => setStep(s => s - 1);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const data = new FormData();
      data.append("name",        form.name);
      data.append("category",    form.category);
      data.append("description", form.description);
      data.append("notes",       form.notes);
      data.append("priority",    form.priority);

      data.append("startDate",   form.startDate);
      data.append("deadline",    form.deadline);
      data.append("coordinators",JSON.stringify(form.coordinators));
      if (form.projectFile) data.append("projectFile", form.projectFile);

      await createProject(data);
      toast.success("Project created successfully!");
      navigate("/dashboard/myprojects");
    } catch (err) {
      toast.error(err?.message || "Failed to create project");
    } finally {
      setLoading(false);
    }
  };

  const selectedPriority = PRIORITIES.find(p => p.value === form.priority);

  return (
    <div className="w-full min-h-screen bg-slate-50/30 p-4 lg:p-8">

      {/* Header */}
      <div className="mb-6 flex items-center gap-4 border-b border-slate-200 pb-6">
        <button onClick={() => navigate(-1)} className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-slate-900 transition-all shadow-sm">
          <ChevronLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">New Project</h1>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">
            Step {step + 1} of {STEPS.length} — {STEPS[step].label}
          </p>
        </div>
        {form.name && (
          <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full bg-teal-100 text-teal-800 border border-teal-200">
            {form.name}
          </span>
        )}
      </div>

      {/* Step bar */}
      <div className="flex items-center gap-1 mb-8">
        {STEPS.map((s, i) => (
          <React.Fragment key={s.label}>
            <div className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${
              i === step ? "bg-teal-600 text-white shadow-lg shadow-teal-600/20" :
              i < step   ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                           "bg-white text-slate-400 border border-slate-200"
            }`}>
              {i < step && <Check size={11} />}
              {s.label}
            </div>
            {i < STEPS.length - 1 && <div className={`w-6 h-0.5 flex-shrink-0 rounded ${i < step ? "bg-emerald-300" : "bg-slate-200"}`} />}
          </React.Fragment>
        ))}
      </div>

      <div className="bg-white rounded-[1.5rem] border border-slate-100 shadow-sm max-w-3xl mx-auto overflow-hidden">
        <div className="p-8 space-y-5">

          {/* STEP 0 — Project Details */}
          {step === 0 && (
            <div className="space-y-5">
              <Field label="Project Name *" icon={<FolderKanban size={14}/>} value={form.name}
                onChange={e => set("name", e.target.value)} placeholder="e.g. Website Redesign 2025"
                hasError={!!errors.name} error={errors.name} />

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block ml-1">Category *</label>
                <select value={form.category} onChange={e => set("category", e.target.value)}
                  className={`w-full px-4 py-3.5 border-2 rounded-xl text-sm font-bold text-slate-700 outline-none transition-all appearance-none ${errors.category ? "border-rose-300 bg-rose-50" : "border-slate-50 bg-slate-50 focus:border-teal-400"}`}>
                  <option value="">Select category...</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <FieldError msg={errors.category} />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block ml-1">Description</label>
                <textarea value={form.description} onChange={e => set("description", e.target.value)}
                  rows={4} placeholder="What is this project about? What are the goals?"
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-50 focus:border-teal-400 rounded-xl text-sm font-medium text-slate-700 outline-none transition-all resize-none" />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 block ml-1">Priority *</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {PRIORITIES.map(p => (
                    <button key={p.value} type="button" onClick={() => set("priority", p.value)}
                      className={`px-4 py-3 rounded-xl border-2 text-xs font-black uppercase tracking-wider transition-all ${
                        form.priority === p.value ? `${p.color} border-current scale-[1.02] shadow-sm` : "bg-slate-50 text-slate-400 border-slate-100 hover:border-slate-300"
                      }`}>
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>


            </div>
          )}

          {/* STEP 1 — Timeline */}
          {step === 1 && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Field label="Start Date" icon={<Calendar size={14}/>} type="date"
                  value={form.startDate} onChange={e => set("startDate", e.target.value)} />
                <Field label="Deadline *" icon={<Calendar size={14}/>} type="date"
                  value={form.deadline} onChange={e => set("deadline", e.target.value)}
                  hasError={!!errors.deadline} error={errors.deadline} />
              </div>

              {/* Duration preview */}
              {form.startDate && form.deadline && (
                <div className="bg-teal-50 border border-teal-100 rounded-2xl p-4 flex items-center justify-between">
                  <span className="text-xs font-black text-teal-600 uppercase tracking-widest">Estimated Duration</span>
                  <span className="text-xl font-black text-teal-700">
                    {Math.max(0, Math.ceil((new Date(form.deadline) - new Date(form.startDate)) / (1000 * 60 * 60 * 24)))} days
                  </span>
                </div>
              )}

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block ml-1">Notes / Remarks</label>
                <textarea value={form.notes} onChange={e => set("notes", e.target.value)}
                  rows={4} placeholder="Any additional notes, requirements or special instructions..."
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-50 focus:border-teal-400 rounded-xl text-sm font-medium text-slate-700 outline-none transition-all resize-none" />
              </div>
            </div>
          )}

          {/* STEP 2 — Team */}
          {step === 2 && (
            <div className="space-y-6">
              {loadingTeam ? (
                <div className="flex items-center justify-center py-12 text-slate-400 gap-3">
                  <div className="w-5 h-5 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm font-bold">Loading team members...</span>
                </div>
              ) : (
                <>
                  {/* Coordinators */}
                  <div className="bg-sky-50 border border-sky-100 rounded-xl px-4 py-3 text-xs font-bold text-sky-700 mb-2">
                    You assign Coordinators. Coordinators will then assign Team Leads, and Team Leads assign Employees.
                  </div>
                  <MemberSection
                    title="Project Coordinators *"
                    subtitle="They assist you in managing the project"
                    members={coordinatorList}
                    selected={form.coordinators}
                    onToggle={id => toggleMember("coordinators", id)}
                    color="sky"
                    error={errors.coordinators}
                  />


                </>
              )}
            </div>
          )}

          {/* STEP 3 — Files + Summary */}
          {step === 3 && (
            <div className="space-y-5">
              {/* File upload */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 flex items-center gap-1.5 ml-1">
                  <FileText size={13} className="text-teal-400" /> Project Document (PDF / DOC)
                </label>
                <label className="flex items-center gap-3 px-4 py-4 bg-slate-50 border-2 border-dashed border-slate-200 hover:border-teal-400 rounded-xl cursor-pointer transition-all">
                  <Upload size={18} className="text-slate-400 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-slate-500">{fileName || "Click to upload project brief or document"}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">PDF, DOC, DOCX · Max 10MB</p>
                  </div>
                  <input type="file" accept=".pdf,.doc,.docx" onChange={handleFile} className="hidden" />
                </label>
              </div>

              {/* Summary */}
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 space-y-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Project Summary</p>
                {[
                  ["Name",        form.name],
                  ["Category",    form.category],
                  ["Priority",    form.priority],
                  ["Start Date",  form.startDate],
                  ["Deadline",    form.deadline],
                  ["Coordinators", form.coordinators.length + " assigned"],
                  ["File",         fileName || "None"],
                ].filter(([, v]) => v).map(([l, v]) => (
                  <div key={l} className="flex justify-between text-xs border-b border-slate-100 pb-2 last:border-0">
                    <span className="font-black text-slate-400 uppercase tracking-widest">{l}</span>
                    <span className="font-bold text-slate-700 capitalize">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-8 py-5 flex justify-between items-center border-t border-slate-100">
          <button type="button" onClick={step === 0 ? () => navigate(-1) : prev}
            className="flex items-center gap-2 px-6 py-3 rounded-xl border border-slate-200 text-slate-500 font-black text-xs uppercase tracking-widest hover:bg-white transition-all">
            <ChevronLeft size={13} /> {step === 0 ? "Cancel" : "Back"}
          </button>
          {step < STEPS.length - 1 ? (
            <button type="button" onClick={next}
              className="flex items-center gap-2 px-8 py-3 bg-teal-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-teal-700 transition-all shadow-lg shadow-teal-600/25">
              Next <ChevronRight size={13} />
            </button>
          ) : (
            <button type="button" onClick={handleSubmit} disabled={loading}
              className="flex items-center gap-2 px-8 py-3 bg-emerald-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/25 disabled:opacity-60">
              {loading ? "Creating..." : <><Check size={13} /> Create Project</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Member picker section ────────────────────────────────────
const MemberSection = ({ title, subtitle, members, selected, onToggle, color, error }) => (
  <div>
    <div className="mb-3">
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{title}</p>
      <p className="text-xs text-slate-400 font-medium mt-0.5">{subtitle}</p>
    </div>
    {members.length === 0 ? (
      <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-center text-xs font-bold text-slate-400">
        No {title.toLowerCase()} found in the system
      </div>
    ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {members.map(m => (
          <button key={m._id} type="button" onClick={() => onToggle(m._id)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all ${
              selected.includes(m._id)
                ? `border-${color}-500 bg-${color}-50`
                : "border-slate-100 bg-slate-50 hover:border-slate-300"
            }`}>
            {m.photo
              ? <img src={m.photo} alt={m.name} className="h-9 w-9 rounded-xl object-cover flex-shrink-0" />
              : <div className={`h-9 w-9 rounded-xl flex items-center justify-center text-white font-black text-sm flex-shrink-0 ${
                  selected.includes(m._id) ? `bg-${color}-600` : "bg-slate-400"
                }`}>{m.name?.charAt(0)}</div>
            }
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black text-slate-900 truncate">{m.name}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase">{m.department || m.employeeId}</p>
            </div>
            {selected.includes(m._id) && <Check size={14} className={`text-${color}-600 flex-shrink-0`} />}
          </button>
        ))}
      </div>
    )}
    <FieldError msg={error} />
  </div>
);

const Field = ({ label, icon, hasError, error, ...props }) => (
  <div>
    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 flex items-center gap-1.5 ml-1">
      <span className="text-teal-400">{icon}</span> {label}
    </label>
    <input {...props} className={`w-full px-4 py-3.5 border-2 rounded-xl text-sm font-bold text-slate-700 placeholder:text-slate-300 outline-none transition-all ${hasError ? "border-rose-300 bg-rose-50" : "border-slate-50 bg-slate-50 focus:border-teal-400 focus:bg-white"}`} />
    <FieldError msg={error} />
  </div>
);

const FieldError = ({ msg }) => msg ? (
  <p className="flex items-center gap-1.5 text-rose-500 text-[10px] font-semibold mt-1.5 ml-1">
    <AlertCircle size={11} /> {msg}
  </p>
) : null;

export default CreateProject;