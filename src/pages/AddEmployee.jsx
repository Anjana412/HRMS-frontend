import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  UserPlus, Mail, Lock, Phone,
  Briefcase, ArrowRight, ShieldCheck, UserCheck, Activity, ChevronLeft, AlertCircle
} from "lucide-react";
import { userRegister, getUsersByType } from "../api/api";

const AddEmployee = () => {
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    name: "", email: "", password: "", phone: "", department: "",
  });
  const [metrics, setMetrics] = useState({ totalEmployees: 0, totalHR: 0, loading: true });

  useEffect(() => { fetchMetrics(); }, []);

  const fetchMetrics = async () => {
    try {
      const empData = await getUsersByType("employee");
      const hrData = await getUsersByType("hr");
      setMetrics({ totalEmployees: empData.users?.length || 0, totalHR: hrData.users?.length || 0, loading: false });
    } catch {
      setMetrics(prev => ({ ...prev, loading: false }));
    }
  };

  const validate = () => {
    const e = {};
    if (!formData.name.trim()) e.name = "Full name is required";
    else if (formData.name.trim().length < 2) e.name = "Name must be at least 2 characters";
    if (!formData.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) e.email = "Enter a valid email address";
    if (!formData.password) e.password = "Password is required";
    else if (formData.password.length < 6) e.password = "Password must be at least 6 characters";
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    try {
      await userRegister({ ...formData, phonenumber: formData.phone, usertype: "employee" });
      toast.success("Employee record created successfully");
      setFormData({ name: "", email: "", password: "", phone: "", department: "" });
      setErrors({});
      fetchMetrics();
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
    }
  };

  const FieldError = ({ msg }) => msg ? (
    <p className="flex items-center gap-1.5 text-rose-500 text-[10px] font-semibold mt-1.5">
      <AlertCircle size={11} />{msg}
    </p>
  ) : null;

  return (
    <div className="w-full min-h-screen bg-[#F8FAFC] p-4 lg:p-6">

      {/* HEADER */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200 pb-6 gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-slate-900 transition-all">
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-lg text-white"><UserPlus size={20} /></div>
            Personnel Onboarding
          </h1>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-xl border border-slate-200 shadow-sm">
          <Activity size={16} className="text-emerald-500" />
          <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Server Status: Optimal</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* FORM */}
        <div className="xl:col-span-2">
          <form onSubmit={handleSubmit} noValidate className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-8 lg:p-10 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                <div>
                  <ModernInput label="Full Legal Name" name="name" icon={<UserCheck size={18}/>}
                    value={formData.name} onChange={handleChange} placeholder="e.g. Robert Fox"
                    hasError={!!errors.name} />
                  <FieldError msg={errors.name} />
                </div>

                <div>
                  <ModernInput label="Work Email Address" name="email" type="email" icon={<Mail size={18}/>}
                    value={formData.email} onChange={handleChange} placeholder="robert@company.com"
                    hasError={!!errors.email} />
                  <FieldError msg={errors.email} />
                </div>

                <div>
                  <ModernInput label="Security Password" name="password" type="password" icon={<Lock size={18}/>}
                    value={formData.password} onChange={handleChange} placeholder="••••••••"
                    hasError={!!errors.password} />
                  <FieldError msg={errors.password} />
                </div>

                <div>
                  <ModernInput label="Contact Number" name="phone" icon={<Phone size={18}/>}
                    value={formData.phone} onChange={handleChange} placeholder="+1 000 000 000" />
                </div>
              </div>

              <div className="border-t border-slate-100 pt-6">
                <ModernInput label="Assigned Organizational Unit" name="department" icon={<Briefcase size={18}/>}
                  value={formData.department} onChange={handleChange} placeholder="Operations / Engineering" />
              </div>
            </div>
            <div className="bg-slate-50 px-8 py-5 flex justify-end items-center gap-4 border-t border-slate-100">
              <button type="submit"
                className="bg-[#0F172A] text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-[0.2em] flex items-center gap-3 hover:bg-indigo-600 transition-all shadow-xl">
                Create Record <ArrowRight size={16} />
              </button>
            </div>
          </form>
        </div>

        {/* METRICS */}
        <div className="space-y-6">
          <div className="bg-[#0F172A] rounded-2xl p-7 text-white shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <ShieldCheck size={20} className="text-indigo-400" />
              <h3 className="text-sm font-black uppercase tracking-widest text-white">HR Compliance</h3>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed font-medium">
              By initializing this record, you certify that the identity and contract have been verified.
            </p>
          </div>
          <div className="bg-white rounded-2xl p-7 border border-slate-200 shadow-sm">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Workforce Metrics</h3>
            <div className="space-y-6">
              <MetricItem label="Active Workforce" value={metrics.totalEmployees} sub="Total employees" />
              <MetricItem label="HR Administration" value={metrics.totalHR} sub="Management accounts" />
              <div className="pt-4 border-t border-slate-100">
                <div className="flex justify-between text-[10px] font-black uppercase mb-2">
                  <span className="text-slate-500">System Capacity</span>
                  <span className="text-indigo-600 font-bold">{Math.min(100, (metrics.totalEmployees / 50) * 100).toFixed(0)}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-600 rounded-full transition-all duration-1000" style={{ width: `${(metrics.totalEmployees / 50) * 100}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ModernInput = ({ label, icon, hasError, ...props }) => (
  <div className="space-y-2">
    <label className="text-[11px] font-black uppercase tracking-wider text-slate-700 ml-1">{label}</label>
    <div className="relative group">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
        {icon}
      </div>
      <input {...props}
        className={`w-full pl-12 pr-4 py-3.5 border-2 rounded-xl focus:bg-white outline-none transition-all text-sm font-bold text-slate-900 placeholder:text-slate-300 ${hasError ? "border-rose-300 bg-rose-50" : "border-slate-50 bg-slate-50 focus:border-indigo-600"}`}
      />
    </div>
  </div>
);

const MetricItem = ({ label, value, sub }) => (
  <div className="flex justify-between items-start">
    <div>
      <p className="text-xs font-black text-slate-900 leading-none mb-1">{label}</p>
      <p className="text-[10px] font-bold text-slate-400 tracking-tight">{sub}</p>
    </div>
    <span className="text-2xl font-black text-indigo-600 tracking-tighter">{value}</span>
  </div>
);

export default AddEmployee;