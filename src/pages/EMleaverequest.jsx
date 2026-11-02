import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, AlignLeft, Send, ArrowLeft, Coffee, Thermometer, AlertCircle } from "lucide-react";
import { applyLeave } from "../api/api";
import { toast } from "react-hot-toast";

const EMLeaveRequest = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [leave, setLeave] = useState({
    startDate: "",
    endDate: "",
    reason: "",
    leaveType: "casual"
  });

  const validate = () => {
    const e = {};
    const today = new Date(); today.setHours(0,0,0,0);
    if (!leave.startDate) e.startDate = "Start date is required";
    else if (new Date(leave.startDate) < today) e.startDate = "Start date cannot be in the past";
    if (!leave.endDate) e.endDate = "End date is required";
    else if (leave.startDate && new Date(leave.endDate) < new Date(leave.startDate)) e.endDate = "End date must be on or after start date";
    if (!leave.reason.trim()) e.reason = "Please provide a reason for your leave";
    else if (leave.reason.trim().length < 10) e.reason = "Reason must be at least 10 characters";
    return e;
  };

  const handleChange = (field, value) => {
    setLeave({ ...leave, [field]: value });
    if (errors[field]) setErrors({ ...errors, [field]: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      await applyLeave(leave);
      toast.success("Leave request submitted successfully.");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err?.message || "Could not submit leave request");
    } finally {
      setLoading(false);
    }
  };

  const FieldError = ({ msg }) => msg ? (
    <p className="flex items-center gap-1.5 text-rose-500 text-xs font-semibold mt-2 ml-2">
      <AlertCircle size={12} />{msg}
    </p>
  ) : null;

  const leaveTypes = [
    { id: "casual", label: "Casual", icon: <Coffee size={16}/> },
    { id: "sick",   label: "Sick",   icon: <Thermometer size={16}/> },
    { id: "earned", label: "Earned", icon: <Calendar size={16}/> },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
      {/* Header */}
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
        <form onSubmit={handleSubmit} noValidate className="space-y-10">

          {/* Leave Type */}
          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Select Leave Category</label>
            <div className="grid grid-cols-3 gap-4">
              {leaveTypes.map((type) => (
                <button key={type.id} type="button"
                  onClick={() => setLeave({ ...leave, leaveType: type.id })}
                  className={`flex flex-col items-center justify-center p-6 rounded-3xl border-2 transition-all gap-2 ${
                    leave.leaveType === type.id
                      ? "border-indigo-600 bg-indigo-50 text-indigo-600 shadow-lg shadow-indigo-100"
                      : "border-slate-50 bg-slate-50 text-slate-400 hover:bg-slate-100"
                  }`}>
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
              <input type="date"
                className={`w-full rounded-2xl px-6 py-4 font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all border-2 ${errors.startDate ? "border-rose-300 bg-rose-50" : "border-transparent bg-slate-50"}`}
                value={leave.startDate}
                onChange={(e) => handleChange("startDate", e.target.value)}
              />
              <FieldError msg={errors.startDate} />
            </div>
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">
                <Calendar size={14} className="text-indigo-500" /> End Date
              </label>
              <input type="date"
                className={`w-full rounded-2xl px-6 py-4 font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all border-2 ${errors.endDate ? "border-rose-300 bg-rose-50" : "border-transparent bg-slate-50"}`}
                value={leave.endDate}
                onChange={(e) => handleChange("endDate", e.target.value)}
              />
              <FieldError msg={errors.endDate} />
            </div>
          </div>

          {/* Reason */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">
              <AlignLeft size={14} className="text-indigo-500" /> Justification
            </label>
            <textarea rows="4"
              placeholder="State the objective of your absence..."
              className={`w-full rounded-[2rem] px-8 py-6 font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none border-2 ${errors.reason ? "border-rose-300 bg-rose-50" : "border-transparent bg-slate-50"}`}
              value={leave.reason}
              onChange={(e) => handleChange("reason", e.target.value)}
            />
            <FieldError msg={errors.reason} />
          </div>

          {/* Submit */}
          <button type="submit" disabled={loading}
            className={`w-full py-6 rounded-2xl font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 transition-all ${
              loading ? "bg-slate-100 text-slate-400 cursor-not-allowed" : "bg-slate-900 text-white hover:bg-indigo-600 shadow-xl active:scale-[0.98]"
            }`}>
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