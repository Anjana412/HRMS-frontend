import React, { useState } from "react";

const Assigntask = () => {
  const [employees] = useState(["Anjana T", "Rahul K", "Meera S"]);

  const [tasks, setTasks] = useState([
    { id: 1, employee: "Anjana T", task: "Design Dashboard UI", status: "Pending" },
    { id: 2, employee: "Rahul K", task: "Build API Endpoints", status: "In Progress" },
  ]);

  const [newTask, setNewTask] = useState({
    employee: employees[0],
    task: "",
    status: "Pending",
  });

  const assignTask = () => {
    if (!newTask.task.trim()) return;
    setTasks((prev) => [
      ...prev,
      { id: prev.length + 1, ...newTask },
    ]);
    setNewTask({ employee: employees[0], task: "", status: "Pending" });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-2xl font-semibold mb-6">Assign Tasks</h1>

      {/* Assign Task Form */}
      <div className="bg-white p-6 rounded-xl shadow mb-6 flex flex-col sm:flex-row gap-4 items-end">
        <div className="flex flex-col flex-1">
          <label className="mb-1 font-medium">Employee</label>
          <select
            className="border px-3 py-2 rounded"
            value={newTask.employee}
            onChange={(e) => setNewTask({ ...newTask, employee: e.target.value })}
          >
            {employees.map((emp, i) => (
              <option key={i} value={emp}>{emp}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col flex-1">
          <label className="mb-1 font-medium">Task</label>
          <input
            type="text"
            placeholder="Enter task description"
            className="border px-3 py-2 rounded"
            value={newTask.task}
            onChange={(e) => setNewTask({ ...newTask, task: e.target.value })}
          />
        </div>

        <div>
          <button
            onClick={assignTask}
            className="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 transition"
          >
            Assign Task
          </button>
        </div>
      </div>

      {/* Tasks Table */}
      <div className="bg-white p-4 rounded-xl shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-3 text-left">Employee</th>
              <th className="p-3 text-left">Task</th>
              <th className="p-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((t) => (
              <tr key={t.id} className="border-t">
                <td className="p-3">{t.employee}</td>
                <td className="p-3">{t.task}</td>
                <td className="p-3">
                  <span
                    className={`px-3 py-1 rounded text-sm ${
                      t.status === "Pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : t.status === "In Progress"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {t.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Assigntask;
