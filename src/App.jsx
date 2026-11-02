import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import HRdetails from "./pages/HRdetails";
import AddHR from "./pages/AddHR";
import { Toaster } from "react-hot-toast";
import Viewprofile from "./pages/Viewprofile";
import EmpleaveStatus from "./pages/EmpleaveStatus";
import Landingpage from "./pages/Landingpage";

function App() {
  const [token, setToken] = useState(null);
  const [role, setRole]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");

    if (storedToken) {
      try {
        // Decode JWT payload and check expiry
        const payload = JSON.parse(atob(storedToken.split(".")[1]));
        if (payload.exp * 1000 < Date.now()) {
          // Token expired — clear everything, show landing page
          localStorage.clear();
          setToken(null);
          setRole(null);
        } else {
          // Token valid — proceed to dashboard
          setToken(storedToken);
          setRole(localStorage.getItem("usertype"));
        }
      } catch {
        // Corrupt token — clear and show landing page
        localStorage.clear();
        setToken(null);
        setRole(null);
      }
    }

    setLoading(false);
  }, []);

  if (loading) return null;

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <Routes>

        <Route
          path="/"
          element={token ? <Navigate to="/dashboard" /> : <Landingpage />}
        />

        <Route
          path="/login"
          element={token ? <Navigate to="/dashboard" /> : <Login setToken={setToken} setRole={setRole} />}
        />

        <Route path="/signup"      element={<Navigate to="/login" replace />} />
        <Route path="/usersignup"  element={<Navigate to="/login" replace />} />
        <Route
          path="/dashboard/*"
          element={token ? <Dashboard role={role} /> : <Navigate to="/" />}
        />

        <Route path="/hr"          element={token ? <HRdetails />  : <Navigate to="/login" />} />
        <Route path="/add-hr"      element={token ? <AddHR />      : <Navigate to="/login" />} />
        <Route path="/profile/:id" element={token ? <Viewprofile /> : <Navigate to="/login" />} />

        <Route path="*" element={<Navigate to="/" />} />

      </Routes>
    </>
  );
}

export default App;