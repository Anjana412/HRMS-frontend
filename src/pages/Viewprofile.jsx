import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getUserById, updateUserProfile } from "../api/api";
import {
  Mail, Phone, MapPin, Edit3, ArrowLeft,
  Check, X, Loader2, Shield, Calendar,
  Briefcase, Building2, FileText, User,
  MessageSquare, Clock, Hash
} from "lucide-react";
import { toast } from "react-hot-toast";

const ROLE_COLORS = {
  admin:              "bg-slate-900 text-white",
  manager:            "bg-violet-600 text-white",
  hr:                 "bg-indigo-600 text-white",
  projectmanager:     "bg-teal-600 text-white",
  projectcoordinator: "bg-sky-600 text-white",
  teamlead:           "bg-emerald-600 text-white",
  employee:           "bg-slate-600 text-white",
};

const STATUS_COLORS = {
  Active:      "bg-emerald-50 text-emerald-700 border-emerald-200",
  "On Leave":  "bg-amber-50 text-amber-700 border-amber-200",
  Probation:   "bg-blue-50 text-blue-700 border-blue-200",
  Resigned:    "bg-rose-50 text-rose-700 border-rose-200",
  Terminated:  "bg-red-50 text-red-700 border-red-200",
};

const ROLE_LABELS = {
  admin: "Admin", manager: "Manager", hr: "HR", projectmanager: "Project Manager",
  projectcoordinator: "Project Coordinator", teamlead: "Team Lead", employee: "Employee",
};

// Must match CREATION_RULES in the backend usercontroller.js
const CAN_EDIT = {
  admin:   ["manager", "hr", "projectmanager", "projectcoordinator", "teamlead", "employee"],
  manager: ["hr", "projectmanager"],
  hr:      ["projectmanager", "projectcoordinator", "teamlead", "employee"],
};

const Viewprofile = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const viewerRole = localStorage.getItem("usertype");
  const viewerId   = localStorage.getItem("id");
  const [employee, setEmployee]   = useState(null);
  const [formData, setFormData]   = useState({});
  const [loading, setLoading]     = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving]       = useState(false);

  useEffect(() => { fetchProfile(); }, [id]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await getUserById(id || localStorage.getItem("id"));
      const data = response.user || response;
      setEmployee(data);
      setFormData(data);
    } catch {
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };


  const handleSave = async () => {
    setSaving(true);
    try {
      await updateUserProfile(employee._id, formData);
      setEmployee(formData);
      setIsEditing(false);
      toast.success("Profile updated successfully");
    } catch {
      toast.error("Update failed");
    } finally {
      setSaving(false);
    }
  };

  const set = (key, val) => setFormData(p => ({ ...p, [key]: val }));

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-slate-50">
      <Loader2 className="animate-spin text-indigo-600 mb-4" size={32} />
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading Profile...</p>
    </div>
  );

  if (!employee) return (
    <div className="h-screen flex items-center justify-center">
      <p className="text-slate-400 font-bold">Employee not found</p>
    </div>
  );

  const roleColor  = ROLE_COLORS[employee.usertype] || "bg-slate-600 text-white";
  const roleLabel  = ROLE_LABELS[employee.usertype] || employee.usertype;
  const isSelf      = employee._id === viewerId;
  const isStaffEdit = (CAN_EDIT[viewerRole] || []).includes(employee.usertype);
  const canEdit     = isSelf || isStaffEdit;
  const statusColor = STATUS_COLORS[employee.employmentstatus] || STATUS_COLORS["Active"];

  return (
    <div className="min-h-screen bg-slate-50/30 font-sans">

      {/* Header */}
      <div className="bg-white sticky top-0 z-40 border-b border-slate-200 px-6 md:px-10 py-4 flex justify-between items-center shadow-sm">
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-all font-black text-[10px] uppercase tracking-widest">
          <ArrowLeft size={16} /> Back
        </button>
        <div className="flex gap-3">
          {canEdit && (isEditing ? (
            <>
              <button onClick={() => { setIsEditing(false); setFormData(employee); }}
                className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-slate-500 bg-slate-100 rounded-xl hover:bg-slate-200 transition-all">
                <X size={15} /> Cancel
              </button>
              <button onClick={handleSave} disabled={saving}
                className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-60">
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={15} />}
                Save Changes
              </button>
            </>
          ) : (
            <button onClick={() => setIsEditing(true)}
              className="bg-slate-900 text-white px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-600 transition-all flex items-center gap-2">
              <Edit3 size={15} /> Edit Profile
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-10 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* LEFT — Identity card */}
          <div className="lg:col-span-4 space-y-5">
            <div className="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-sm">

              {/* Photo */}
              <div className="flex flex-col items-center lg:items-start mb-6">
                {employee.photo ? (
                  <img src={employee.photo} alt={employee.name}
                    className="h-32 w-32 rounded-[1.5rem] object-cover shadow-xl border-4 border-white ring-2 ring-slate-100" />
                ) : (
                  <div className={`h-32 w-32 rounded-[1.5rem] flex items-center justify-center text-4xl font-black shadow-xl ${roleColor}`}>
                    {employee.name?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Name + role */}
              <h1 className="text-2xl font-black tracking-tight text-slate-900 text-center lg:text-left">{employee.name}</h1>
              <div className="flex flex-wrap items-center gap-2 mt-2 justify-center lg:justify-start">
                <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${roleColor}`}>
                  {roleLabel}
                </span>
                {employee.employmentstatus && (
                  <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${statusColor}`}>
                    {employee.employmentstatus}
                  </span>
                )}
              </div>

              {/* Employee ID */}
              {(employee.employeeId) && (
                <div className="mt-4 bg-slate-50 rounded-xl px-4 py-2.5 flex items-center gap-2 border border-slate-100">
                  <Hash size={13} className="text-slate-400" />
                  <span className="text-xs font-black text-slate-600 uppercase tracking-widest">{employee.employeeId}</span>
                </div>
              )}

              {/* Contact info */}
              <div className="mt-6 pt-6 border-t border-slate-100 space-y-3">
                <ContactItem icon={<Mail size={14}/>}    text={employee.email} />
                <ContactItem icon={<Phone size={14}/>}   text={employee.phonenumber || "—"} />
                {employee.whatsappnumber && (
                  <ContactItem icon={<MessageSquare size={14}/>} text={employee.whatsappnumber} label="WhatsApp" />
                )}
                {(employee.district || employee.state) && (
                  <ContactItem icon={<MapPin size={14}/>} text={[employee.district, employee.state].filter(Boolean).join(", ")} />
                )}
              </div>

              {/* Resume link */}
              {employee.resume && (
                <a href={employee.resume} target="_blank" rel="noreferrer"
                  className="mt-5 flex items-center gap-2 px-4 py-3 bg-indigo-50 border border-indigo-100 rounded-xl text-xs font-black text-indigo-600 hover:bg-indigo-100 transition-all">
                  <FileText size={14} /> View Resume
                </a>
              )}
            </div>
          </div>

          {/* RIGHT — Details */}
          <div className="lg:col-span-8 space-y-5">

            {/* Personal Info */}
            <Section title="Personal Information">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <EP label="Full Name"       value={formData.name}          isEditing={isEditing} onChange={v => set("name", v)} />
                <EP label="Date of Birth"   value={formData.dob}           isEditing={isEditing} onChange={v => set("dob", v)} type="date" />
                <EP label="Phone Number"    value={formData.phonenumber}   isEditing={isEditing} onChange={v => set("phonenumber", v)} />
                <EP label="WhatsApp"        value={formData.whatsappnumber}isEditing={isEditing} onChange={v => set("whatsappnumber", v)} />
              </div>
            </Section>

            {/* Address */}
            <Section title="Address">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <EP label="Full Address" value={formData.address} isEditing={isEditing} onChange={v => set("address", v)} />
                </div>
                <EP label="District" value={formData.district} isEditing={isEditing} onChange={v => set("district", v)} />
                <EP label="State"    value={formData.state}    isEditing={isEditing} onChange={v => set("state", v)} />
              </div>
            </Section>

            {/* Professional */}
            <Section title="Professional Details">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <EP label="Department"      value={formData.department}      isEditing={isEditing && isStaffEdit} onChange={v => set("department", v)} />
                <EP label="Employee Type"   value={formData.employeetype}    isEditing={isEditing && isStaffEdit} onChange={v => set("employeetype", v)} />
                <EP label="Branch"          value={formData.branch}          isEditing={isEditing && isStaffEdit} onChange={v => set("branch", v)} />
                <EP label="Experience"      value={formData.experience}      isEditing={isEditing && isStaffEdit} onChange={v => set("experience", v)} />
                <EP label="Joining Date"    value={formData.joiningdate}     isEditing={isEditing && isStaffEdit} onChange={v => set("joiningdate", v)} type="date" />
                <EP label="Work Mode"       value={formData.mode}            isEditing={isEditing && isStaffEdit} onChange={v => set("mode", v)} />
                <EP label="Status"          value={formData.employmentstatus}isEditing={isEditing && isStaffEdit} onChange={v => set("employmentstatus", v)} />
                {formData.resignationdate && (
                  <EP label="Resignation Date" value={formData.resignationdate} isEditing={isEditing && isStaffEdit} onChange={v => set("resignationdate", v)} type="date" />
                )}
              </div>
            </Section>

            {/* Remarks */}
            {(employee.remarks || (isEditing && isStaffEdit)) && (
              <Section title="Remarks">
                {isEditing && isStaffEdit ? (
                  <textarea value={formData.remarks || ""} onChange={e => set("remarks", e.target.value)}
                    rows={3} placeholder="Additional notes..."
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 focus:border-indigo-400 rounded-xl text-sm font-medium text-slate-700 outline-none transition-all resize-none" />
                ) : (
                  <p className="text-sm font-medium text-slate-600">{employee.remarks}</p>
                )}
              </Section>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

const Section = ({ title, children }) => (
  <div className="bg-white border border-slate-100 rounded-[1.5rem] p-6 shadow-sm">
    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-5">{title}</h3>
    {children}
  </div>
);

const EP = ({ label, value, isEditing, onChange, type = "text" }) => (
  <div>
    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</p>
    {isEditing ? (
      <input type={type} value={value || ""} onChange={e => onChange(e.target.value)}
        className="w-full text-sm font-bold text-slate-800 border-b-2 border-indigo-400 bg-indigo-50/30 px-2 py-1.5 rounded-t-lg outline-none" />
    ) : (
      <p className="text-sm font-bold text-slate-800">{value || <span className="text-slate-300">Not set</span>}</p>
    )}
  </div>
);

const ContactItem = ({ icon, text, label }) => (
  <div className="flex items-center gap-3 text-slate-500">
    <div className="p-2 bg-slate-50 rounded-xl text-indigo-500 border border-slate-100 flex-shrink-0">{icon}</div>
    <div>
      {label && <p className="text-[9px] font-black uppercase tracking-widest text-slate-300">{label}</p>}
      <span className="text-xs font-bold truncate">{text}</span>
    </div>
  </div>
);

export default Viewprofile;