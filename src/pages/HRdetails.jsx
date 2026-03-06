import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { deleteUserApi, getUsersByType } from "../api/api";
import { UserPlus, Search, Trash2, Mail, Phone, Briefcase, Hash, UserCheck } from "lucide-react";

const HRdetails = () => {
  const [search, setSearch] = useState("");
  const [hrList, setHrList] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHRs = async () => {
    try {
      const data = await getUsersByType("hr");
      setHrList(data.users || []);
      setLoading(false);
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to fetch HRs");
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this HR officer? This action cannot be undone.")) {
      try {
        await deleteUserApi(id);
        toast.success("Officer removed from system");
        setHrList(hrList.filter((hr) => hr._id !== id));
      } catch (error) {
        toast.error(error.message || "Delete failed");
      }
    }
  };

  useEffect(() => {
    fetchHRs();
  }, []);

  const filteredHR = hrList.filter((hr) =>
    hr.name.toLowerCase().includes(search.toLowerCase()) ||
    hr.department.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* 1. HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">HR Management</h1>
          <p className="text-slate-500 font-bold text-xs uppercase tracking-[0.2em] mt-2 flex items-center gap-2">
            <UserCheck size={14} className="text-indigo-600" />
            System Administrative Personnel
          </p>
        </div>
        <Link 
          to="/dashboard/hr/add" 
          className="group flex items-center gap-3 bg-slate-900 text-white px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg shadow-slate-200"
        >
          <UserPlus size={16} className="group-hover:scale-110 transition-transform" />
          Provision New HR
        </Link>
      </div>

      {/* 2. SEARCH UTILITY */}
      <div className="relative group max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
        <input
          type="text"
          placeholder="Filter by name or department..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-[1.5rem] shadow-sm focus:ring-4 focus:ring-indigo-50/50 outline-none font-bold text-sm text-slate-700 placeholder:text-slate-300 transition-all"
        />
      </div>

      {/* 3. HR GRID (REPLACING TABLE) */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-slate-100 rounded-[2.5rem] animate-pulse" />
          ))}
        </div>
      ) : filteredHR.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredHR.map((hr) => (
            <div key={hr._id} className="group bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-500 relative overflow-hidden">
              {/* Decorative background element */}
              <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-slate-50 rounded-full group-hover:bg-indigo-50 transition-colors duration-500" />
              
              <div className="relative z-10">
                {/* Profile Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-lg shadow-indigo-100 uppercase">
                      {hr.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-black text-slate-900 uppercase tracking-tight text-lg leading-tight">{hr.name}</h3>
                      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-100 text-[9px] font-black text-emerald-600 uppercase mt-1">
                        <Briefcase size={10} /> {hr.department || "Admin"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Info Stack */}
                <div className="space-y-3 mb-8">
                  <InfoRow icon={<Mail size={14}/>} label="Email" value={hr.email} />
                  <InfoRow icon={<Phone size={14}/>} label="Contact" value={hr.phonenumber || "N/A"} />
                  <InfoRow icon={<Hash size={14}/>} label="Access ID" value={hr.employeeId} />
                </div>

                {/* Actions */}
                <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                  <button 
                    onClick={() => handleDelete(hr._id)}
                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.15em] text-rose-500 hover:text-rose-700 transition-colors"
                  >
                    <Trash2 size={14} /> Revoke Access
                  </button>
                  <p className="text-[10px] font-bold text-slate-300 uppercase italic">Level: 2 HR_ADMIN</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[3rem] border border-dashed border-slate-200">
           <div className="h-20 w-20 rounded-full bg-slate-50 flex items-center justify-center text-slate-200 mb-4">
              <Search size={40} />
           </div>
           <p className="text-slate-400 font-black uppercase tracking-widest text-xs">No personnel matched your search</p>
        </div>
      )}
    </div>
  );
};

/* --- UI HELPERS --- */
const InfoRow = ({ icon, label, value }) => (
  <div className="flex items-center gap-3">
    <div className="text-slate-300">{icon}</div>
    <div>
      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-0.5">{label}</p>
      <p className="text-xs font-bold text-slate-700 truncate max-w-[180px]">{value}</p>
    </div>
  </div>
);

export default HRdetails;