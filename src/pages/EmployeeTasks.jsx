import React, { useState } from "react";

const EmployeeTasks = () => {
  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: "Design Login Page",
      description: "Create UI for login and signup pages",
      deadline: "2025-01-05",
      status: "Pending",
    },
    {
      id: 2,
      title: "API Integration",
      description: "Integrate attendance APIs",
      deadline: "2025-01-08",
      status: "Completed",
    },
  ]);

  const markCompleted = (id) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, status: "Completed" } : task
      )
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Page Title */}
      <h1 className="text-2xl font-semibold mb-6">My Tasks</h1>

      {/* Task List */}
      <div className="grid gap-4">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="bg-white p-5 rounded-xl shadow flex flex-col sm:flex-row justify-between gap-4"
          >
            <div>
              <h2 className="text-lg font-medium">{task.title}</h2>
              <p className="text-sm text-gray-600 mt-1">{task.description}</p>
              <p className="text-sm mt-2">
                <strong>Deadline:</strong> {task.deadline}
              </p>
            </div>

            <div className="flex flex-col items-end justify-between gap-3 sm:gap-0">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  task.status === "Completed"
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {task.status}
              </span>

              <div className="flex flex-col sm:flex-row gap-2 mt-2 sm:mt-0">
                {task.status !== "Completed" && (
                  <button
                    onClick={() => markCompleted(task.id)}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                  >
                    Mark as Completed
                  </button>
                )}

                <input
                  type="file"
                  className="text-sm border rounded px-2 py-1"
                  title="Upload task proof (UI only)"
                  disabled={task.status === "Completed"}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmployeeTasks;
