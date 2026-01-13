import React, { useState } from "react";

const HRtaskstatus = () => {
  const [tasks, setTasks] = useState([
    { id: 1, employee: "Anjana T", task: "Design Dashboard UI", status: "In Progress", feedback: "" },
    { id: 2, employee: "Rahul K", task: "Build API Endpoints", status: "Pending", feedback: "" },
    { id: 3, employee: "Meera S", task: "Prepare HR Documents", status: "Completed", feedback: "Well done" },
  ]);

  const updateStatus = (id, value) => {
    setTasks(prev => prev.map(task => task.id === id ? { ...task, status: value } : task));
  };

  const updateFeedback = (id, value) => {
    setTasks(prev => prev.map(task => task.id === id ? { ...task, feedback: value } : task));
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-2xl font-semibold mb-6">Employee Tasks</h1>

      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-3 text-left">Employee</th>
              <th className="p-3 text-left">Task</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Feedback</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map(task => (
              <tr key={task.id} className="border-t hover:bg-gray-50">
                <td className="p-3">{task.employee}</td>
                <td className="p-3">{task.task}</td>
                <td className="p-3">
                  <select
                    value={task.status}
                    onChange={(e) => updateStatus(task.id, e.target.value)}
                    className="border px-2 py-1 rounded"
                  >
                    <option>Pending</option>
                    <option>In Progress</option>
                    <option>Completed</option>
                  </select>
                </td>
                <td className="p-3">
                  <input
                    type="text"
                    value={task.feedback}
                    onChange={(e) => updateFeedback(task.id, e.target.value)}
                    placeholder="Add feedback..."
                    className="border px-2 py-1 rounded w-full"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end mt-6">
        <button className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 transition">
          Save All Changes
        </button>
      </div>
    </div>
  );
};

export default HRtaskstatus;
