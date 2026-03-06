import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { 
  Plus, Search, ClipboardList, Clock, 
  Trash2, User, ArrowUpRight, X, Calendar, UserCheck 
} from "lucide-react";
import { getAllTasks, getUsersByType, createTask, deleteTaskApi } from "../api/api";

const Assigntask = () => {
  const [employees, setEmployees] = useState([]); 
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showList, setShowList] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null); 

  const [newTask, setNewTask] = useState({ 
    assignedTo: "", 
    title: "", 
    description: "", 
    priority: "Medium" 
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const empData = await getUsersByType("employee");
      const taskData = await getAllTasks();
      setEmployees(empData.users || []); 
      setTasks(taskData || []);
    } catch (error) {
      toast.error("Error connecting to server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAssignTask = async () => {
    if (!newTask.assignedTo || !newTask.title.trim()) {
      toast.error("Please select an employee and title");
      return;
    }
    try {
      await createTask({ ...newTask, dueDate: new Date() });
      toast.success("Task assigned successfully");
      setNewTask({ assignedTo: "", title: "", description: "", priority: "Medium" });
      setSearch("");
      fetchData();
    } catch (error) {
      toast.error(error.message || "Assignment failed");
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation(); // Prevents modal from opening when clicking delete
    if (!window.confirm("Delete this task?")) return;
    try {
      await deleteTaskApi(id);
      setTasks(tasks.filter(t => t._id !== id));
      toast.success("Task deleted");
    } catch (error) {
      toast.error("Failed to delete task");
    }
  };

  return (
    // RESTORED: p-4 lg:p-10 (but kept pt-2 to keep it high on the page)
    <div className="min-h-screen bg-[#F1F5F9] px-4 pt-2 pb-10 lg:px-10 text-slate-900 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER: Restored 4xl text and original spacing */}
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
            <SummaryCard label="Pending" count={tasks.filter(t => t.status === "pending").length} color="amber" />
            <SummaryCard label="Total" count={tasks.length} color="blue" />
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* ASIDE: RESTORED LARGE PADDING AND TEXT */}
          <aside className="lg:col-span-4">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-200 sticky top-4">
              <div className="flex items-center gap-3 mb-8">
                <div className="bg-blue-50 p-2 rounded-xl text-blue-600">
                  <Plus size={20} strokeWidth={3} />
                </div>
                <h2 className="text-xl font-black text-slate-800 tracking-tight">Create New Task</h2>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="text-[11px] font-bold uppercase text-slate-500 mb-1.5 ml-1 block tracking-wider">Assign To</label>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="text"
                      placeholder="Search employee..."
                      value={search}
                      onChange={(e) => { setSearch(e.target.value); setShowList(true); }}
                      className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-slate-100 rounded-2xl focus:border-blue-500/50 outline-none font-semibold text-slate-700 shadow-sm transition-all"
                    />
                  </div>
                  {showList && search && (
                    <div className="absolute mt-2 w-full bg-white border border-slate-100 rounded-2xl shadow-2xl z-50 overflow-hidden">
                      {employees.filter(e => e.name.toLowerCase().includes(search.toLowerCase())).map((emp) => (
                        <button
                          key={emp._id}
                          onClick={() => { 
                            setSearch(emp.name); 
                            setNewTask({ ...newTask, assignedTo: emp._id }); 
                            setShowList(false); 
                          }}
                          className="w-full text-left px-5 py-3 hover:bg-blue-50 font-bold text-slate-700 transition-colors"
                        >
                          {emp.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-[11px] font-black uppercase text-slate-400 mb-2 block tracking-widest">Priority Level</label>
                  <div className="flex gap-2">
                    {['Low', 'Medium', 'High'].map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setNewTask({ ...newTask, priority: p })}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                          newTask.priority === p 
                          ? 'bg-slate-900 text-white shadow-lg' 
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase text-slate-500 mb-1.5 ml-1 block tracking-wider">Task Title</label>
                  <input
                    type="text"
                    className="w-full px-5 py-3.5 bg-white border-2 border-slate-100 rounded-2xl focus:border-blue-500/50 outline-none font-semibold text-slate-700 shadow-sm"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase text-slate-500 mb-1.5 ml-1 block tracking-wider">Description</label>
                  <textarea
                    rows="3"
                    className="w-full px-5 py-3.5 bg-white border-2 border-slate-100 rounded-2xl focus:border-blue-500/50 outline-none resize-none font-semibold text-slate-700 shadow-sm"
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  />
                </div>

                <button
                  onClick={handleAssignTask}
                  className="w-full py-4 mt-2 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 transition-all shadow-lg flex items-center justify-center gap-2 group"
                >
                  <span className="text-lg">Assign Work</span> 
                  <ArrowUpRight size={20} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </button>
              </div>
            </div>
          </aside>

          {/* MAIN: RESTORED LARGE TEXT IN FEED */}
          <main className="lg:col-span-8">
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Active Feed</h3>
                <div className="h-px flex-1 mx-6 bg-slate-200"></div>
            </div>

            <div className="space-y-4">
              {loading ? (
                <p className="text-center py-10 font-bold text-slate-400 animate-pulse">Syncing...</p>
              ) : tasks.map((t) => (
                <div 
                  key={t._id} 
                  className="group bg-white p-7 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center gap-6 hover:shadow-xl transition-all cursor-pointer"
                  onClick={() => setSelectedTask(t)}
                >
                  <div className="flex items-center gap-5 flex-1">
                    <div className="h-16 w-16 rounded-[1.25rem] bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                      <User size={28} />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="text-lg font-black text-slate-800">{t.title}</h4>
                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          t.priority === 'High' ? 'bg-rose-100 text-rose-600' : 
                          t.priority === 'Medium' ? 'bg-blue-100 text-blue-600' : 
                          'bg-slate-100 text-slate-500'
                        }`}>
                          {t.priority || 'Medium'}
                        </span>
                      </div>
                      <p className="text-slate-500 font-semibold text-sm">
                        Owner: <span className="text-slate-900">{t.assignedTo?.name || "Unassigned"}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-6">
                    <StatusBadge status={t.status} />
                    <button onClick={(e) => handleDelete(e, t._id)} className="p-3 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all">
                      <Trash2 size={22} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </main>
        </div>
      </div>

      {/* --- TASK DETAILS MODAL (RESTORED LARGE TEXT) --- */}
      {selectedTask && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-10">
              <div className="flex justify-between items-start mb-8">
                <span className="text-[11px] px-4 py-1.5 bg-slate-100 text-slate-600 rounded-full font-black uppercase tracking-widest">
                  Task ID: {selectedTask._id.slice(-6)}
                </span>
                <button onClick={() => setSelectedTask(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                  <X size={24} />
                </button>
              </div>

              <h2 className="text-4xl font-black text-slate-900 mb-6 leading-tight">
                {selectedTask.title}
              </h2>

              <div className="space-y-8">
                <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100">
                  <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Description</h5>
                  <p className="text-slate-700 text-lg font-medium leading-relaxed">
                    {selectedTask.description || "No description provided."}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-8 px-2">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><UserCheck size={24}/></div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Assigned To</p>
                      <p className="text-base font-black text-slate-800">{selectedTask.assignedTo?.name || "N/A"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl"><Calendar size={24}/></div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Priority</p>
                      <p className="text-base font-black text-slate-800">{selectedTask.priority}</p>
                    </div>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setSelectedTask(null)}
                className="w-full mt-10 py-5 bg-slate-900 text-white text-lg font-black rounded-[1.5rem] hover:bg-slate-800 transition-all shadow-2xl shadow-slate-200"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const SummaryCard = ({ label, count, color }) => (
  <div className="bg-white px-6 py-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-start min-w-[100px]">
    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
    <span className={`text-2xl font-black ${color === 'amber' ? 'text-amber-500' : 'text-blue-600'}`}>
      {count < 10 ? `0${count}` : count}
    </span>
  </div>
);

const StatusBadge = ({ status }) => {
  const styles = {
    "pending": "bg-slate-100 text-slate-600",
    "in-progress": "bg-blue-600 text-white shadow-lg",
    "completed": "bg-emerald-500 text-white shadow-lg",
  };
  return (
    <div className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-wider flex items-center gap-2 ${styles[status] || styles.pending}`}>
      {status === "pending" ? <Clock size={14} /> : <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
      {status}
    </div>
  );
};

export default Assigntask;