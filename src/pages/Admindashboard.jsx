import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const userDistribution = [
  { name: "Admins", value: 4 },
  { name: "HR", value: 10 },
  { name: "Employees", value: 128 },
];

const attendanceOverview = [
  { name: "Present", count: 96 },
  { name: "Absent", count: 18 },
  { name: "On Leave", count: 14 },
];

const taskDistribution = [
  { name: "Assigned", count: 70 },
  { name: "Completed", count: 45 },
  { name: "Pending", count: 25 },
];

const COLORS = ["#2563EB", "#16A34A", "#F97316"];

const Admindashboard = () => {
  return (
    <div className="space-y-8 p-6 bg-gray-100 min-h-screen">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold">Admin Dashboard</h2>
        <p className="text-sm text-gray-500">
          System overview & management controls
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Stat title="Total Employees" value="128" />
        <Stat title="HR Accounts" value="10" />
        <Stat title="Pending Requests" value="18" />
        <Stat title="System Reports" value="42" />
      </div>

      {/* Admin Actions */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h3 className="font-semibold mb-4">Admin Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Action label="Manage HR Accounts" />
          <Action label="Manage Employees" />
          <Action label="Role Permissions" />
          <Action label="System Settings" />
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Distribution */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="font-semibold mb-4">User Distribution</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={userDistribution}
                dataKey="value"
                nameKey="name"
                outerRadius={100}
                label
              >
                {userDistribution.map((_, i) => (
                  <Cell key={i} fill={COLORS[i]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Attendance Overview */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="font-semibold mb-4">Attendance Overview</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={attendanceOverview}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#2563EB" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Task Distribution */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h3 className="font-semibold mb-4">Task Distribution</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={taskDistribution}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#16A34A" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Logs */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h3 className="font-semibold mb-2">Logs & Activity History</h3>
        <p className="text-sm text-gray-400">No recent activity to display.</p>
      </div>
    </div>
  );
};

/* ================== SMALL UI ================== */

const Stat = ({ title, value }) => (
  <div className="bg-white p-6 rounded-xl shadow">
    <p className="text-sm text-gray-500">{title}</p>
    <h2 className="text-3xl font-bold mt-2">{value}</h2>
  </div>
);

const Action = ({ label }) => (
  <button className="bg-slate-900 text-white py-3 rounded-lg hover:bg-slate-800 transition w-full">
    {label}
  </button>
);

export default Admindashboard;
