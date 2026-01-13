import React, { useState } from "react";

const Attendance = () => {
  const [selectedDate, setSelectedDate] = useState("2025-01-01");

  const [employees, setEmployees] = useState([
    { id: 1, name: "Anjana T", role: "Frontend Developer", status: "Present" },
    { id: 2, name: "Rahul K", role: "Backend Developer", status: "Absent" },
    { id: 3, name: "Meera S", role: "HR Executive", status: "Leave" },
  ]);

  const updateStatus = (id, value) => {
    setEmployees((prev) =>
      prev.map((emp) => (emp.id === id ? { ...emp, status: value } : emp))
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 space-y-6">
      {/* Page Title & Date Selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-semibold">Attendance Management</h1>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="border px-3 py-2 rounded"
        />
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-3 text-left">Employee Name</th>
              <th className="p-3 text-left">Role</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Update</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr key={emp.id} className="border-t hover:bg-gray-50">
                <td className="p-3">{emp.name}</td>
                <td className="p-3">{emp.role}</td>
                <td className="p-3">
                  <span
                    className={`px-3 py-1 rounded text-sm font-medium ${
                      emp.status === "Present"
                        ? "bg-green-100 text-green-700"
                        : emp.status === "Absent"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {emp.status}
                  </span>
                </td>
                <td className="p-3">
                  <select
                    value={emp.status}
                    onChange={(e) => updateStatus(emp.id, e.target.value)}
                    className="border px-2 py-1 rounded"
                  >
                    <option>Present</option>
                    <option>Absent</option>
                    <option>Leave</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Action Button */}
      <div className="flex justify-end">
        <button className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition">
          Export Attendance (PDF)
        </button>
      </div>
    </div>
  );
};

export default Attendance;
