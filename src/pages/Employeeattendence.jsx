import React, { useState } from "react";

const EmployeeAttendance = () => {
  const today = new Date().toISOString().split("T")[0];
  const [marked, setMarked] = useState(false);

  // Sample attendance history (replace with API data if available)
  const [attendanceHistory] = useState([
    { date: "2024-12-28", status: "Present" },
    { date: "2024-12-29", status: "Present" },
    { date: "2024-12-30", status: "Absent" },
  ]);

  const presentCount = attendanceHistory.filter(
    (a) => a.status === "Present"
  ).length;

  const markTodayAttendance = () => {
    setMarked(true);
    // Here you can also add API call to save today's attendance
  };

  return (
    <div className="min-h-screen bg-blue-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">My Attendance</h1>
        <p className="text-gray-600 mt-1">
          Track and manage your daily attendance
        </p>
      </div>

      {/* Top Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {/* Today Card */}
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-sm text-gray-500">Today</h3>
          <p className="text-lg font-semibold mt-1">{today}</p>
          <div className="mt-4">
            {!marked ? (
              <button
                onClick={markTodayAttendance}
                className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
              >
                Mark Attendance
              </button>
            ) : (
              <div className="text-green-700 font-medium flex items-center gap-2">
                ✅ Attendance Marked
              </div>
            )}
          </div>
        </div>

        {/* Summary Card */}
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-sm text-gray-500">This Month</h3>
          <p className="text-2xl font-bold mt-2">
            {presentCount} / {attendanceHistory.length}
          </p>
          <p className="text-sm text-gray-600 mt-1">Days Present</p>
        </div>

        {/* Status Card */}
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-sm text-gray-500">Current Status</h3>
          <p
            className={`mt-3 inline-block px-4 py-2 rounded-full text-sm font-medium ${
              marked ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
            }`}
          >
            {marked ? "Present" : "Not Marked"}
          </p>
        </div>
      </div>

      {/* Attendance History */}
      <div className="bg-white rounded-xl shadow">
        <h2 className="text-lg font-semibold px-6 py-4 border-b">
          Attendance History
        </h2>
        <div className="divide-y">
          {attendanceHistory.map((item, index) => (
            <div key={index} className="flex justify-between items-center px-6 py-4">
              <span className="text-gray-700">{item.date}</span>
              <span
                className={`px-4 py-1 rounded-full text-sm font-medium ${
                  item.status === "Present"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EmployeeAttendance;
