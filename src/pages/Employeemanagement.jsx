import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  Users, Search, UserPlus, Trash2, Mail,
  Briefcase, Loader2, Eye, Filter, ChevronDown
} from "lucide-react";
import { getMyTeam, deleteUserApi } from "../api/api";

const ALL_ROLES = [
  { value: "all",                label: "All Staff",           color: "bg-slate-900 text-white" },
  { value: "manager",           label: "Manager",             color: "bg-violet-100 text-violet-800 border border-violet-200" },
  { value: "hr",                 label: "HR",                  color: "bg-indigo-100 text-indigo-800 border border-indigo-200" },
  { value: "projectmanager",     label: "Project Manager",     color: "bg-teal-100 text-teal-800 border border-teal-200" },
  { value: "projectcoordinator", label: "Project Coordinator", color: "bg-sky-100 text-sky-800 border border-sky-200" },
  { value: "teamlead",           label: "Team Lead",           color: "bg-emerald-100 text-emerald-800 border border-emerald-200" },
  { value: "employee",           label: "Employee",            color: "bg-slate-100 text-slate-700 border border-slate-200" },
];

const Employeemanagement = () => {
  const navigate = useNavigate();
  const myRole = localStorage.getItem("usertype");
  // Must match CREATION_RULES in the backend usercontroller.js
  const MANAGEABLE = {
    admin:   ["manager", "hr", "projectmanager", "projectcoordinator", "teamlead", "employee"],
    manager: ["hr", "projectmanager"],
    hr:      ["projectmanager", "projectcoordinator", "teamlead", "employee"],
  };
  const canAdd    = !!MANAGEABLE[myRole];
  const canManage = (u) => (MANAGEABLE[myRole] || []).includes(u.usertype);
  const [allUsers, setAllUsers]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [activeRole, setActiveRole] = useState("all");
  const [counts, setCounts]         = useState({});

  const fetchAll = async () => {
    setLoading(true);
    try {
      const data = await getMyTeam();
      const users = (Array.isArray(data) ? data : data?.users || [])
        .filter(u => u.usertype !== "admin"); // admin manages others, not themselves
      setAllUsers(users);
      // Build counts per role
      const c = {};
      users.forEach(u => {
        if (u.usertype) c[u.usertype] = (c[u.usertype] || 0) + 1;
      });
      setCounts(c);
    } catch {
      toast.error("Failed to load team");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Remove ${name} from the system?`)) return;
    try {
      await deleteUserApi(id);
      toast.success("User removed");
      setAllUsers(prev => prev.filter(u => u._id !== id));
    } catch (err) {
      toast.error(err?.message || "Delete failed");
    }
  };

  const filtered = allUsers.filter(u => {
    const matchRole   = activeRole === "all" || u.usertype === activeRole;
    const matchSearch = u.name?.toLowerCase().includes(search.toLowerCase()) ||
                        u.email?.toLowerCase().includes(search.toLowerCase()) ||
                        u.department?.toLowerCase().includes(search.toLowerCase()) ||
                        u.employeeId?.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
  });

  const totalAll = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <div className="w-full min-h-screen bg-slate-50/30 p-4 lg:p-8">

      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase flex items-center gap-3">
            <div className="p-2.5 bg-slate-900 rounded-xl text-white shadow-lg">
              <Users size={22} />
            </div>
            Staff Directory
          </h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">
            {totalAll} users across {ALL_ROLES.length - 1} roles
          </p>
        </div>
        {canAdd && <button
          onClick={() => navigate("/dashboard/adduser")}
          className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/25">
          <UserPlus size={18} /> Add User
        </button>}
      </div>

      {/* Role filter tabs */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        {ALL_ROLES.map(r => (
          <button key={r.value} onClick={() => setActiveRole(r.value)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all ${
              activeRole === r.value
                ? r.value === "all" ? "bg-slate-900 text-white shadow-lg" : r.color + " shadow-sm scale-[1.02]"
                : "bg-white text-slate-400 border border-slate-200 hover:border-slate-400"
            }`}>
            {r.label}
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${
              activeRole === r.value ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
            }`}>
              {r.value === "all" ? totalAll : (counts[r.value] || 0)}
            </span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, email, department or ID..."
          className="w-full pl-11 pr-4 py-3.5 bg-white border-2 border-slate-100 rounded-2xl focus:border-indigo-400 outline-none text-sm font-bold text-slate-700 placeholder:text-slate-300 shadow-sm transition-all" />
      </div>

      {/* Table */}
      <div className="bg-white rounded-[1.5rem] border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="animate-spin text-indigo-600" size={36} />
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Loading staff...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Users size={48} className="text-slate-200" />
            <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No users found</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-slate-50">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Member</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Role</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Department</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(user => {
                const roleConfig = ALL_ROLES.find(r => r.value === user.usertype);
                return (
                  <tr key={user._id} className="hover:bg-slate-50/50 transition-colors group">

                    {/* Member */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {user.photo ? (
                          <img src={user.photo} alt={user.name}
                            className="h-11 w-11 rounded-xl object-cover border-2 border-slate-100" />
                        ) : (
                          <div className="h-11 w-11 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-sm">
                            {user.name?.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-black text-slate-900">{user.name}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            {user.employeeId || user._id?.slice(-6).toUpperCase()}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg ${roleConfig?.color || "bg-slate-100 text-slate-600"}`}>
                        {roleConfig?.label || user.usertype}
                      </span>
                    </td>

                    {/* Department */}
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold text-slate-600">{user.department || "—"}</span>
                    </td>

                    {/* Contact */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                        <Mail size={13} className="text-slate-300" />
                        {user.email}
                      </div>
                      {user.phonenumber && (
                        <p className="text-[10px] font-bold text-slate-400 mt-0.5">{user.phonenumber}</p>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border ${
                        user.employmentstatus === "Active"     ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                        user.employmentstatus === "On Leave"   ? "bg-amber-50 text-amber-700 border-amber-200" :
                        user.employmentstatus === "Resigned"   ? "bg-rose-50 text-rose-700 border-rose-200" :
                        "bg-slate-50 text-slate-600 border-slate-200"
                      }`}>
                        {user.employmentstatus || "Active"}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => navigate(`/profile/${user._id}`)}
                          className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                          title="View Profile">
                          <Eye size={16} />
                        </button>
                        {canManage(user) && <button onClick={() => handleDelete(user._id, user.name)}
                          className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
                          title="Delete User">
                          <Trash2 size={16} />
                        </button>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Employeemanagement;