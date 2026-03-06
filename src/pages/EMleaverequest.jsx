import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, AlignLeft, Send, ArrowLeft, Coffee, Thermometer, Briefcase } from "lucide-react";
import { applyLeave } from "../api/api"; 

const EMLeaveRequest = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [leave, setLeave] = useState({
    startDate: "",
    endDate: "",
    reason: "",
    leaveType: "casual" // Default based on your enum
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await applyLeave(leave);
      alert("Mission Deployment Paused: Leave Request Submitted.");
      navigate("/dashboard"); 
    } catch (err) {
      alert("Request Interrupted: " + (err.message || "Server Error"));
    } finally {
      setLoading(false);
    }
  };

  const leaveTypes = [
    { id: "casual", label: "Casual", icon: <Coffee size={16}/> },
    { id: "sick", label: "Sick", icon: <Thermometer size={16}/> },
    { id: "earned", label: "Earned", icon: <Calendar size={16}/> },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
      {/* Navigation Header */}
      <div className="flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-slate-900 font-black uppercase text-[10px] tracking-widest transition-all">
          <ArrowLeft size={16} /> Return to Dashboard
        </button>
        <div className="text-right">
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Leave Protocol</h1>
          <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.2em]">Absence Authorization Request</p>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-2xl border border-slate-100 relative">
        <form onSubmit={handleSubmit} className="space-y-10">
          
          {/* Leave Type Selector */}
          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Select Leave Category</label>
            <div className="grid grid-cols-3 gap-4">
              {leaveTypes.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setLeave({ ...leave, leaveType: type.id })}
                  className={`flex flex-col items-center justify-center p-6 rounded-3xl border-2 transition-all gap-2 ${
                    leave.leaveType === type.id 
                    ? "border-indigo-600 bg-indigo-50 text-indigo-600 shadow-lg shadow-indigo-100" 
                    : "border-slate-50 bg-slate-50 text-slate-400 hover:bg-slate-100"
                  }`}
                >
                  {type.icon}
                  <span className="text-[10px] font-black uppercase tracking-widest">{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Date Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">
                <Calendar size={14} className="text-indigo-500" /> Start Date
              </label>
              <input
                type="date"
                required
                className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                value={leave.startDate}
                onChange={(e) => setLeave({ ...leave, startDate: e.target.value })}
              />
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">
                <Calendar size={14} className="text-indigo-500" /> End Date
              </label>
              <input
                type="date"
                required
                className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                value={leave.endDate}
                onChange={(e) => setLeave({ ...leave, endDate: e.target.value })}
              />
            </div>
          </div>

          {/* Reason Field */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">
              <AlignLeft size={14} className="text-indigo-500" /> Justification
            </label>
            <textarea
              required
              rows="4"
              placeholder="State the objective of your absence..."
              className="w-full bg-slate-50 border-none rounded-[2rem] px-8 py-6 font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
              value={leave.reason}
              onChange={(e) => setLeave({ ...leave, reason: e.target.value })}
            />
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-6 rounded-2xl font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 transition-all ${
              loading 
                ? "bg-slate-100 text-slate-400 cursor-not-allowed" 
                : "bg-slate-900 text-white hover:bg-indigo-600 shadow-xl active:scale-[0.98]"
            }`}
          >
            {loading ? <span className="animate-pulse">Transmitting...</span> : <><Send size={18} /> File Request</>}
          </button>
        </form>
      </div>
      
      <p className="text-center text-[9px] font-black text-slate-300 uppercase tracking-widest px-12 leading-relaxed">
        Transmission secure. Your request will be queued for administrative review. Check "My Leaves" for status updates.
      </p>
    </div>
  );
};

export default EMLeaveRequest;