import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import loginImage from "../images/signup2.jpg"; 
import { userLogin } from "../api/api";
import { toast } from "react-hot-toast";
import { Cpu, ShieldCheck } from "lucide-react";

const Login = ({ setToken, setRole }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error("Security credentials missing");
      return;
    }

    try {
      const response = await userLogin(formData);

      if (response.data?.token) {
        const userRole = response.data.user.usertype.toLowerCase().trim();

        localStorage.setItem("id", response.data.user.id);
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("usertype", userRole);

        setToken(response.data.token);
        setRole(userRole);

        toast.success("Authentication successful");
        navigate("/dashboard");
      }
    } catch (e) {
      toast.error(e.response?.data?.message || "Authentication failed");
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 relative bg-slate-50 font-sans">
      
      {/* Branding */}
      <div className="absolute top-8 left-8 z-20 flex items-center gap-2">
        <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-200">
          <Cpu size={18} className="text-white" />
        </div>
        <h1 className="text-xl font-black text-slate-900 tracking-tighter uppercase">InternalLink</h1>
      </div>

      {/* Left Visual Side */}
      <div className="hidden md:block relative overflow-hidden">
        <img
          src={loginImage}
          alt="System Access"
          className="w-full h-screen object-cover scale-105"
        />
        <div className="absolute inset-0 bg-indigo-900/10 mix-blend-multiply" />
      </div>

      {/* Right Form Side */}
      <div className="flex items-center justify-center px-6 py-12">
        <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl shadow-slate-200 p-10 border border-slate-100">
          <div className="mb-10 text-center md:text-left">
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">Login</h2>
            <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-2 flex items-center justify-center md:justify-start gap-2">
              <ShieldCheck size={14} className="text-indigo-600" />
              Secure System Access
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email Terminal</label>
              <input
                type="email"
                name="email"
                placeholder="name@internallink.com"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-indigo-100 outline-none transition-all font-medium text-slate-700"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Access Key</label>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-indigo-100 outline-none transition-all font-medium text-slate-700"
                required
              />
            </div>

            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wide">
              <div className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  name="rememberMe"
                  id="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <label htmlFor="rememberMe" className="text-slate-500 group-hover:text-slate-700 cursor-pointer transition-colors">Persistent Session</label>
              </div>
              <Link to="/forgot-password" size={14} className="text-indigo-600 hover:text-indigo-800 transition-colors">
                Recover Key
              </Link>
            </div>

            <button
              type="submit"
              className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-indigo-600 transition-all shadow-xl shadow-indigo-100 mt-4"
            >
              Authorize Access
            </button>
          </form>

          {/* Minimalist Footer */}
          <div className="mt-10 pt-6 border-t border-slate-50 text-center">
            
            <p className="text-sm text-slate-500 font-medium">
    Don't have an account?{" "}
    <Link 
      to="/usersignup" 
      className="text-indigo-600 font-black uppercase tracking-widest hover:text-indigo-800 transition-colors ml-1"
    >
      Sign Up
    </Link>
  </p>

            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">
              InternalLink Protocol v2.4.0
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;