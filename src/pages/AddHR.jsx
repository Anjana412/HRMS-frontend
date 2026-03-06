import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { userRegister } from "../api/api";
import { UserPlus, Mail, Lock, Phone, Calendar, Landmark, ArrowLeft, ShieldCheck } from "lucide-react";

const AddHR = ({ onHRAdded }) => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phonenumber: "",
    joiningDate: "",
    department: "",
  });

  useEffect(() => {
    const role = localStorage.getItem("usertype");
    if (role !== "admin") {
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.phonenumber ||
      !formData.joiningDate ||
      !formData.department
    ) {
      toast.error("All security fields are required");
      return;
    }

    try {
      const response = await userRegister({
        ...formData,
        usertype: "hr",
      });

      toast.success("New HR Officer provisioned successfully");

      if (onHRAdded) onHRAdded(response.data.user);

      setFormData({
        name: "",
        email: "",
        password: "",
        phonenumber: "",
        joiningDate: "",
        department: "",
      });
      
      // Optionally navigate back to details after success
      // navigate("/dashboard/hr");
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Provisioning failed");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* 1. HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors mb-2"
          >
            <ArrowLeft size={14} /> Back to Directory
          </button>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Provision HR</h1>
          <p className="text-slate-500 font-bold text-xs uppercase tracking-[0.2em] mt-2 flex items-center gap-2">
            <ShieldCheck size={14} className="text-indigo-600" />
            New Administrative Credential Setup
          </p>
        </div>
      </div>

      {/* 2. FORM CONTAINER */}
      <div className="bg-white p-8 md:p-12 rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/50 relative overflow-hidden">
        {/* Decorative corner element */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16 group-hover:bg-indigo-50 transition-colors" />
        
        <form onSubmit={handleSubmit} className="relative z-10 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
            
            <Input 
              icon={<UserPlus size={18}/>} 
              label="Full Legal Name" 
              name="name" 
              value={formData.name} 
              onChange={handleChange} 
              placeholder="e.g. Alexander Pierce" 
            />
            
            <Input 
              icon={<Mail size={18}/>} 
              label="Corporate Email" 
              name="email" 
              type="email" 
              value={formData.email} 
              onChange={handleChange} 
              placeholder="name@company.com" 
            />
            
            <Input 
              icon={<Lock size={18}/>} 
              label="Security Password" 
              name="password" 
              type="password" 
              value={formData.password} 
              onChange={handleChange} 
              placeholder="••••••••" 
            />
            
            <Input 
              icon={<Phone size={18}/>} 
              label="Contact Number" 
              name="phonenumber" 
              value={formData.phonenumber} 
              onChange={handleChange} 
              placeholder="+1 (555) 000-0000" 
            />
            
            <Input 
              icon={<Calendar size={18}/>} 
              label="Joining Date" 
              name="joiningDate" 
              type="date" 
              value={formData.joiningDate} 
              onChange={handleChange} 
            />

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-2">
                <Landmark size={14} className="text-indigo-500" /> Department Assignment
              </label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-indigo-100 outline-none font-bold text-sm text-slate-700 appearance-none transition-all cursor-pointer"
              >
                <option value="">Select Protocol</option>
                <option value="HR">Human Resources</option>
                <option value="Administration">System Administration</option>
                <option value="Operations">Operations Command</option>
              </select>
            </div>
          </div>

          {/* 3. FORM ACTIONS */}
          <div className="pt-8 border-t border-slate-50 flex flex-col sm:flex-row justify-end gap-4">
            <button 
              type="button"
              onClick={() => navigate(-1)}
              className="px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 shadow-xl shadow-indigo-100 transition-all"
            >
              Initialize HR Account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* --- REUSABLE INPUT COMPONENT --- */
const Input = ({ label, icon, ...props }) => (
  <div className="space-y-2 group">
    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-2 group-focus-within:text-indigo-600 transition-colors">
      <span className="opacity-50 group-focus-within:opacity-100 transition-opacity">{icon}</span> {label}
    </label>
    <input 
      {...props} 
      className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-indigo-100 outline-none font-bold text-sm text-slate-700 placeholder:text-slate-300 transition-all"
    />
  </div>
);

export default AddHR;