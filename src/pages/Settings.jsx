import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { Settings2, User, Lock, Eye, EyeOff, Save, Check, LogOut, Loader2 } from "lucide-react";
import { updateUserProfile, changePassword, getUserById } from "../api/api";

const ROLE_LABELS = {
  admin: "Admin", manager: "Manager", hr: "HR", projectmanager: "Project Manager",
  projectcoordinator: "Project Coordinator", teamlead: "Team Lead", employee: "Employee",
};

const Settings = () => {
  const role   = localStorage.getItem("usertype") || "employee";
  const userId = localStorage.getItem("id");

  const [activeTab, setActiveTab] = useState("profile");

  // ── Profile ──
  const [name,  setName]  = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSaved,   setProfileSaved]   = useState(false);

  // ── Security ──
  const [currentPw, setCurrentPw] = useState("");
  const [newPw,     setNewPw]     = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew,     setShowNew]     = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [pwSaved,   setPwSaved]   = useState(false);

  useEffect(() => {
    if (!userId) return;
    getUserById(userId)
      .then((data) => {
        const u = data.user || data;
        setName(u.name || "");
        setEmail(u.email || "");
        setPhone(u.phonenumber || "");
      })
      .catch(() => toast.error("Could not load your profile"));
  }, [userId]);

  const handleSaveProfile = async () => {
    if (!name.trim())  return toast.error("Name cannot be empty");
    if (!email.trim()) return toast.error("Email cannot be empty");
    setProfileLoading(true);
    try {
      await updateUserProfile(userId, { name, email, phonenumber: phone });
      setProfileSaved(true);
      toast.success("Profile updated successfully");
      setTimeout(() => setProfileSaved(false), 2500);
    } catch (err) {
      toast.error(err?.message || "Failed to update profile");
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPw || !newPw || !confirmPw) return toast.error("Please fill all password fields");
    if (newPw !== confirmPw)    return toast.error("New passwords don't match");
    if (newPw.length < 6)       return toast.error("Password must be at least 6 characters");
    if (newPw === currentPw)    return toast.error("New password must differ from current password");

    setPwLoading(true);
    try {
      await changePassword({ currentPassword: currentPw, newPassword: newPw });
      setPwSaved(true);
      toast.success("Password changed successfully");
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
      setTimeout(() => setPwSaved(false), 2500);
    } catch (err) {
      toast.error(err?.message || "Incorrect current password");
    } finally {
      setPwLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  const pwStrength = !newPw ? 0 : newPw.length < 6 ? 1 : newPw.length < 8 ? 2 : newPw.length < 10 ? 3 : 4;
  const pwStrengthLabel = ["", "Too short", "Fair", "Good", "Strong"][pwStrength];
  const pwStrengthColor = ["", "bg-rose-400", "bg-amber-400", "bg-blue-400", "bg-emerald-400"][pwStrength];

  const tabs = [
    { id: "profile",  icon: <User size={16} />, label: "Profile" },
    { id: "security", icon: <Lock size={16} />, label: "Security" },
  ];

  return (
    <div className="min-h-screen bg-[#F1F5F9] px-4 pt-2 pb-10 lg:px-10 font-sans">
      <div className="max-w-5xl mx-auto">

        <header className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <span className="bg-slate-900 p-2 rounded-lg text-white"><Settings2 size={22} /></span>
            <h1 className="text-4xl font-black tracking-tight text-slate-900">Settings</h1>
          </div>
          <p className="text-slate-500 font-medium ml-12">Manage your account.</p>
        </header>

        <div className="flex flex-col lg:flex-row gap-6">

          <aside className="lg:w-56 flex-shrink-0">
            <nav className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden p-2 flex flex-row lg:flex-col gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all w-full text-sm font-bold ${
                    activeTab === tab.id
                      ? "bg-slate-900 text-white shadow-lg"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-left w-full text-sm font-bold text-rose-400 hover:bg-rose-50 transition-all lg:mt-2 lg:border-t lg:border-slate-100"
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </nav>
          </aside>

          <main className="flex-1 space-y-4">

            {activeTab === "profile" && (
              <Panel title="Profile Information" subtitle="Update your name, email and phone number.">
                <div className="flex items-center gap-5 mb-2 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="h-16 w-16 rounded-[1.25rem] bg-slate-900 text-white flex items-center justify-center text-2xl font-black flex-shrink-0">
                    {name?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                  <div>
                    <p className="font-black text-slate-800 text-lg">{name || "—"}</p>
                    <p className="text-sm text-slate-500 font-medium">{email || "—"}</p>
                    <span className="mt-1 inline-block text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-600">
                      {ROLE_LABELS[role] || role}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <Field label="Full Name"     value={name}  onChange={setName}  placeholder="Your full name" />
                  <Field label="Email Address" value={email} onChange={setEmail} placeholder="your@email.com" type="email" />
                  <Field label="Phone Number"  value={phone} onChange={setPhone} placeholder="+91 98765 43210" />
                </div>

                <ActionButton onClick={handleSaveProfile} loading={profileLoading} saved={profileSaved} label="Save Profile" />
              </Panel>
            )}

            {activeTab === "security" && (
              <Panel title="Change Password" subtitle="Enter your current password and choose a new one.">
                <div className="space-y-4">
                  <PasswordField label="Current Password" value={currentPw} onChange={setCurrentPw}
                    show={showCurrent} onToggle={() => setShowCurrent(!showCurrent)} />
                  <PasswordField label="New Password" value={newPw} onChange={setNewPw}
                    show={showNew} onToggle={() => setShowNew(!showNew)} />
                  <div>
                    <label className="text-[11px] font-bold uppercase text-slate-500 mb-1.5 ml-1 block tracking-wider">Confirm New Password</label>
                    <input
                      type="password"
                      value={confirmPw}
                      onChange={(e) => setConfirmPw(e.target.value)}
                      placeholder="••••••••"
                      className={`w-full px-5 py-3.5 bg-white border-2 rounded-2xl outline-none font-semibold text-slate-700 shadow-sm transition-all ${
                        confirmPw && confirmPw !== newPw
                          ? "border-rose-200 focus:border-rose-400"
                          : "border-slate-100 focus:border-blue-500/50"
                      }`}
                    />
                    {confirmPw && confirmPw !== newPw && (
                      <p className="text-xs text-rose-500 font-bold mt-1 ml-1">Passwords don't match</p>
                    )}
                  </div>
                </div>

                {newPw && (
                  <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Password Strength</p>
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4].map((n) => (
                        <div key={n} className={`h-1.5 flex-1 rounded-full transition-all ${pwStrength >= n ? pwStrengthColor : "bg-slate-200"}`} />
                      ))}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1.5 font-medium">{pwStrengthLabel}</p>
                  </div>
                )}

                <ActionButton onClick={handleChangePassword} loading={pwLoading} saved={pwSaved} label="Update Password" />
              </Panel>
            )}

          </main>
        </div>
      </div>
    </div>
  );
};

const Panel = ({ title, subtitle, children }) => (
  <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8">
    <div className="mb-6">
      <h2 className="text-xl font-black text-slate-900">{title}</h2>
      <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>
    </div>
    <div className="space-y-6">{children}</div>
  </div>
);

const Field = ({ label, value, onChange, placeholder, type = "text" }) => (
  <div>
    <label className="text-[11px] font-bold uppercase text-slate-500 mb-1.5 ml-1 block tracking-wider">{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-5 py-3.5 bg-white border-2 border-slate-100 rounded-2xl focus:border-blue-500/50 outline-none font-semibold text-slate-700 shadow-sm transition-all"
    />
  </div>
);

const PasswordField = ({ label, value, onChange, show, onToggle }) => (
  <div>
    <label className="text-[11px] font-bold uppercase text-slate-500 mb-1.5 ml-1 block tracking-wider">{label}</label>
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="••••••••"
        className="w-full px-5 py-3.5 pr-12 bg-white border-2 border-slate-100 rounded-2xl focus:border-blue-500/50 outline-none font-semibold text-slate-700 shadow-sm transition-all"
      />
      <button type="button" onClick={onToggle} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  </div>
);

const ActionButton = ({ onClick, loading, saved, label = "Save Changes" }) => (
  <button
    onClick={onClick}
    disabled={loading}
    className={`mt-2 flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-sm uppercase tracking-wider transition-all ${
      saved   ? "bg-emerald-500 text-white" :
      loading ? "bg-slate-300 text-slate-500 cursor-not-allowed" :
                "bg-slate-900 text-white hover:bg-slate-800 shadow-lg"
    }`}
  >
    {loading ? (
      <><Loader2 size={16} className="animate-spin" /> Saving...</>
    ) : saved ? (
      <><Check size={16} /> Saved!</>
    ) : (
      <><Save size={16} /> {label}</>
    )}
  </button>
);

export default Settings;
