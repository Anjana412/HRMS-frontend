import React from "react";
import { Routes, Route } from "react-router-dom";

// Sidebars
import AdminSidebar from "./Adminsidebar";
import HRSidebar from "./HRsidebar";
import Employeesidebar from "./Employeesidebar";

// Pages
import AdminDashboard from "./Admindashboard";
import Hrdashboard from "./Hrdashboard";
import Userdashboard from "./Userdashboard";
import Employeemanagement from "./Employeemanagement";
import AddEmployee from "./AddEmployee";
import Attendence from "./Attendence";
import EmployeeAttendance from "./Employeeattendence";
import EmployeeTasks from "./EmployeeTasks";
import HRtaskstatus from "./Hrtaskstatus";
import Assigntask from "./Assigntask";
import EMleaverequest from "./EMleaverequest";
import Navbar from "./Navbar";



const Dashboard = ({ role }) => {
  const Sidebar =
    role === "admin"? AdminSidebar: role === "hr"? HRSidebar : Employeesidebar;

  return (
<>
     <Navbar role={role} />
    <div className="flex h-screen overflow-hidden bg-slate-100">
    
      <Sidebar />

      <main className="flex-1 overflow-y-auto p-6">
        <Routes>
          {/* DASHBOARD HOME */}
          {role === "admin" && <Route index element={<AdminDashboard />} />}
          {role === "hr" && <Route index element={<Hrdashboard />} />}
          {role === "employee" && <Route index element={<Userdashboard />} />}

          {/* EMPLOYEES */}
          {role !== "employee" && (
            <Route path="employees" element={<Employeemanagement />} />
          )}

          {/* ADD EMPLOYEE (separate page) */}
          {role === "hr" && <Route path="employees/add" element={<AddEmployee />} />}

          {/* ATTENDANCE */}
          {role === "hr" && <Route path="attendance" element={<Attendence />} />}
          {role === "employee" && (
            <Route path="attendance" element={<EmployeeAttendance />} />
          )}

          {/* TASKS */}
          {role === "employee" && <Route path="tasks" element={<EmployeeTasks />} />}
          {role === "hr" && <Route path="tasks" element={<HRtaskstatus />} />}
          {role === "hr" && <Route path="assigntask" element={<Assigntask />} />}
          {role === "hr" && <Route path="assign-task" element={<Assigntask />} />}

          {/* LEAVE */}
          {role === "employee" && (
            <Route path="request-leave" element={<EMleaverequest />} />
          )}

          {/* COMMON */}
          <Route path="documents" element={<div>Documents Page</div>} />
          <Route path="settings" element={<div>Settings Page</div>} />
        </Routes>
      </main>
    </div>
    </>
  );
};

export default Dashboard;
