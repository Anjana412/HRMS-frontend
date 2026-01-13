import React, { useState } from "react";

const AddEmployee = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    department: "",
    phone: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("New Employee Data:", formData);
    alert("Employee added (UI only)");
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow">
      <h2 className="text-2xl font-semibold mb-6">Add Employee</h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-5">
        <Input label="Full Name" name="name" value={formData.name} onChange={handleChange} />
        <Input label="Email" name="email" type="email" value={formData.email} onChange={handleChange} />
        <Input label="Phone" name="phone" value={formData.phone} onChange={handleChange} />

        <div>
          <label className="text-sm text-gray-600">Role</label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full mt-1 p-3 border rounded-lg"
          >
            <option value="">Select role</option>
            <option value="Employee">Employee</option>
            <option value="HR">HR</option>
          </select>
        </div>

        <Input label="Department" name="department" value={formData.department} onChange={handleChange} />

        <button className="bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700">
          Add Employee
        </button>
      </form>
    </div>
  );
};

const Input = ({ label, ...props }) => (
  <div>
    <label className="text-sm text-gray-600">{label}</label>
    <input {...props} className="w-full mt-1 p-3 border rounded-lg" />
  </div>
);

export default AddEmployee;
