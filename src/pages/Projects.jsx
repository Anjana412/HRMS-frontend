import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FolderKanban, Plus, Search, Users2, Calendar,
  CheckCircle2, Clock, PauseCircle, Loader2, ChevronRight, X
} from "lucide-react";
import { getAllProjects, getMyProjects, createProject, getUsersByType } from "../api/api";
import { toast } from "react-hot-toast";

const STATUS_CONFIG = {
  active:    { label: "Active",     color: "text-emerald-600 bg-emerald-50 border-emerald-200", dot: "bg-emerald-500" },
  completed: { label: "Completed",  color: "text-indigo-600 bg-indigo-50 border-indigo-200",   dot: "bg-indigo-500" },
  "on-hold": { label: "On Hold",    color: "text-amber-600 bg-amber-50 border-amber-200",       dot: "bg-amber-500" },
};

const Projects = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem("usertype") || "employee";
  const canCreate  = ["admin", "projectmanager"].includes(role);
  const canSeeAll  = ["admin", "manager", "hr"].includes(role);

  const [projects, setProjects] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [filter, setFilter]     = useState("all");


  const fetchProjects = async () => {
    try {
      const data = canSeeAll ? await getAllProjects() : await getMyProjects();
      setProjects(Array.isArray(data) ? data : data?.projects || []);
    } catch (err) {
      toast.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProjects(); }, []);

  const filtered = projects.filter(p => {
    const matchSearch = p.name?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || p.status === filter;
    return matchSearch && matchFilter;
  });

  if (loading) return (
    <div className="h-full flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Loading Projects...</p>
      </div>
    </div>
  );

  return (
    <div className="p-6 md:p-8 space-y-6 min-h-screen bg-slate-50/30">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">
            {canSeeAll ? "All Projects" : "My Projects"}
          </h1>
          <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-1">
            {filtered.length} project{filtered.length !== 1 ? "s" : ""} found
          </p>
        </div>
        {canCreate && (
          <button
            onClick={() => navigate("/dashboard/createproject")}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/40 hover:-translate-y-0.5"
          >
            <Plus size={16} /> New Project
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search projects..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none focus:border-indigo-400 transition-all shadow-sm"
          />
        </div>
        <div className="flex gap-2">
          {["all", "active", "on-hold", "completed"].map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                filter === s
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/25"
                  : "bg-white text-slate-500 border border-slate-200 hover:border-indigo-300 hover:text-indigo-600"
              }`}
            >
              {s === "all" ? "All" : STATUS_CONFIG[s]?.label}
            </button>
          ))}
        </div>
      </div>

      {/* Project Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <FolderKanban size={48} className="text-slate-300 mb-4" />
          <p className="text-slate-400 font-black text-sm uppercase tracking-widest">No projects found</p>
          {canCreate && (
            <button onClick={() => navigate("/dashboard/createproject")} className="mt-4 text-indigo-600 font-black text-xs uppercase tracking-widest hover:underline">
              + Create your first project
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map(project => (
            <ProjectCard key={project._id} project={project} onOpen={() => navigate(`/dashboard/projects/${project._id}`)} />
          ))}
        </div>
      )}


    </div>
  );
};

const ProjectCard = ({ project, onOpen }) => {
  const status = STATUS_CONFIG[project.status] || STATUS_CONFIG["active"];
  const memberCount = project.members?.length || 0;
  const dueDate = project.endDate ? new Date(project.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "No deadline";

  return (
    <div
      onClick={onOpen}
      className="bg-white rounded-[1.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group p-6 space-y-4"
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="h-11 w-11 rounded-2xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
          <FolderKanban size={20} className="text-indigo-600" />
        </div>
        <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${status.color} flex items-center gap-1.5`}>
          <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
          {status.label}
        </span>
      </div>

      {/* Name & description */}
      <div>
        <h3 className="font-black text-slate-900 text-base tracking-tight group-hover:text-indigo-600 transition-colors">{project.name}</h3>
        <p className="text-slate-400 text-xs font-medium mt-1 line-clamp-2">{project.description || "No description provided."}</p>
      </div>

      {/* Meta */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-50">
        <div className="flex items-center gap-3 text-slate-400">
          <span className="flex items-center gap-1 text-xs font-bold">
            <Users2 size={13} /> {memberCount} member{memberCount !== 1 ? "s" : ""}
          </span>
          <span className="flex items-center gap-1 text-xs font-bold">
            <Calendar size={13} /> {dueDate}
          </span>
        </div>
        <ChevronRight size={16} className="text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
      </div>
    </div>
  );
};

const CreateProjectModal = ({ onClose, onCreated }) => {
  const [form, setForm]     = useState({ name: "", description: "", startDate: "", endDate: "", status: "active" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!form.name.trim()) return toast.error("Project name is required");
    setLoading(true);
    try {
      await createProject(form);
      toast.success("Project created!");
      onCreated();
    } catch (err) {
      toast.error(err?.message || "Failed to create project");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md p-8 space-y-5" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">New Project</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-400">
            <X size={16} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Project Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Website Redesign"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none focus:border-indigo-400 transition-all"
            />
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Description</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="Brief project overview..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none focus:border-indigo-400 transition-all resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Start Date</label>
              <input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none focus:border-indigo-400 transition-all" />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">End Date</label>
              <input type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none focus:border-indigo-400 transition-all" />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Status</label>
            <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none focus:border-indigo-400 transition-all">
              <option value="active">Active</option>
              <option value="on-hold">On Hold</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-500 font-black text-sm uppercase tracking-widest hover:bg-slate-50 transition-all">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-black text-sm uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/25 disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? <><Loader2 size={14} className="animate-spin" /> Creating...</> : "Create Project"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Projects;