import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { userRegister } from "../api/api";
import { UserPlus, Mail, Lock, Phone, Calendar, Landmark, ArrowLeft, ShieldCheck, AlertCircle } from "lucide-react";

const AddHR = ({ onHRAdded }) => {
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    name: "", email: "", password: "",
    phonenumber: "", joiningDate: "", department: "",
  });

  useEffect(() => {
    const role = localStorage.getItem("usertype");
    if (role !== "admin") navigate("/dashboard");
  }, [navigate]);

  const validate = () => {
    const e = {};
    if (!formData.name.trim()) e.name = "Full name is required";
    else if (formData.name.trim().length < 2) e.name = "Name must be at least 2 characters";
    if (!formData.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) e.email = "Enter a valid email address";
    if (!formData.password) e.password = "Password is required";
    else if (formData.password.length < 6) e.password = "Password must be at least 6 characters";
    if (!formData.phonenumber.trim()) e.phonenumber = "Phone number is required";
    else if (!/^\+?[\d\s\-()]{7,15}$/.test(formData.phonenumber)) e.phonenumber = "Enter a valid phone number";
    if (!formData.joiningDate) e.joiningDate = "Joining date is required";
    if (!formData.department) e.department = "Department is required";
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
      const response = await userRegister({ ...formData, usertype: "hr" });
      toast.success("New HR Officer provisioned successfully");
      if (onHRAdded) onHRAdded(response.data.user);
      setFormData({ name: "", email: "", password: "", phonenumber: "", joiningDate: "", department: "" });
      setErrors({});
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Provisioning failed");
    }
  };

  const FieldError = ({ msg }) => msg ? (
    <p className="flex items-center gap-1.5 text-rose-500 text-[10px] font-semibold mt-1.5 ml-1">
      <AlertCircle size={11} />{msg}
    </p>
  ) : null;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <button onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors mb-2">
            <ArrowLeft size={14} /> Back to Directory
          </button>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Provision HR</h1>
          <p className="text-slate-500 font-bold text-xs uppercase tracking-[0.2em] mt-2 flex items-center gap-2">
            <ShieldCheck size={14} className="text-indigo-600" /> New Administrative Credential Setup
          </p>
        </div>
      </div>

      {/* FORM CONTAINER */}
      <div className="bg-white p-8 md:p-12 rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16" />

        <form onSubmit={handleSubmit} noValidate className="relative z-10 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">

            {/* Name */}
            <div>
              <Input icon={<UserPlus size={18}/>} label="Full Legal Name" name="name"
                value={formData.name} onChange={handleChange} placeholder="e.g. Alexander Pierce"
                hasError={!!errors.name} />
              <FieldError msg={errors.name} />
            </div>

            {/* Email */}
            <div>
              <Input icon={<Mail size={18}/>} label="Corporate Email" name="email" type="email"
                value={formData.email} onChange={handleChange} placeholder="name@company.com"
                hasError={!!errors.email} />
              <FieldError msg={errors.email} />
            </div>

            {/* Password */}
            <div>
              <Input icon={<Lock size={18}/>} label="Security Password" name="password" type="password"
                value={formData.password} onChange={handleChange} placeholder="••••••••"
                hasError={!!errors.password} />
              <FieldError msg={errors.password} />
            </div>

            {/* Phone */}
            <div>
              <Input icon={<Phone size={18}/>} label="Contact Number" name="phonenumber"
                value={formData.phonenumber} onChange={handleChange} placeholder="+1 (555) 000-0000"
                hasError={!!errors.phonenumber} />
              <FieldError msg={errors.phonenumber} />
            </div>

            {/* Joining Date */}
            <div>
              <Input icon={<Calendar size={18}/>} label="Joining Date" name="joiningDate" type="date"
                value={formData.joiningDate} onChange={handleChange}
                hasError={!!errors.joiningDate} />
              <FieldError msg={errors.joiningDate} />
            </div>

            {/* Department */}
            <div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-2">
                  <Landmark size={14} className="text-indigo-500" /> Department Assignment
                </label>
                <select name="department" value={formData.department} onChange={handleChange}
                  className={`w-full p-4 rounded-2xl focus:ring-4 focus:ring-indigo-100 outline-none font-bold text-sm text-slate-700 appearance-none transition-all cursor-pointer border-2 ${errors.department ? "border-rose-300 bg-rose-50" : "border-transparent bg-slate-50"}`}>
                  <option value="">Select Protocol</option>
                  <option value="HR">Human Resources</option>
                  <option value="Administration">System Administration</option>
                  <option value="Operations">Operations Command</option>
                </select>
              </div>
              <FieldError msg={errors.department} />
            </div>
          </div>

          {/* Actions */}
          <div className="pt-8 border-t border-slate-50 flex flex-col sm:flex-row justify-end gap-4">
            <button type="button" onClick={() => navigate(-1)}
              className="px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all">
              Cancel
            </button>
            <button type="submit"
              className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 shadow-xl shadow-indigo-100 transition-all">
              Initialize HR Account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Input = ({ label, icon, hasError, ...props }) => (
  <div className="space-y-2 group">
    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-2 group-focus-within:text-indigo-600 transition-colors">
      <span className="opacity-50 group-focus-within:opacity-100 transition-opacity">{icon}</span> {label}
    </label>
    <input {...props}
      className={`w-full p-4 rounded-2xl focus:ring-4 focus:ring-indigo-100 outline-none font-bold text-sm text-slate-700 placeholder:text-slate-300 transition-all border-2 ${hasError ? "border-rose-300 bg-rose-50" : "border-transparent bg-slate-50"}`}
    />
  </div>
);

export default AddHR;