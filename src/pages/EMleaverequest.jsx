import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const EMLeaveRequest = () => {
  const navigate = useNavigate();
  const [leave, setLeave] = useState({
    from: "",
    to: "",
    reason: "",
  });

  const submitLeave = () => {
    if (!leave.from || !leave.to || !leave.reason) return;
    alert(`Leave requested from ${leave.from} to ${leave.to} for "${leave.reason}"`);
    setLeave({ from: "", to: "", reason: "" });
    navigate("/dashboard/employee"); 
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-2xl font-semibold mb-6">Request Leave</h1>

      <div className="bg-white p-6 rounded-xl shadow max-w-md mx-auto space-y-4">
        <div className="flex flex-col">
          <label className="mb-1 font-medium">From</label>
          <input
            type="date"
            className="border px-3 py-2 rounded"
            value={leave.from}
            onChange={(e) => setLeave({ ...leave, from: e.target.value })}
          />
        </div>

        <div className="flex flex-col">
          <label className="mb-1 font-medium">To</label>
          <input
            type="date"
            className="border px-3 py-2 rounded"
            value={leave.to}
            onChange={(e) => setLeave({ ...leave, to: e.target.value })}
          />
        </div>

        <div className="flex flex-col">
          <label className="mb-1 font-medium">Reason</label>
          <input
            type="text"
            placeholder="Reason for leave"
            className="border px-3 py-2 rounded"
            value={leave.reason}
            onChange={(e) => setLeave({ ...leave, reason: e.target.value })}
          />
        </div>

        <button
          onClick={submitLeave}
          className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 w-full"
        >
          Submit Leave
        </button>
      </div>
    </div>
  );
};

export default EMLeaveRequest;
