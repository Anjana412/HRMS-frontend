import React from "react";
import { useNavigate } from "react-router-dom";
import { ListTodo, CalendarCheck, FileText } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// Dummy data
const attendanceData = [
  { day: "Mon", present: 1 },
  { day: "Tue", present: 1 },
  { day: "Wed", present: 0 },
  { day: "Thu", present: 1 },
  { day: "Fri", present: 1 },
];

const taskData = [
  { name: "Completed", value: 8 },
  { name: "Remaining", value: 4 },
];

const COLORS = ["#0f172a", "#e5e7eb"];
const completion = Math.round((8 / 12) * 100);

const Userdashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold">Welcome back 👋</h2>
        <p className="text-sm text-gray-500">Here's your dashboard overview</p>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Stat icon={<ListTodo />} title="My Tasks" value="12" />
        <Stat icon={<CalendarCheck />} title="Attendance" value="85%" />
        <Stat icon={<FileText />} title="Documents" value="5 Files" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Attendance */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="font-semibold mb-4">Weekly Attendance</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={attendanceData}>
              <XAxis dataKey="day" />
              <YAxis hide />
              <Tooltip />
              <Line
                dataKey="present"
                stroke="#0f172a"
                strokeWidth={3}
                dot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
          <p className="text-xs text-gray-500 mt-2">Present = 1, Absent = 0</p>
        </div>

        {/* Task Completion */}
        <div className="bg-white p-6 rounded-xl shadow flex flex-col items-center">
          <h3 className="font-semibold mb-4">Task Completion</h3>
          <div className="relative w-48 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={taskData}
                  dataKey="value"
                  innerRadius={70}
                  outerRadius={90}
                  startAngle={90}
                  endAngle={-270}
                >
                  {taskData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold">{completion}%</span>
              <span className="text-sm text-gray-500">Completed</span>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-3">8 of 12 tasks completed</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ActionButton label="Mark Attendance" onClick={() => navigate("attendance")} />
        <ActionButton label="Request Leave" onClick={() => navigate("request-leave")} />
        <ActionButton label="Update Profile" onClick={() => {}} />
      </div>
    </div>
  );
};

// Stat Card
const Stat = ({ icon, title, value }) => (
  <div className="bg-white p-6 rounded-xl shadow flex items-center gap-4">
    <div className="p-3 bg-slate-100 rounded-lg">{icon}</div>
    <div>
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-xl font-semibold">{value}</p>
    </div>
  </div>
);

// Quick Action Button
const ActionButton = ({ label, onClick }) => (
  <div className="bg-white p-6 rounded-xl shadow">
    <button
      onClick={onClick}
      className="w-full bg-slate-900 text-white py-2 rounded-lg hover:bg-slate-800 transition"
    >
      {label}
    </button>
  </div>
);

export default Userdashboard;
