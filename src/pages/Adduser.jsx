import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  User, Mail, Lock, Phone, MapPin, Calendar, Briefcase,
  Building2, ChevronLeft, ChevronRight, Camera, FileText,
  AlertCircle, Check, Eye, EyeOff, Upload, Users
} from "lucide-react";
import { userRegister, getUsersByType } from "../api/api";

const ALL_ROLES = [
  { value: "manager",           label: "Manager",            color: "bg-violet-100 text-violet-800 border-violet-300" },
  { value: "hr",                 label: "HR",                  color: "bg-indigo-100 text-indigo-800 border-indigo-300" },
  { value: "projectmanager",     label: "Project Manager",     color: "bg-teal-100 text-teal-800 border-teal-300" },
  { value: "projectcoordinator", label: "Project Coordinator", color: "bg-sky-100 text-sky-800 border-sky-300" },
  { value: "teamlead",           label: "Team Lead",           color: "bg-emerald-100 text-emerald-800 border-emerald-300" },
  { value: "employee",           label: "Employee",            color: "bg-slate-100 text-slate-700 border-slate-300" },
];

// Who can create whom
const ALLOWED_CREATIONS = {
  admin:    ["manager", "hr", "projectmanager", "projectcoordinator", "teamlead", "employee"],
  manager:  ["hr", "projectmanager"],
  hr:       ["projectmanager", "projectcoordinator", "teamlead", "employee"],
};

// Who the new role reports to (which role to show in the dropdown)
const REPORTS_TO_ROLE = {
  manager:           "admin",   // reports to director (or nobody)
  hr:                 "manager",
  projectmanager:     "hr",
  projectcoordinator: "projectmanager",
  teamlead:           "projectcoordinator",
  employee:           "teamlead",
};

const DEPARTMENTS  = ["Human Resources","Management","Engineering","Operations","Finance","Sales","Marketing","Administration","IT","Legal","Design"];
const EMP_TYPES    = ["Full Time","Part Time","Contract","Intern","Freelancer"];
const EMP_MODES    = ["On-site","Remote","Hybrid"];
const EMP_STATUSES = ["Active","On Leave","Probation","Resigned","Terminated"];
const INDIAN_STATES = ["Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal","Delhi","Jammu & Kashmir","Ladakh","Puducherry"];

const STEPS = [
  { label: "Role" },
  { label: "Reports To" },
  { label: "Personal" },
  { label: "Address" },
  { label: "Professional" },
  { label: "Login" },
  { label: "Photo" },
];

const EMPTY = {
  usertype: "employee", reportsTo: "",
  name: "", dob: "", phonenumber: "", whatsappnumber: "",
  address: "", district: "", state: "",
  department: "", employeetype: "", branch: "", experience: "",
  joiningdate: "", mode: "", employmentstatus: "Active",
  resignationdate: "", resume: null, remarks: "",
  email: "", password: "", confirmpassword: "",
  photo: null,
};

const Adduser = () => {
  const navigate = useNavigate();
  const loggedInRole = localStorage.getItem("usertype") || "admin";
  const loggedInId   = localStorage.getItem("id");

  const [step, setStep]         = useState(0);
  const [form, setForm]         = useState(EMPTY);
  const [errors, setErrors]     = useState({});
  const [loading, setLoading]   = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConf, setShowConf] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [resumeName, setResumeName]     = useState("");
  const [managers, setManagers]         = useState([]);
  const [loadingManagers, setLoadingManagers] = useState(false);

  // Redirect if not allowed
  useEffect(() => {
    if (!["admin", "manager", "hr"].includes(loggedInRole)) navigate("/dashboard");
  }, []);

  // When role is selected, load the managers for the "Reports To" dropdown
  useEffect(() => {
    if (!form.usertype) return;
    const managerRole = REPORTS_TO_ROLE[form.usertype];
    if (!managerRole) return;
    setLoadingManagers(true);
    setForm(p => ({ ...p, reportsTo: "" }));
    getUsersByType(managerRole)
      .then(data => setManagers(Array.isArray(data) ? data : data?.users || []))
      .catch(() => setManagers([]))
      .finally(() => setLoadingManagers(false));
  }, [form.usertype]);

  const ROLES = ALL_ROLES.filter(r => (ALLOWED_CREATIONS[loggedInRole] || []).includes(r.value));
  const selectedRole = ROLES.find(r => r.value === form.usertype);
  const managerRoleLabel = REPORTS_TO_ROLE[form.usertype]
    ? ALL_ROLES.find(r => r.value === REPORTS_TO_ROLE[form.usertype])?.label
    : "";

  const set = (name, value) => {
    setForm(p => ({ ...p, [name]: value }));
    if (errors[name]) setErrors(p => ({ ...p, [name]: "" }));
  };

  const handleChange = e => set(e.target.name, e.target.value);

  const handlePhoto = e => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Please select an image file"); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("Image must be under 5MB"); return; }
    set("photo", file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleResume = e => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type !== "application/pdf") { toast.error("Resume must be a PDF file"); return; }
    set("resume", file);
    setResumeName(file.name);
  };

  const validateStep = () => {
    const e = {};
    if (step === 0) {
      if (!form.usertype) e.usertype = "Please select a role";
    }
    if (step === 1) {
      if (!form.reportsTo) e.reportsTo = `Please select which ${managerRoleLabel} this person reports to`;
    }
    if (step === 2) {
      if (!form.name.trim())        e.name        = "Full name is required";
      if (!form.dob)                e.dob         = "Date of birth is required";
      if (!form.phonenumber.trim()) e.phonenumber = "Phone number is required";
    }
    if (step === 3) {
      if (!form.state)           e.state    = "State is required";
      if (!form.district.trim()) e.district = "District is required";
    }
    if (step === 4) {
      if (!form.department)       e.department      = "Department is required";
      if (!form.employeetype)     e.employeetype    = "Employee type is required";
      if (!form.joiningdate)      e.joiningdate     = "Joining date is required";
      if (!form.employmentstatus) e.employmentstatus = "Status is required";
    }
    if (step === 5) {
      if (!form.email.trim())     e.email = "Email is required";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email";
      if (!form.password)         e.password = "Password is required";
      else if (form.password.length < 6) e.password = "Minimum 6 characters";
      if (!form.confirmpassword)  e.confirmpassword = "Please confirm password";
      else if (form.password !== form.confirmpassword) e.confirmpassword = "Passwords do not match";
    }
    if (step === 6) {
      if (!form.photo) e.photo = "Profile photo is required for ID card";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => { if (validateStep()) setStep(s => s + 1); };
  const prev = () => setStep(s => s - 1);

  const handleSubmit = async () => {
    if (!validateStep()) return;
    setLoading(true);
    try {
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (v !== null && v !== undefined && v !== "") data.append(k, v);
      });
      await userRegister(data);
      const roleLabel = ROLES.find(r => r.value === form.usertype)?.label || form.usertype;
      toast.success(`${roleLabel} account created!`);
      setForm(EMPTY);
      setPhotoPreview(null);
      setResumeName("");
      setStep(0);
      setErrors({});
    } catch (err) {
      toast.error(err?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-slate-50/30 p-4 lg:p-8">

      {/* Header */}
      <div className="mb-6 flex items-center gap-4 border-b border-slate-200 pb-6">
        <button onClick={() => navigate(-1)} className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-slate-900 transition-all shadow-sm">
          <ChevronLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Add User</h1>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">
            Step {step + 1} of {STEPS.length} — {STEPS[step].label}
          </p>
        </div>
        {selectedRole && (
          <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border ${selectedRole.color}`}>
            {selectedRole.label}
          </span>
        )}
      </div>

      {/* Step bar */}
      <div className="flex items-center gap-1 mb-8 overflow-x-auto pb-1">
        {STEPS.map((s, i) => (
          <React.Fragment key={s.label}>
            <div className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${
              i === step ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" :
              i < step   ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                           "bg-white text-slate-400 border border-slate-200"
            }`}>
              {i < step && <Check size={11} />}
              {s.label}
            </div>
            {i < STEPS.length - 1 && <div className={`w-4 h-0.5 flex-shrink-0 rounded ${i < step ? "bg-emerald-300" : "bg-slate-200"}`} />}
          </React.Fragment>
        ))}
      </div>

      {/* Card */}
      <div className="bg-white rounded-[1.5rem] border border-slate-100 shadow-sm max-w-3xl mx-auto overflow-hidden">
        <div className="p-8 space-y-5">

          {/* STEP 0 — Role */}
          {step === 0 && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Select role for this user</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {ROLES.map(r => (
                  <button key={r.value} type="button" onClick={() => set("usertype", r.value)}
                    className={`px-4 py-4 rounded-xl border-2 text-sm font-black uppercase tracking-wider transition-all ${
                      form.usertype === r.value ? `${r.color} border-current scale-[1.02] shadow-sm` : "bg-slate-50 text-slate-400 border-slate-100 hover:border-slate-300"
                    }`}>
                    {r.label}
                  </button>
                ))}
              </div>
              <FieldError msg={errors.usertype} />
            </div>
          )}

          {/* STEP 1 — Reports To */}
          {step === 1 && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                Which {managerRoleLabel} does this {selectedRole?.label} report to?
              </p>
              <p className="text-xs text-slate-400 font-medium mb-5">
                This links the new user to their direct manager in the org chart.
              </p>

              {loadingManagers ? (
                <div className="flex items-center gap-3 py-8 justify-center text-slate-400">
                  <div className="w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm font-bold">Loading {managerRoleLabel}s...</span>
                </div>
              ) : managers.length === 0 ? (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-center">
                  <p className="text-sm font-black text-amber-700">No {managerRoleLabel}s found</p>
                  <p className="text-xs text-amber-600 mt-1">Create a {managerRoleLabel} first before adding someone under them.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {managers.map(m => (
                    <button key={m._id} type="button" onClick={() => set("reportsTo", m._id)}
                      className={`flex items-center gap-3 px-4 py-4 rounded-xl border-2 text-left transition-all ${
                        form.reportsTo === m._id
                          ? "border-indigo-500 bg-indigo-50 shadow-sm"
                          : "border-slate-100 bg-slate-50 hover:border-indigo-300"
                      }`}>
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0 ${
                        form.reportsTo === m._id ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-600"
                      }`}>
                        {m.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900">{m.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          {m.employeeId || m.department || managerRoleLabel}
                        </p>
                      </div>
                      {form.reportsTo === m._id && (
                        <Check size={16} className="ml-auto text-indigo-600" />
                      )}
                    </button>
                  ))}
                </div>
              )}
              <FieldError msg={errors.reportsTo} />
            </div>
          )}

          {/* STEP 2 — Personal */}
          {step === 2 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field label="Full Name *"      icon={<User size={14}/>}     name="name"          value={form.name}          onChange={handleChange} placeholder="e.g. Rahul Sharma"      hasError={!!errors.name}        error={errors.name} />
              <Field label="Date of Birth *"  icon={<Calendar size={14}/>} name="dob"           value={form.dob}           onChange={handleChange} type="date"                           hasError={!!errors.dob}         error={errors.dob} />
              <Field label="Phone Number *"   icon={<Phone size={14}/>}    name="phonenumber"   value={form.phonenumber}   onChange={handleChange} placeholder="+91 98765 43210"         hasError={!!errors.phonenumber} error={errors.phonenumber} />
              <Field label="WhatsApp Number"  icon={<Phone size={14}/>}    name="whatsappnumber"value={form.whatsappnumber}onChange={handleChange} placeholder="If different from phone" />
            </div>
          )}

          {/* STEP 3 — Address */}
          {step === 3 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <Field label="Full Address" icon={<MapPin size={14}/>} name="address" value={form.address} onChange={handleChange} placeholder="House no, Street, Area, City..." />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block ml-1">State *</label>
                <select name="state" value={form.state} onChange={handleChange}
                  className={`w-full px-4 py-3.5 border-2 rounded-xl text-sm font-bold text-slate-700 outline-none transition-all appearance-none ${errors.state ? "border-rose-300 bg-rose-50" : "border-slate-50 bg-slate-50 focus:border-indigo-400"}`}>
                  <option value="">Select state...</option>
                  {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <FieldError msg={errors.state} />
              </div>
              <Field label="District *" icon={<MapPin size={14}/>} name="district" value={form.district} onChange={handleChange} placeholder="e.g. Kannur" hasError={!!errors.district} error={errors.district} />
            </div>
          )}

          {/* STEP 4 — Professional */}
          {step === 4 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <SelectF label="Department *"        name="department"      value={form.department}      onChange={handleChange} options={DEPARTMENTS}  error={errors.department} />
              <SelectF label="Employee Type *"     name="employeetype"    value={form.employeetype}    onChange={handleChange} options={EMP_TYPES}    error={errors.employeetype} />
              <Field   label="Branch"              icon={<Building2 size={14}/>} name="branch"         value={form.branch}         onChange={handleChange} placeholder="e.g. Kochi Branch" />
              <Field   label="Experience (years)"  icon={<Briefcase size={14}/>} name="experience"     value={form.experience}     onChange={handleChange} placeholder="e.g. 3" />
              <Field   label="Joining Date *"      icon={<Calendar size={14}/>}  name="joiningdate"    value={form.joiningdate}    onChange={handleChange} type="date" hasError={!!errors.joiningdate} error={errors.joiningdate} />
              <SelectF label="Work Mode"           name="mode"            value={form.mode}            onChange={handleChange} options={EMP_MODES} />
              <SelectF label="Employment Status *" name="employmentstatus"value={form.employmentstatus}onChange={handleChange} options={EMP_STATUSES} error={errors.employmentstatus} />
              <Field   label="Resignation Date"    icon={<Calendar size={14}/>}  name="resignationdate"value={form.resignationdate}onChange={handleChange} type="date" />
              <div className="md:col-span-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 flex items-center gap-1.5 ml-1">
                  <FileText size={13} className="text-indigo-400" /> Resume (PDF only)
                </label>
                <label className="flex items-center gap-3 px-4 py-3.5 bg-slate-50 border-2 border-slate-50 hover:border-indigo-300 rounded-xl cursor-pointer transition-all">
                  <Upload size={15} className="text-slate-400 flex-shrink-0" />
                  <span className="text-sm font-bold text-slate-500 truncate">{resumeName || "Click to upload resume..."}</span>
                  <input type="file" accept=".pdf" onChange={handleResume} className="hidden" />
                </label>
              </div>
              <div className="md:col-span-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block ml-1">Remarks</label>
                <textarea name="remarks" value={form.remarks} onChange={handleChange} rows={3} placeholder="Any additional notes..."
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-50 focus:border-indigo-400 rounded-xl text-sm font-medium text-slate-700 outline-none transition-all resize-none" />
              </div>
            </div>
          )}

          {/* STEP 5 — Login */}
          {step === 5 && (
            <div className="space-y-5">
              <div className="bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3 text-xs font-bold text-indigo-600">
                These credentials will be used by the employee to log in to the system.
              </div>
              <Field label="Official Email Address *" icon={<Mail size={14}/>} name="email" type="email" value={form.email} onChange={handleChange} placeholder="name@company.com" hasError={!!errors.email} error={errors.email} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block ml-1">Password *</label>
                  <div className="relative">
                    <input type={showPass ? "text" : "password"} name="password" value={form.password} onChange={handleChange} placeholder="••••••••"
                      className={`w-full px-4 pr-12 py-3.5 border-2 rounded-xl text-sm font-bold text-slate-700 outline-none transition-all ${errors.password ? "border-rose-300 bg-rose-50" : "border-slate-50 bg-slate-50 focus:border-indigo-400"}`} />
                    <button type="button" onClick={() => setShowPass(p => !p)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                      {showPass ? <EyeOff size={15}/> : <Eye size={15}/>}
                    </button>
                  </div>
                  <FieldError msg={errors.password} />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block ml-1">Confirm Password *</label>
                  <div className="relative">
                    <input type={showConf ? "text" : "password"} name="confirmpassword" value={form.confirmpassword} onChange={handleChange} placeholder="••••••••"
                      className={`w-full px-4 pr-12 py-3.5 border-2 rounded-xl text-sm font-bold text-slate-700 outline-none transition-all ${errors.confirmpassword ? "border-rose-300 bg-rose-50" : "border-slate-50 bg-slate-50 focus:border-indigo-400"}`} />
                    <button type="button" onClick={() => setShowConf(p => !p)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                      {showConf ? <EyeOff size={15}/> : <Eye size={15}/>}
                    </button>
                  </div>
                  <FieldError msg={errors.confirmpassword} />
                </div>
              </div>
            </div>
          )}

          {/* STEP 6 — Photo */}
          {step === 6 && (
            <div className="flex flex-col items-center gap-5">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">
                Upload a clear face photo — used for ID card generation
              </p>
              <div className="relative">
                <div className={`w-44 h-44 rounded-2xl border-4 overflow-hidden flex items-center justify-center ${errors.photo ? "border-rose-300 bg-rose-50" : "border-slate-200 bg-slate-50"}`}>
                  {photoPreview
                    ? <img src={photoPreview} alt="preview" className="w-full h-full object-cover" />
                    : <Camera size={44} className="text-slate-300" />
                  }
                </div>
                <label className="absolute -bottom-3 -right-3 bg-indigo-600 text-white p-2.5 rounded-xl cursor-pointer hover:bg-indigo-700 transition-all shadow-lg">
                  <Camera size={15} />
                  <input type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
                </label>
              </div>
              <label className="flex items-center gap-3 px-6 py-3 bg-slate-50 border-2 border-slate-100 hover:border-indigo-300 rounded-xl cursor-pointer transition-all">
                <Upload size={15} className="text-slate-400" />
                <span className="text-sm font-bold text-slate-500">{form.photo ? form.photo.name : "Choose photo from device"}</span>
                <input type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
              </label>
              <FieldError msg={errors.photo} />
              <p className="text-[10px] text-slate-400 font-medium">JPG, PNG, WEBP · Max 5MB</p>

              {/* Summary */}
              <div className="w-full bg-slate-50 rounded-2xl p-5 border border-slate-100 space-y-2 mt-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Review before creating</p>
                {[
                  ["Role",       ALL_ROLES.find(r => r.value === form.usertype)?.label],
                  ["Reports To", managers.find(m => m._id === form.reportsTo)?.name],
                  ["Name",       form.name],
                  ["Email",      form.email],
                  ["Phone",      form.phonenumber],
                  ["Department", form.department],
                  ["Type",       form.employeetype],
                  ["Status",     form.employmentstatus],
                  ["State",      form.state],
                ].filter(([, v]) => v).map(([l, v]) => (
                  <div key={l} className="flex justify-between text-xs">
                    <span className="font-black text-slate-400 uppercase tracking-widest">{l}</span>
                    <span className="font-bold text-slate-700">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-8 py-5 flex justify-between items-center border-t border-slate-100">
          <button type="button" onClick={step === 0 ? () => navigate(-1) : prev}
            className="flex items-center gap-2 px-6 py-3 rounded-xl border border-slate-200 text-slate-500 font-black text-xs uppercase tracking-widest hover:bg-white transition-all">
            <ChevronLeft size={13} /> {step === 0 ? "Cancel" : "Back"}
          </button>
          {step < STEPS.length - 1 ? (
            <button type="button" onClick={next}
              className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/25">
              Next <ChevronRight size={13} />
            </button>
          ) : (
            <button type="button" onClick={handleSubmit} disabled={loading}
              className="flex items-center gap-2 px-8 py-3 bg-emerald-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/25 disabled:opacity-60">
              {loading ? "Creating..." : <><Check size={13} /> Create Account</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const Field = ({ label, icon, hasError, error, ...props }) => (
  <div>
    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 flex items-center gap-1.5 ml-1">
      <span className="text-indigo-400">{icon}</span> {label}
    </label>
    <input {...props} className={`w-full px-4 py-3.5 border-2 rounded-xl text-sm font-bold text-slate-700 placeholder:text-slate-300 outline-none transition-all ${hasError ? "border-rose-300 bg-rose-50" : "border-slate-50 bg-slate-50 focus:border-indigo-400 focus:bg-white"}`} />
    <FieldError msg={error} />
  </div>
);

const SelectF = ({ label, name, value, onChange, options, error }) => (
  <div>
    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block ml-1">{label}</label>
    <select name={name} value={value} onChange={onChange}
      className={`w-full px-4 py-3.5 border-2 rounded-xl text-sm font-bold text-slate-700 outline-none transition-all appearance-none ${error ? "border-rose-300 bg-rose-50" : "border-slate-50 bg-slate-50 focus:border-indigo-400"}`}>
      <option value="">Select...</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
    <FieldError msg={error} />
  </div>
);

const FieldError = ({ msg }) => msg ? (
  <p className="flex items-center gap-1.5 text-rose-500 text-[10px] font-semibold mt-1.5 ml-1">
    <AlertCircle size={11} /> {msg}
  </p>
) : null;

export default Adduser;