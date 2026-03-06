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
import AddHR from "./AddHR";
import HRdetails from "./HRdetails";
import Taskdetails from "./Taskdetails";
import EmpleaveStatus from "./EmpleaveStatus";
import ViewLeaverequest from "./ViewLeaverequest";
import Viewallattendence from "./Viewallattendence";



const Dashboard = ({ role }) => {

  console.log("ROLE RECEIVED IN DASHBOARD:", role);
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
          {/* {role === "admin" && <Route index element={<AdminDashboard />} />}
          {role === "hr" && <Route index element={<Hrdashboard />} />}
          {role === "employee" && <Route index element={<Userdashboard />} />} */}

            <Route
              index
              element={
                role === "admin" ? (
                  <AdminDashboard />
                ) : role === "hr" ? (
                  <Hrdashboard />
                ) : role === "employee" ? (
                  <Userdashboard />
                ) : (
                  <div>Unauthorized</div>
                )
              }
            />


          {role === "admin" && (
            <>
              <Route path="hr" element={<HRdetails />} />
              <Route path="hr/add" element={<AddHR />} />
              <Route path="allattendance" element={<Viewallattendence />} />

            </>
          )}



          {/* EMPLOYEES */}
          {role !== "employee" && (
            <Route path="employees" element={<Employeemanagement />}>
              <Route path="add" element={<AddEmployee />} />  {/* nested child — works for both admin AND hr */}
            </Route>
          )}

          {/* ADD EMPLOYEE (separate page) */}
          {/* {role === "hr" && <Route path="employees/add" element={<AddEmployee />} />} */}

          {/* ATTENDANCE */}
          {role === "hr" && <Route path="attendance" element={<Attendence />} />}

          {role === "hr" && (
              <Route path="attendance" element={<Attendence />}>
                <Route path="add" element={<AddEmployee />} />
              </Route>
          )}

          {/* TASKS */}
          {role === "employee" && (
            <>
              <Route path="tasks" element={<EmployeeTasks />} />
              <Route path="tasks/:id" element={<Taskdetails />} /> {/* New Route */}
            </>
          )}
          {role === "hr" && <Route path="tasks" element={<HRtaskstatus />} />}
          {role === "hr" && <Route path="assigntask" element={<Assigntask />} />}
          {role === "hr" && <Route path="assign-task" element={<Assigntask />} />}
          {role === "hr" && <Route path="leave-requests" element={<ViewLeaverequest />} />}
          
          {role === "employee" && (
            <Route path="empattendance" element={<EmployeeAttendance />} /> // Employee sees their personal history
          )}

          {/* LEAVE */}
          {role === "employee" && (
            <Route path="request-leave" element={<EMleaverequest />} />
          )}

          {/* LEAVE */}
          {role === "employee" && (
            <>
              <Route path="request-leave" element={<EMleaverequest />} />
              {/* Optional: if you want a separate page for full history */}
              <Route path="leave-status" element={<EmpleaveStatus />} /> 
            </>
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
