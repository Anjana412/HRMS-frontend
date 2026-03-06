import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import signupImage from "../images/signup.jpg";
import { userRegister } from "../api/api";
import { toast } from "react-hot-toast";
import { Cpu, UserPlus, Mail, Lock, User, CheckCircle2 } from "lucide-react";

const Usersignup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    rememberMe: false,
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const dataWithUserType = {
      ...formData,
      usertype: "employee",
    };

    try {
      await userRegister(dataWithUserType);
      toast.success("Employee profile initialized successfully!");
      navigate("/login");
    } catch (e) {
      const msg = e.response?.data?.message || "Something went wrong during provisioning";
      setError(msg);
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 relative bg-slate-50 font-sans">
      
      {/* 1. BRANDING - InternalLink */}
      <div className="absolute top-8 left-8 z-20 flex items-center gap-2">
        <div className="h-8 w-8 bg-emerald-600 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-200">
          <Cpu size={18} className="text-white" />
        </div>
        <h1 className="text-xl font-black text-slate-900 tracking-tighter uppercase">InternalLink</h1>
      </div>

      {/* 2. LEFT VISUAL SIDE - High Contrast Overlay */}
      <div className="hidden md:block relative overflow-hidden">
        <img
          src={signupImage}
          alt="Employee Portal"
          className="w-full h-screen object-cover scale-105 hover:scale-100 transition-transform duration-[10s]"
        />
        <div className="absolute inset-0 bg-emerald-900/20 mix-blend-multiply" />
        <div className="absolute bottom-12 left-12 right-12 text-white z-10">
          <h3 className="text-2xl font-black uppercase tracking-widest mb-2 text-emerald-50">Staff Gateway</h3>
          <p className="text-emerald-50/80 font-medium max-w-sm">Join the InternalLink network to manage your workspace, documents, and professional profile.</p>
        </div>
      </div>

      {/* 3. RIGHT FORM SIDE */}
      <div className="flex items-center justify-center px-6 py-12">
        <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl shadow-slate-200 p-10 border border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          <div className="mb-10 text-center md:text-left">
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">Sign Up</h2>
            <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-2 flex items-center justify-center md:justify-start gap-2">
              <CheckCircle2 size={14} className="text-emerald-600" />
              Employee Onboarding
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div className="space-y-1 group">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 group-focus-within:text-emerald-600 transition-colors flex items-center gap-2">
                <User size={12}/> Personal Identity
              </label>
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-emerald-100 outline-none transition-all font-medium text-slate-700 placeholder:text-slate-300"
                required
              />
            </div>

            {/* Email */}
            <div className="space-y-1 group">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 group-focus-within:text-emerald-600 transition-colors flex items-center gap-2">
                <Mail size={12}/> Work Email
              </label>
              <input
                type="email"
                name="email"
                placeholder="name@internallink.com"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-emerald-100 outline-none transition-all font-medium text-slate-700 placeholder:text-slate-300"
                required
              />
            </div>

            {/* Password */}
            <div className="space-y-1 group">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 group-focus-within:text-emerald-600 transition-colors flex items-center gap-2">
                <Lock size={12}/> Secure Password
              </label>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-emerald-100 outline-none transition-all font-medium text-slate-700 placeholder:text-slate-300"
                required
              />
            </div>

            {error && (
              <div className="bg-rose-50 border border-rose-100 text-rose-600 text-[10px] font-black uppercase tracking-widest p-3 rounded-xl text-center">
                {error}
              </div>
            )}

            <div className="flex items-center gap-2 cursor-pointer group py-2">
              <input
                type="checkbox"
                name="rememberMe"
                id="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
              />
              <label htmlFor="rememberMe" className="text-xs font-bold text-slate-500 group-hover:text-slate-700 cursor-pointer transition-colors uppercase tracking-tighter">Remember this terminal</label>
            </div>

            <button
              type="submit"
              className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-100 mt-4"
            >
              Create Employee Profile
            </button>
          </form>

          {/* Footer Navigation */}
          <div className="mt-8 pt-6 border-t border-slate-50 text-center">
            <p className="text-sm text-slate-500 font-medium">
              Already a member?{" "}
              <Link 
                to="/login" 
                className="text-emerald-600 font-black uppercase tracking-widest hover:text-emerald-800 transition-colors ml-1"
              >
                Log In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Usersignup;