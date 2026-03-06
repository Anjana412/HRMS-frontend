import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getUserById, updateUserProfile } from "../api/api"; 
import { 
  Mail, Phone, MapPin, Edit3, ArrowLeft, 
  Check, X, Loader2, Shield, AlertCircle 
} from "lucide-react";
import { toast } from "react-hot-toast";

const Viewprofile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [employee, setEmployee] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [id]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await getUserById(id || localStorage.getItem("id"));
      const data = response.user || response;
      setEmployee(data);
      setFormData(data);
    } catch (err) {
      toast.error("Profile sync failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await updateUserProfile(employee._id, formData);
      setEmployee(formData);
      setIsEditing(false);
      toast.success("Profile synchronized");
    } catch (err) {
      toast.error("Update failed");
    }
  };

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#F8F9FA]">
      <Loader2 className="animate-spin text-indigo-600 mb-4" size={32} />
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Syncing Profile...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8F9FA] m-0 p-0 font-sans text-slate-900">
      
      {/* --- 1. STICKY HEADER --- */}
      <div className="bg-white sticky top-0 z-40 border-b border-slate-200 px-6 md:px-12 py-4 flex justify-between items-center shadow-sm">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-all font-black text-[10px] uppercase tracking-widest"
        >
          <ArrowLeft size={16} /> Back
        </button>
        
        <div className="flex gap-3">
          {isEditing ? (
            <>
              <button onClick={() => setIsEditing(false)} className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-slate-500 bg-slate-100 rounded-xl hover:bg-slate-200 transition-all">
                <X size={16} /> Cancel
              </button>
              <button onClick={handleSave} className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
                <Check size={16} /> Save Changes
              </button>
            </>
          ) : (
            <button 
              onClick={() => setIsEditing(true)} 
              className="bg-slate-900 text-white px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-600 transition-all flex items-center gap-2 shadow-lg shadow-slate-200"
            >
              <Edit3 size={16} /> Edit Profile
            </button>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* --- 2. SIDEBAR IDENTITY --- */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm">
              <div className="h-32 w-32 rounded-[2.5rem] bg-indigo-600 flex items-center justify-center text-white text-4xl font-black mb-6 shadow-xl shadow-indigo-100 mx-auto lg:mx-0">
                {employee.name?.charAt(0).toUpperCase()}
              </div>
              <h1 className="text-3xl font-black tracking-tight text-slate-900 text-center lg:text-left">{employee.name}</h1>
              <p className="text-sm font-bold text-indigo-600 uppercase tracking-widest mt-1 text-center lg:text-left">{employee.usertype}</p>
              
              <div className="mt-8 pt-8 border-t border-slate-100 space-y-5">
                <ContactItem icon={<Mail size={16} />} text={employee.email} />
                <ContactItem icon={<Phone size={16} />} text={employee.phonenumber || "No phone added"} />
                <ContactItem icon={<Shield size={16} />} text={`${employee.usertype} Account`} />
              </div>
            </div>
          </div>

          {/* --- 3. MAIN CONTENT --- */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Employment Details Card */}
            <div className="bg-white border border-slate-200 rounded-[2.5rem] p-10 shadow-sm">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-10">Employee Metadata</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-12">
                
                <EditablePoint 
                  label="Full Name" 
                  value={formData.name} 
                  isEditing={isEditing} 
                  onChange={(val) => setFormData({...formData, name: val})} 
                />

                <EditablePoint 
                  label="Email Address" 
                  value={formData.email} 
                  isEditing={isEditing} 
                  onChange={(val) => setFormData({...formData, email: val})} 
                />

                <EditablePoint 
                  label="Phone Number" 
                  value={formData.phonenumber} 
                  isEditing={isEditing} 
                  onChange={(val) => setFormData({...formData, phonenumber: val})} 
                />

                <div className="group">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-300 mb-1">Employee ID</p>
                  <p className="text-sm font-bold text-slate-400 select-none">
                    {employee.employeeId || employee._id?.slice(-8).toUpperCase()}
                  </p>
                </div>

                <EditablePoint 
                  label="Department" 
                  value={formData.department} 
                  isEditing={isEditing} 
                  onChange={(val) => setFormData({...formData, department: val})} 
                />

                <div className="group">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-300 mb-1">Access Tier</p>
                  <p className="text-sm font-bold text-slate-800 uppercase">{employee.usertype}</p>
                </div>

              </div>
            </div>

            {/* Empty State Box for Files */}
            <div className="bg-white border border-slate-200 rounded-[2.5rem] p-12 shadow-sm text-center">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-200 mb-4 border border-slate-100">
                <AlertCircle size={24} />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">No external documents linked</p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

// --- Sub-Components ---

const ContactItem = ({ icon, text }) => (
  <div className="flex items-center gap-4 text-slate-500">
    <div className="p-2 bg-slate-50 rounded-xl text-indigo-600 border border-slate-100">
      {icon}
    </div>
    <span className="text-sm font-bold truncate">{text}</span>
  </div>
);

const EditablePoint = ({ label, value, isEditing, onChange }) => (
  <div className="flex flex-col">
    <p className="text-[10px] font-black uppercase tracking-widest text-slate-300 mb-1">{label}</p>
    {isEditing ? (
      <input 
        type="text" 
        value={value || ""} 
        onChange={(e) => onChange(e.target.value)}
        className="text-sm font-bold text-slate-800 border-b-2 border-indigo-500 bg-indigo-50/30 p-2 rounded-t-lg outline-none transition-all focus:bg-indigo-50"
      />
    ) : (
      <p className="text-sm font-bold text-slate-800">{value || "Not Set"}</p>
    )}
  </div>
);

export default Viewprofile;