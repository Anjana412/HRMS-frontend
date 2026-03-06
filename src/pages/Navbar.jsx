import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { User, Bell, Link as LinkIcon, X, Clock, LogOut } from "lucide-react";
import { getNotifications, markNotificationsRead } from "../api/api";

const Navbar = ({ role }) => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount]     = useState(0);

  // Fetch notifications on mount and poll every 30s
  const fetchNotifications = async () => {
  const token = localStorage.getItem("token");
  if (!token) return; // ← stop here if not logged in
  try {
    const data = await getNotifications();
    setNotifications(data.notifications || []);
    setUnreadCount(data.unreadCount || 0);
  } catch (err) {
    console.error("Failed to fetch notifications:", err);
  }
};

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Open sidebar and mark all as read
  const handleOpenSidebar = async () => {
    setIsSidebarOpen(true);
    if (unreadCount > 0) {
      try {
        await markNotificationsRead();
        setUnreadCount(0);
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      } catch (err) {
        console.error("Failed to mark as read:", err);
      }
    }
  };

  const handleProfileClick = () => {
    const storedId = localStorage.getItem("id");
    if (storedId) navigate(`/profile/${storedId}`);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/", { replace: true });
    window.location.reload();
  };

  const timeAgo = (dateStr) => {
    const diff  = Date.now() - new Date(dateStr).getTime();
    const mins  = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days  = Math.floor(diff / 86400000);
    if (mins < 60)  return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const typeBadge = (type) => {
    if (type === "success") return "bg-emerald-50 border-emerald-100";
    if (type === "alert")   return "bg-rose-50 border-rose-100";
    return "bg-indigo-50 border-indigo-100";
  };

  const typeDot = (type) => {
    if (type === "success") return "bg-emerald-500";
    if (type === "alert")   return "bg-rose-500";
    return "bg-indigo-500";
  };

  return (
    <>
      <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-8 sticky top-0 z-50">
        {/* LOGO */}
        <Link to="/dashboard" className="flex items-center gap-2 group">
          <div className="bg-indigo-600 p-2 rounded-xl rotate-3 group-hover:rotate-0 transition-all shadow-lg shadow-indigo-100">
            <LinkIcon className="text-white" size={20} />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-xl font-black tracking-tighter text-slate-900">INTERNAL<span className="text-indigo-600">LINK</span></span>
            <span className="text-[8px] font-black uppercase tracking-[0.4em] text-slate-400 mt-0.5">Systems Architecture</span>
          </div>
        </Link>

        {/* RIGHT ACTIONS */}
        <div className="flex items-center gap-4">

          {/* Bell with unread badge */}
          <button
            onClick={handleOpenSidebar}
            className="relative p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 bg-rose-500 text-white text-[9px] font-black rounded-full border-2 border-white flex items-center justify-center">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {/* Profile */}
          <button onClick={handleProfileClick} className="group p-0.5 rounded-2xl bg-gradient-to-tr from-slate-200 to-slate-50 hover:from-indigo-500 hover:to-purple-500 transition-all shadow-sm">
            <div className="bg-white rounded-[14px] p-2 text-slate-400 group-hover:text-white group-hover:bg-transparent transition-colors">
              <User size={22} />
            </div>
          </button>

          <div className="h-6 w-[1px] bg-slate-200 mx-2"></div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-all group border border-transparent hover:border-rose-100"
          >
            <LogOut size={18} className="group-hover:-translate-x-1 transition-transform duration-300" />
            <span className="text-[10px] font-black uppercase tracking-widest hidden lg:block">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[60]"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* NOTIFICATION SIDEBAR */}
      <div className={`fixed top-0 right-0 h-full w-full max-w-sm bg-white shadow-2xl z-[70] transform transition-transform duration-300 ease-out ${isSidebarOpen ? "translate-x-0" : "translate-x-full"}`}>
        <div className="p-6 flex flex-col h-full">

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Notifications</h2>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                {notifications.length} total
              </p>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-slate-900 transition-all">
              <X size={20} />
            </button>
          </div>

          {/* Notification list */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {notifications.length === 0 ? (
              <div className="text-center py-16">
                <Bell size={32} className="mx-auto text-slate-200 mb-3" />
                <p className="text-slate-400 font-black uppercase tracking-widest text-xs">No notifications yet</p>
              </div>
            ) : (
              notifications.map((note) => (
                <div
                  key={note._id}
                  className={`p-4 rounded-2xl border transition-all ${
                    note.read ? "bg-white border-slate-100" : typeBadge(note.type)
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex items-start gap-2">
                      {!note.read && (
                        <div className={`h-2 w-2 rounded-full shrink-0 mt-1.5 ${typeDot(note.type)}`} />
                      )}
                      <p className="text-sm font-bold text-slate-800 leading-snug">{note.message}</p>
                    </div>
                    <span className="text-[9px] font-bold text-slate-400 flex items-center gap-1 uppercase tracking-tighter shrink-0">
                      <Clock size={10} /> {timeAgo(note.createdAt)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      </div>
    </>
  );
};

export default Navbar;