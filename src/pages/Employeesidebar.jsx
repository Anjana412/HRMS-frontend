import React from "react";
import { useNavigate } from "react-router-dom";
import { BarChart2, CalendarCheck, ListTodo, FileText } from "lucide-react";

const Employeesidebar = () => {
  const navigate = useNavigate();

  return (
    <aside className="bg-slate-900 text-white w-64 flex flex-col">
      {/* <div className="h-16 flex items-center justify-center font-bold text-lg border-b border-slate-800">
        ABC COMPANY
      </div> */}
      <nav className="flex flex-col mt-4 px-2 gap-1">
        <button
          className="flex items-center gap-2 p-3 hover:bg-slate-700 rounded"
          onClick={() => navigate("/dashboard")}
        >
          <BarChart2 /> Dashboard
        </button>
        <button
          className="flex items-center gap-2 p-3 hover:bg-slate-700 rounded"
          onClick={() => navigate("/dashboard/attendance")}
        >
          <CalendarCheck /> Attendance
        </button>
        <button
          className="flex items-center gap-2 p-3 hover:bg-slate-700 rounded"
          onClick={() => navigate("/dashboard/tasks")}
        >
          <ListTodo /> My Tasks
        </button>
        <button
          className="flex items-center gap-2 p-3 hover:bg-slate-700 rounded"
          onClick={() => navigate("/dashboard/documents")}
        >
          <FileText /> Documents
        </button>
      </nav>
    </aside>
  );
};

export default Employeesidebar;
