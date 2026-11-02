import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Sidebars
import AdminSidebar       from "./Adminsidebar";
import HRSidebar          from "./HRsidebar";
import Employeesidebar    from "./Employeesidebar";
import Managersidebar    from "./Managersidebar";
import PMsidebar          from "./PMsidebar";
import Projectcoordinaterssidebar from "./Projectcoordinaterssidebar";
import Teamleadsidebar    from "./Teamleadsidebar";

// Existing pages
import AdminDashboard     from "./Admindashboard";
import Managerdashboard  from "./Managerdashboard";
import Hrdashboard        from "./Hrdashboard";
import Userdashboard      from "./Userdashboard";
import Employeemanagement from "./Employeemanagement";
import AddEmployee        from "./AddEmployee";
import Attendence         from "./Attendence";
import EmployeeAttendance from "./Employeeattendence";
import EmployeeTasks      from "./EmployeeTasks";
import HRtaskstatus       from "./Hrtaskstatus";
import Assigntask         from "./Assigntask";
import EMleaverequest     from "./EMleaverequest";
import Navbar             from "./Navbar";
import AddHR              from "./AddHR";
import HRdetails          from "./HRdetails";
import Taskdetails        from "./Taskdetails";
import EmpleaveStatus     from "./EmpleaveStatus";
import ViewLeaverequest   from "./ViewLeaverequest";
import Viewallattendence  from "./Viewallattendence";
import Settings           from "./Settings";

// New module pages
import Projects                from "./Projects";
import ProjectDetail           from "./ProjectDetail";
import Payrolldashboard        from "./Payrolldashboard";
import MyPayslips              from "./Mypayslips";
import AddUser                 from "./Adduser";
import Viewprofile             from "./Viewprofile";
import EmployeeAttendanceGraph from "./Employeeattendancegraph";

const Dashboard = ({ role }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const Sidebar =
    role === "admin"              ? AdminSidebar :
    role === "hr"                 ? HRSidebar :
    role === "manager"            ? Managersidebar :
    role === "projectmanager"     ? PMsidebar :
    role === "projectcoordinator" ? Projectcoordinaterssidebar :
    role === "teamlead"           ? Teamleadsidebar :
    Employeesidebar;

  const isRole = (...roles) => roles.includes(role);

  return (
    <>
      <Navbar role={role} onMenuClick={() => setSidebarOpen(true)} />

      <div className="flex bg-slate-100" style={{ height: "calc(100vh - 80px)", overflow: "hidden" }}>

        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <div className={`
          fixed top-0 left-0 h-full z-50 transition-transform duration-300 ease-in-out
          lg:static lg:translate-x-0 lg:z-auto lg:h-auto lg:transition-none
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}>
          {sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-4 z-50 lg:hidden text-slate-400 hover:text-white bg-slate-800 rounded-xl p-2"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          )}
          <Sidebar onNavigate={() => setSidebarOpen(false)} />
        </div>

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Routes>

            {/* HOME */}
            <Route
              index
              element={
                role === "admin"              ? <AdminDashboard /> :
                role === "hr"                 ? <Hrdashboard />    :
                role === "manager"            ? <Managerdashboard /> :
                role === "projectmanager"     ? <Hrdashboard />    :
                role === "projectcoordinator" ? <Userdashboard />  :
                role === "teamlead"           ? <Userdashboard />  :
                <Userdashboard />
              }
            />

            {/* SETTINGS — all roles */}
            <Route path="settings" element={<Settings />} />

            {/* PROJECTS — all roles */}
            <Route path="projects"        element={<Projects />} />
            <Route path="projects/:id"    element={<ProjectDetail />} />
            <Route path="myprojects"      element={<Projects />} />

            {/* PAYROLL — hr/admin only (backend allows only these) */}
            {isRole("admin", "hr") && (
              <Route path="payroll" element={<Payrolldashboard />} />
            )}

            {/* MY PAYSLIPS — all staff */}
            <Route path="mypayslips" element={<MyPayslips />} />

            {/* EMPLOYEE ATTENDANCE GRAPH — hr and admin only */}
            {isRole("admin", "hr") && (
              <Route path="employee-attendance/:id" element={<EmployeeAttendanceGraph />} />
            )}

            {/* ADMIN + DIRECTOR */}
            {isRole("admin", "manager") && (
              <>
                <Route path="hr"            element={<ViewLeaverequest />} />
                <Route path="adduser"       element={<AddUser />} />
                <Route path="allattendance" element={<Viewallattendence />} />
                <Route path="tasks"         element={<HRtaskstatus />} />
                <Route path="assigntask"    element={<Assigntask />} />
              </>
            )}

            {/* HR */}
            {isRole("hr") && (
              <>
                <Route path="adduser"        element={<AddUser />} />
                <Route path="tasks"          element={<HRtaskstatus />} />
                <Route path="assigntask"     element={<Assigntask />} />
                <Route path="assign-task"    element={<Assigntask />} />
                <Route path="leave-requests" element={<ViewLeaverequest />} />
                <Route path="attendance" element={<Attendence />}>
                  <Route path="add" element={<AddEmployee />} />
                </Route>
              </>
            )}

            {/* PROJECT MANAGER */}
            {isRole("projectmanager") && (
              <>
                <Route path="tasks"         element={<HRtaskstatus />} />
                <Route path="assigntask"    element={<Assigntask />} />
                <Route path="allattendance" element={<Viewallattendence />} />
              </>
            )}

            {/* TEAM LEAD / COORDINATOR / EMPLOYEE — their own tasks */}
            {isRole("teamlead", "projectcoordinator", "employee") && (
              <>
                <Route path="tasks"     element={<EmployeeTasks />} />
                <Route path="tasks/:id" element={<Taskdetails />} />
              </>
            )}

            {/* TEAM LEAD / COORDINATOR — assign tasks to their team */}
            {isRole("teamlead", "projectcoordinator") && (
              <Route path="assigntask" element={<Assigntask />} />
            )}

            {/* Everyone below HR — own attendance + own leave */}
            {isRole("projectmanager", "projectcoordinator", "teamlead", "employee") && (
              <>
                <Route path="empattendance" element={<EmployeeAttendance />} />
                <Route path="request-leave" element={<EMleaverequest />} />
                <Route path="leave-status"  element={<EmpleaveStatus />} />
              </>
            )}

            {/* Approvers below HR — leave requests from their direct reports */}
            {isRole("projectmanager", "projectcoordinator", "teamlead") && (
              <Route path="leave-requests" element={<ViewLeaverequest />} />
            )}

            {/* SHARED — employee management */}
            {isRole("admin", "hr", "manager", "projectmanager") && (
              <Route path="employees" element={<Employeemanagement />}>
                <Route path="add" element={<AddEmployee />} />
              </Route>
            )}

            {/* PROFILE — all roles, no attendance tab */}
            <Route path="profile"     element={<Viewprofile />} />
            <Route path="profile/:id" element={<Viewprofile />} />

            {/* Anything unknown goes back to the dashboard home */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />

          </Routes>
        </main>
      </div>
    </>
  );
};

export default Dashboard;