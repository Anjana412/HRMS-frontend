import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { 
  UserPlus, Mail, Lock, Phone, 
  Briefcase, ArrowRight, ShieldCheck, UserCheck, Activity,
  ChevronLeft 
} from "lucide-react";
import { userRegister, getUsersByType } from "../api/api";

const AddEmployee = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    department: "",
  });

  const [metrics, setMetrics] = useState({
    totalEmployees: 0,
    totalHR: 0,
    loading: true
  });

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      const empData = await getUsersByType("employee");
      const hrData = await getUsersByType("hr");
      setMetrics({
        totalEmployees: empData.users?.length || 0,
        totalHR: hrData.users?.length || 0,
        loading: false
      });
    } catch (error) {
      console.error("Failed to fetch metrics", error);
      setMetrics(prev => ({ ...prev, loading: false }));
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      toast.error("Required: Name, Email, Password");
      return;
    }

    try {
      await userRegister({
        ...formData,
        phonenumber: formData.phone,
        usertype: "employee",
      });
      toast.success("Employee record created successfully");
      setFormData({ name: "", email: "", password: "", phone: "", department: "" });
      fetchMetrics(); // Refresh numbers
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#F8FAFC] p-4 lg:p-6">
      
      {/* TOP HEADER */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200 pb-6 gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)} 
            className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-slate-900 transition-all"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <div className="p-2 bg-indigo-600 rounded-lg text-white">
                <UserPlus size={20} />
              </div>
              Personnel Onboarding
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-xl border border-slate-200 shadow-sm">
            <Activity size={16} className="text-emerald-500" />
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Server Status: Optimal</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* FORM COLUMN */}
        <div className="xl:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-8 lg:p-10 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <ModernInput label="Full Legal Name" name="name" icon={<UserCheck size={18}/>} value={formData.name} onChange={handleChange} placeholder="e.g. Robert Fox" />
                    <ModernInput label="Work Email Address" name="email" type="email" icon={<Mail size={18}/>} value={formData.email} onChange={handleChange} placeholder="robert@company.com" />
                    <ModernInput label="Security Password" name="password" type="password" icon={<Lock size={18}/>} value={formData.password} onChange={handleChange} placeholder="••••••••" />
                    <ModernInput label="Contact Number" name="phone" icon={<Phone size={18}/>} value={formData.phone} onChange={handleChange} placeholder="+1 000 000 000" />
                </div>
                <div className="border-t border-slate-100 pt-8">
                    <ModernInput label="Assigned Organizational Unit" name="department" icon={<Briefcase size={18}/>} value={formData.department} onChange={handleChange} placeholder="Operations / Engineering" />
                </div>
            </div>
            <div className="bg-slate-50 px-8 py-5 flex justify-end items-center gap-4 border-t border-slate-100">
                <button type="submit" className="bg-[#0F172A] text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-[0.2em] flex items-center gap-3 hover:bg-indigo-600 transition-all shadow-xl">
                  Create Record <ArrowRight size={16} />
                </button>
            </div>
          </form>
        </div>

        {/* METRICS COLUMN */}
        <div className="space-y-6">
            <div className="bg-[#0F172A] rounded-2xl p-7 text-white shadow-2xl relative overflow-hidden">
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

/* --- HELPER COMPONENTS (Now Defined correctly) --- */

const ModernInput = ({ label, icon, ...props }) => (
  <div className="space-y-2">
    <label className="text-[11px] font-black uppercase tracking-wider text-slate-700 ml-1">
      {label}
    </label>
    <div className="relative group">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
        {icon}
      </div>
      <input 
        {...props} 
        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-slate-50 rounded-xl focus:bg-white focus:border-indigo-600 outline-none transition-all text-sm font-bold text-slate-900 placeholder:text-slate-300"
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