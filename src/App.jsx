import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Usersignup from "./pages/Usersignup";
import HRdetails from "./pages/HRdetails";
import AddHR from "./pages/AddHR";
import { Toaster } from "react-hot-toast";
import Viewprofile from "./pages/Viewprofile";
import EmpleaveStatus from "./pages/EmpleaveStatus";
import Landingpage from "./pages/Landingpage";

function App() {
  const [token, setToken] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true); // ← wait before rendering routes

  useEffect(() => {
    setToken(localStorage.getItem("token"));
    setRole(localStorage.getItem("usertype"));
    setLoading(false); // ← done reading localStorage
  }, []);

  // Don't render routes until we've checked localStorage
  if (loading) return null;

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <Routes>

        {/* "/" — logged in → dashboard, not logged in → landing page */}
        <Route
          path="/"
          element={token ? <Navigate to="/dashboard" /> : <Landingpage />}
        />

        {/* Login — logged in → dashboard, not logged in → show login */}
        <Route
          path="/login"
          element={token ? <Navigate to="/dashboard" /> : <Login setToken={setToken} setRole={setRole} />}
        />

        <Route path="/signup" element={<Signup />} />
        <Route path="/usersignup" element={<Usersignup />} />

        {/* Dashboard — protected */}
        <Route
          path="/dashboard/*"
          element={token ? <Dashboard role={role} /> : <Navigate to="/" />}
        />

        <Route path="/hr" element={<HRdetails />} />
        <Route path="/add-hr" element={<AddHR />} />
        <Route path="/profile/:id" element={<Viewprofile />} />

        <Route path="*" element={<Navigate to="/" />} />

      </Routes>
    </>
  );
}

export default App;