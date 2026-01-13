import { NavLink } from "react-router-dom";
import { BarChart2, Users, FileText, Settings } from "lucide-react";

const Adminsidebar = () => {
  return (
    <aside className="bg-slate-900 text-white w-64 flex flex-col min-h-screen">
      {/* <div className="h-16 flex items-center justify-center font-bold text-lg border-b border-slate-800">
        ABC COMPANY
      </div> */}

      <nav className="flex flex-col mt-4 px-2 gap-1">
        <Item to="/dashboard" icon={<BarChart2 />} label="Dashboard" end />
        <Item to="/dashboard/employees" icon={<Users />} label="Employees" />
        <Item to="/dashboard/documents" icon={<FileText />} label="Documents" />
        <Item to="/dashboard/settings" icon={<Settings />} label="Settings" />
      </nav>
    </aside>
  );
};

const Item = ({ to, icon, label, end }) => (
  <NavLink
    to={to}
    end={end}
    className={({ isActive }) =>
      `flex items-center gap-3 p-3 rounded-lg transition ${
        isActive ? "bg-slate-700" : "hover:bg-slate-700"
      }`
    }
  >
    {icon}
    <span>{label}</span>
  </NavLink>
);

export default Adminsidebar;
