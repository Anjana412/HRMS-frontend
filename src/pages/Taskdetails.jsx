import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Calendar, User, AlignLeft, 
  CheckCircle, Upload, Loader2, Paperclip, X, Download
} from "lucide-react";
import { getTaskById, updateTask } from "../api/api";
import { toast } from "react-hot-toast";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const Taskdetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask]         = useState(null);
  const [downloading, setDownloading] = useState({});
  const [completing, setCompleting] = useState(false);
  const [uploading, setUploading]   = useState(false);

  const fetchTask = async () => {
    try {
      const data = await getTaskById(id);
      setTask(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchTask(); }, [id]);

  // ── Mark task as completed ──────────────────────────────────────────────
  const handleDownloadFile = async (file, index) => {
    setDownloading(prev => ({ ...prev, [index]: true }));
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_URL}/tasks/download-proof?filename=${encodeURIComponent(file.url)}&name=${encodeURIComponent(file.name || "proof_file")}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!response.ok) { toast.error("Download failed"); return; }
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
      toast.error("Download failed");
    } finally {
      setDownloading(prev => ({ ...prev, [index]: false }));
    }
  };

  const handleComplete = async () => {
    setCompleting(true);
    try {
      await updateTask(id, { status: "completed" });
      setTask(prev => ({ ...prev, status: "completed" }));
    } catch (err) {
      alert("Failed to complete task: " + (err.message || "Server error"));
    } finally {
      setCompleting(false);
    }
  };

  // ── Upload proof file ───────────────────────────────────────────────────
  const handleUploadProof = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(`${API_URL}/tasks/uploadproof/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });
      // Update local task state with new proofFiles list
      setTask(prev => ({ ...prev, proofFiles: res.data.proofFiles }));
    } catch (err) {
      alert("Upload failed: " + (err.response?.data?.message || err.message));
    } finally {
      setUploading(false);
    }
  };

  if (!task) return (
    <div className="p-10 text-center font-black animate-pulse text-slate-400">
      Loading Intelligence...
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto animate-in slide-in-from-bottom-4 duration-500">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-400 hover:text-slate-900 font-black uppercase text-[10px] tracking-widest mb-8 transition-colors"
      >
        <ArrowLeft size={16} /> Back to Mission List
      </button>

      <div className="bg-white rounded-[3rem] p-10 shadow-xl border border-slate-100">

        {/* Title + Status */}
        <div className="flex justify-between items-start mb-10">
          <div>
            <span className="px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest">
              Task Briefing
            </span>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter mt-4">{task.title}</h1>
          </div>
          <div className={`px-6 py-2 rounded-2xl font-black text-xs uppercase tracking-widest ${
            task.status === "completed" ? "bg-emerald-500 text-white" : "bg-amber-500 text-white"
          }`}>
            {task.status}
          </div>
        </div>

        {/* Meta */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          <DetailItem 
            icon={<Calendar size={18}/>} 
            label="Deadline" 
            value={task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No deadline set"} 
          />
          <DetailItem 
            icon={<User size={18}/>} 
            label="Assigned By" 
            value={task.assignedBy?.name || "HR Management"} 
          />
        </div>

        {/* Description */}
        <div className="space-y-4 border-t border-slate-50 pt-10">
          <div className="flex items-center gap-2 text-slate-400">
            <AlignLeft size={18} />
            <h3 className="text-xs font-black uppercase tracking-widest">Description</h3>
          </div>
          <p className="text-slate-600 leading-relaxed font-medium bg-slate-50 p-6 rounded-2xl">
            {task.description}
          </p>
        </div>

        {/* ── Proof Files Section ─────────────────────────────────────────── */}
        <div className="mt-10 border-t border-slate-50 pt-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-slate-400">
              <Paperclip size={18} />
              <h3 className="text-xs font-black uppercase tracking-widest">
                Proof Files
                {task.proofFiles?.length > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-indigo-100 text-indigo-600 rounded-full text-[9px]">
                    {task.proofFiles.length}
                  </span>
                )}
              </h3>
            </div>

            {/* Upload button */}
            <label className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-dashed text-[10px] font-black uppercase tracking-widest cursor-pointer transition-all ${
              uploading 
                ? "border-indigo-300 bg-indigo-50 text-indigo-400 cursor-not-allowed" 
                : "border-slate-200 text-slate-500 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50"
            }`}>
              {uploading 
                ? <><Loader2 size={14} className="animate-spin" /> Uploading...</>
                : <><Upload size={14} /> Attach File</>
              }
              <input
                type="file"
                className="hidden"
                accept="*/*"
                disabled={uploading}
                onChange={handleUploadProof}
              />
            </label>
          </div>

          {/* Uploaded files list */}
          {task.proofFiles?.length > 0 ? (
            <div className="space-y-2">
              {task.proofFiles.map((file, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                      <Paperclip size={14} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800 truncate max-w-[260px]">{file.name}</p>
                      <p className="text-[10px] text-slate-400">{new Date(file.uploadedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDownloadFile(file, i)}
                    disabled={downloading[i]}
                    className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all disabled:opacity-50 shrink-0"
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
            <div className="text-center py-8 border-2 border-dashed border-slate-100 rounded-2xl text-slate-300">
              <Paperclip size={24} className="mx-auto mb-2" />
              <p className="text-[10px] font-black uppercase tracking-widest">No files attached yet</p>
            </div>
          )}
        </div>

        {/* ── Complete Mission Button ─────────────────────────────────────── */}
        {task.status !== "completed" && (
          <button 
            onClick={handleComplete}
            disabled={completing}
            className="w-full mt-10 bg-slate-900 text-white py-6 rounded-2xl font-black uppercase tracking-[0.2em] hover:bg-indigo-600 transition-all shadow-xl flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {completing 
              ? <><Loader2 size={20} className="animate-spin" /> Completing...</>
              : <><CheckCircle size={20} /> Complete Mission</>
            }
          </button>
        )}

        {task.status === "completed" && (
          <div className="w-full mt-10 bg-emerald-50 border border-emerald-100 text-emerald-600 py-6 rounded-2xl font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3">
            <CheckCircle size={20} /> Mission Completed
          </div>
        )}

      </div>
    </div>
  );
};

const DetailItem = ({ icon, label, value }) => (
  <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl">
    <div className="text-indigo-600">{icon}</div>
    <div>
      <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">{label}</p>
      <p className="text-sm font-bold text-slate-900">{value}</p>
    </div>
  </div>
);

export default Taskdetails;