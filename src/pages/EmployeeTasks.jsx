import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, Clock, AlertCircle, FileText, Paperclip } from "lucide-react";
import { getAllTasks } from "../api/api";

const EmployeeTasks = () => {
  const [tasks, setTasks]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState("all");

  const fetchTasks = async () => {
    try {
      const data = await getAllTasks();
      setTasks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Task Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTasks(); }, []);

  const filteredTasks = tasks.filter(task => {
    if (filter === "all") return true;
    return task.status.toLowerCase() === filter.toLowerCase();
  });

  if (loading) return (
    <div className="p-10 text-center font-black animate-pulse text-slate-400 uppercase tracking-widest">
      Synchronizing Tasks...
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">

      {/* Header & Filter */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Mission Control</h1>
          <p className="text-slate-500 font-bold text-xs uppercase tracking-[0.2em] mt-2">Active Task Assignments</p>
        </div>
        <div className="flex bg-white p-1 rounded-2xl border border-slate-100 shadow-sm">
          {["all", "pending", "completed"].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                filter === type ? "bg-slate-900 text-white shadow-lg" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Task List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredTasks.map((task) => (
          <Link
            to={`/dashboard/tasks/${task._id || task.id}`}
            key={task._id || task.id}
            className="block group"
          >
            <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-500 flex flex-col md:flex-row justify-between gap-6 cursor-pointer">

              {/* Task Info */}
              <div className="flex gap-6 flex-1">
                <div className={`h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 ${
                  task.status === "completed" ? "bg-emerald-50 text-emerald-600" : "bg-indigo-50 text-indigo-600"
                }`}>
                  {task.status === "completed" ? <CheckCircle2 size={28} /> : <Clock size={28} />}
                </div>

                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight group-hover:text-indigo-600 transition-colors">
                    {task.title}
                  </h2>
                  <p className="text-slate-500 text-sm font-medium mt-1 max-w-md line-clamp-2">
                    {task.description}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 mt-4">
                    <div className="flex items-center gap-1.5 text-slate-400 font-bold text-[10px] uppercase tracking-wider">
                      <AlertCircle size={14} />
                      <span>Due: {new Date(task.dueDate || task.deadline).toLocaleDateString()}</span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${
                      task.status === "completed" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                    }`}>
                      {task.status}
                    </span>
                    {task.proofFiles?.length > 0 && (
                      <span className="flex items-center gap-1 px-3 py-1 rounded-full text-[9px] font-black uppercase bg-indigo-100 text-indigo-700">
                        <Paperclip size={10} /> {task.proofFiles.length} file{task.proofFiles.length > 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Read-only status + click hint */}
              <div className="flex items-center self-center gap-3 shrink-0">
                <div className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border ${
                  task.status === "completed"
                    ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                    : "bg-amber-50 text-amber-600 border-amber-100"
                }`}>
                  {task.status === "completed" ? "✓ Completed" : "In Progress"}
                </div>
                <div className="text-[9px] font-black uppercase tracking-widest text-slate-300 group-hover:text-indigo-400 transition-colors">
                  Open →
                </div>
              </div>

            </div>
          </Link>
        ))}

        {filteredTasks.length === 0 && (
          <div className="bg-white rounded-[2rem] p-20 text-center border border-dashed border-slate-200">
            <FileText size={48} className="mx-auto text-slate-200 mb-4" />
            <p className="text-slate-400 font-black uppercase tracking-widest text-sm">No Missions Found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeTasks;