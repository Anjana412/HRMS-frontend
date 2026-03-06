import React, { useEffect, useState } from "react";
import { Check, X, Clock, Calendar, User, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { getAllLeaveRequests, updateLeaveStatus } from "../api/api"; 

const ViewLeaverequest = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Stats calculation based on live data
  const stats = {
    pending: requests.filter(r => r.status === "pending").length,
    approved: requests.filter(r => r.status === "approved").length,
    rejected: requests.filter(r => r.status === "rejected").length,
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await getAllLeaveRequests();
      // data is the array of leaves returned by your controller
      setRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error("Critical: Could not sync with HR database");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, newStatus) => {
    try {
      // Calls leaverouter.put("/updateleave/:id"...)
      await updateLeaveStatus(id, { status: newStatus });
      
      // Update local state so UI reflects change immediately
      setRequests(prev => prev.map(req => 
        req._id === id ? { ...req, status: newStatus } : req
      ));
      
      toast.success(`Request ${newStatus.toUpperCase()}`);
    } catch (err) {
      toast.error("Update terminal error: Action failed");
    }
  };

  return (
    <div className="p-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Leave Requests</h2>
          <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-2 flex items-center gap-2">
            <Clock size={14} className="text-indigo-600" />
            Pending Authorization Queue
          </p>
        </div>
        <button 
          onClick={fetchRequests}
          className="p-2 bg-slate-100 rounded-full hover:bg-indigo-100 text-slate-400 hover:text-indigo-600 transition-all"
        >
          <Loader2 size={20} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard label="Pending" count={stats.pending} color="text-amber-500" />
        <StatCard label="Approved" count={stats.approved} color="text-emerald-500" />
        <StatCard label="Rejected" count={stats.rejected} color="text-rose-500" />
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="p-20 text-center">
            <Loader2 className="animate-spin mx-auto text-indigo-500 mb-2" size={40} />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Syncing Data...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="p-20 text-center">
            <AlertCircle className="mx-auto text-slate-200 mb-4" size={48} />
            <p className="text-slate-400 font-bold">No active requests found</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Employee</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Type/Period</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Reason</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-center">Status</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {requests.map((req) => (
                <tr key={req._id} className="hover:bg-slate-50/30 transition-colors group">
                  <td className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                        <User size={18} />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-700">{req.employee?.name || "Unknown"}</span>
                        <span className="text-[10px] font-medium text-slate-400">{req.employee?.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="flex flex-col">
                      <span className="text-xs font-black uppercase tracking-wider text-slate-900">{req.leaveType}</span>
                      <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1 mt-1">
                        <Calendar size={12} /> 
                        {new Date(req.startDate).toLocaleDateString()} - {new Date(req.endDate).toLocaleDateString()}
                      </span>
                    </div>
                  </td>
                  <td className="p-6">
                    <span className="text-sm text-slate-500 italic max-w-xs block truncate">
                      "{req.reason}"
                    </span>
                  </td>
                  <td className="p-6 text-center">
                    <StatusBadge status={req.status} />
                  </td>
                  <td className="p-6 text-right">
                    {req.status === "pending" ? (
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleAction(req._id, "approved")}
                          className="p-2 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                        >
                          <Check size={18} />
                        </button>
                        <button 
                          onClick={() => handleAction(req._id, "rejected")}
                          className="p-2 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    ) : (
                      <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Archived</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

/* Helper Components */
const StatCard = ({ label, count, color }) => (
  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm transition-transform hover:scale-105">
    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p>
    <p className={`text-4xl font-black mt-1 ${color}`}>
      {count < 10 ? `0${count}` : count}
    </p>
  </div>
);

const StatusBadge = ({ status }) => {
  const styles = {
    pending: "bg-amber-50 text-amber-600 border-amber-100",
    approved: "bg-emerald-50 text-emerald-600 border-emerald-100",
    rejected: "bg-rose-50 text-rose-600 border-rose-100",
  };
  return (
    <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${styles[status]}`}>
      {status}
    </span>
  );
};

export default ViewLeaverequest;