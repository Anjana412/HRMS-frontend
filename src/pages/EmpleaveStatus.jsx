import React, { useEffect, useState } from "react";
import { getMyLeaves } from "../api/api";
import { Clock, CheckCircle2, XCircle, Calendar, Coffee, Thermometer, Briefcase, FileText } from "lucide-react";

const EmpleaveStatus = ({ hideHeader = false }) => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await getMyLeaves();
        setLeaves(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Leave History Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const getStatusStyle = (status) => {
    switch (status) {
      case "approved": return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "rejected": return "bg-rose-100 text-rose-700 border-rose-200";
      default: return "bg-amber-100 text-amber-700 border-amber-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "approved": return <CheckCircle2 size={14} />;
      case "rejected": return <XCircle size={14} />;
      default: return <Clock size={14} />;
    }
  };

  const getLeaveIcon = (type) => {
    switch (type) {
      case "sick": return <Thermometer size={16} />;
      case "earned": return <Briefcase size={16} />;
      default: return <Coffee size={16} />;
    }
  };

  if (loading) return <div className="p-10 text-center animate-pulse text-slate-400 font-black uppercase text-[10px] tracking-widest">Synchronizing Records...</div>;

  return (
    <div className={`w-full space-y-6 ${!hideHeader ? "max-w-5xl mx-auto p-6" : ""}`}>
      {!hideHeader && (
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Leave Archive</h1>
          <p className="text-slate-500 font-bold text-xs uppercase tracking-[0.2em] mt-2">Historical Absence Records</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3">
        {leaves.length > 0 ? (
          leaves.slice(0, 5).map((item) => ( // Showing only last 5 if on dashboard
            <div key={item._id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 hover:border-indigo-100 transition-all">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-slate-50 text-indigo-600 flex items-center justify-center shrink-0 border border-slate-100">
                  {getLeaveIcon(item.leaveType)}
                </div>
                <div>
                  <h3 className="font-black text-slate-900 uppercase text-[10px] tracking-tight">{item.leaveType} Leave</h3>
                  <p className="text-slate-400 text-[10px] font-medium truncate max-w-[150px]">{item.reason}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                <Calendar size={12} className="text-slate-400" />
                <span className="text-[9px] font-black uppercase tracking-tighter text-slate-600">
                  {new Date(item.startDate).toLocaleDateString()} — {new Date(item.endDate).toLocaleDateString()}
                </span>
              </div>

              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-widest ${getStatusStyle(item.status)}`}>
                {getStatusIcon(item.status)}
                {item.status}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-10 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
            <FileText size={30} className="mx-auto text-slate-200 mb-2" />
            <p className="text-slate-400 font-black uppercase tracking-widest text-[9px]">No Records Found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmpleaveStatus;