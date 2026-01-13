import React from "react";
import { Link } from "react-router-dom";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

const Hrdashboard = () => {
  const overviewData = [
    { name: "Employees", value: 128 },
    { name: "Present", value: 96 },
    { name: "Leaves", value: 14 },
  ];

  const taskData = [
    { name: "Completed", tasks: 40 },
    { name: "In Progress", tasks: 25 },
    { name: "Pending", tasks: 15 },
  ];

  const COLORS = ["#2563EB", "#16A34A", "#F97316"];

  return (
    <div className="space-y-8 p-6">

      {/* ===== STATS ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Employees", value: 128 },
          { label: "Present Today", value: 96 },
          { label: "Pending Leaves", value: 14 },
          { label: "Active Tasks", value: 32 },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-xl shadow">
            <p className="text-gray-500 text-sm">{stat.label}</p>
            <h2 className="text-3xl font-bold mt-2">{stat.value}</h2>
          </div>
        ))}
      </div>

      {/* ===== QUICK ACTIONS ===== */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="employees"
            className="bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 flex items-center justify-center"
          >
            Add Employee
          </Link>

          <Link
            to="assigntask"
            className="bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 flex items-center justify-center"
          >
            Assign Task
          </Link>

          <Link
            to="hrleaves"
            className="bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600 flex items-center justify-center"
          >
            Approve Leaves
          </Link>

          <Link
            to="/reports"
            className="bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 flex items-center justify-center"
          >
            Generate Report
          </Link>
        </div>
      </div>

      {/* ===== CHARTS ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Pie Chart */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="text-lg font-semibold mb-4">Workforce Overview</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={overviewData}
                dataKey="value"
                nameKey="name"
                outerRadius={100}
                label
              >
                {overviewData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="text-lg font-semibold mb-4">Task Status</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={taskData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="tasks" fill="#2563EB" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ===== MANAGEMENT SECTIONS ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[
          {
            title: "Employee Management",
            description: "Add, edit and view employee records.",
            actions: [
              { label: "View", link: "/employees" },
              { label: "Add", link: "/employees" },
            ],
          },
          {
            title: "Leave Management",
            description: "Approve or reject leave requests.",
            actions: [
              { label: "View", link: "/hrleaves" },
              { label: "Approve", link: "/hrleaves" },
            ],
          },
          {
            title: "HR Documents",
            description: "Upload and manage company files.",
            actions: [
              { label: "Upload", link: "/hrdocuments" },
              { label: "View", link: "/hrdocuments" },
            ],
          },
          {
            title: "Employee Communication",
            description: "Send announcements and updates.",
            actions: [
              { label: "Send", link: "/hrmessages" },
              { label: "Messages", link: "/hrmessages" },
            ],
          },
        ].map((section, idx) => (
          <div key={idx} className="bg-white p-6 rounded-xl shadow">
            <h3 className="font-semibold mb-2">{section.title}</h3>
            <p className="text-sm text-gray-600">{section.description}</p>
            <div className="flex gap-3 mt-4">
              {section.actions.map((action, i) => (
                <Link
                  key={i}
                  to={action.link}
                  className="px-4 py-2 bg-slate-200 rounded-lg hover:bg-slate-300 transition"
                >
                  {action.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Hrdashboard;
