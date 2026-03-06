import React, { useState } from "react";
import { Link } from "react-router-dom";
import signupImage from "../images/signup.jpg";
import { userRegister } from "../api/api";

const Hrsignup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    rememberMe: false,
  });

  const [error, setError] = useState("");


  const dataWithUserType = {
    ...formData,
    usertype:"hr",
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async(e) => {
    e.preventDefault();

    console.log(dataWithUserType);

    try{

        const response =await userRegister(dataWithUserType);
        console.log("hr added",response.data);

        
    }
    catch (e) {
      setError(e.response?.data?.message || "Something went wrong");
    }

    
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 relative">
      
      <div className="absolute top-6 left-6 z-20">
        <h1 className="text-2xl font-bold text-gray-800">ABC COMPANY</h1>
      </div>

      <div className="hidden md:block">
        <img
          src={signupImage}
          alt="HR Management"
          className="w-full h-screen object-cover"
        />
      </div>

      {/* ===== RIGHT FORM ===== */}
      <div className="flex items-center justify-center bg-slate-50 px-6">
        <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-10">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Sign Up</h2>
          <p className="text-gray-500 mb-8">Create your account to access the HR system</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-5 py-3 rounded-xl border border-gray-300
                         focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
              required
            />

            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-5 py-3 rounded-xl border border-gray-300
                         focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
              required
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-5 py-3 rounded-xl border border-gray-300
                         focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
              required
            />

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                className="accent-blue-600"
              />
              <label className="text-sm text-gray-700">Remember me</label>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold
                         hover:bg-blue-700 transition shadow-md text-lg"
            >
              Sign Up
            </button>
          </form>

          {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
          )}


          {/* Divider */}
          <div className="flex items-center my-6">
            <div className=" h-px bg-gray-200" />
            <span className="mx-3 text-xs text-gray-400 uppercase">Or continue with</span>
            <div className=" h-px bg-gray-200" />
          </div>

          {/* Social Buttons */}
          <div className="grid grid-cols-3 gap-3">
            <button className="border py-2 rounded-xl text-sm hover:bg-gray-50 transition shadow-sm">
              Google
            </button>
            <button className="border py-2 rounded-xl text-sm hover:bg-gray-50 transition shadow-sm">
              LinkedIn
            </button>
            <button className="border py-2 rounded-xl text-sm hover:bg-gray-50 transition shadow-sm">
              SSO
            </button>
          </div>

          <p className="mt-6 text-sm text-center text-gray-600">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-600 font-semibold hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Hrsignup;
