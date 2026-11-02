import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { userLogin } from "../api/api";
import { toast } from "react-hot-toast";
import { Link as LinkIcon, Mail, Lock, ArrowRight, Eye, EyeOff, AlertCircle } from "lucide-react";
import loginImage from "../images/signup2.jpg";

const Login = ({ setToken, setRole }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState("");

  const validate = () => {
    const e = {};
    if (!formData.email.trim()) e.email = "Email address is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) e.email = "Enter a valid email address";
    if (!formData.password) e.password = "Password is required";
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      const response = await userLogin(formData);
      if (response.data?.token) {
        const userRole = response.data.user.usertype.toLowerCase().trim();
        localStorage.setItem("id", response.data.user.id);
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("usertype", userRole);
        setToken(response.data.token);
        setRole(userRole);
        toast.success("Welcome back!");
        navigate("/dashboard");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Fraunces:ital,opsz,wght@0,9..144,700;1,9..144,400&display=swap');

        *, *::before, *::after { box-sizing: border-box; }

        .lg-root {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 1fr 1fr;
          font-family: 'Outfit', sans-serif;
        }

        /* ── LEFT IMAGE PANEL ── */
        .lg-left {
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          padding: 40px;
        }
        .lg-left img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
        }
        .lg-left-veil {
          position: absolute; inset: 0;
          background: linear-gradient(180deg, rgba(5,8,20,0.65) 0%, rgba(5,8,20,0.2) 40%, rgba(5,8,20,0.5) 100%);
          z-index: 1; pointer-events: none;
        }
        .lg-logo {
          display: flex; align-items: center; gap: 10px;
          position: relative; z-index: 3; margin-top: -4px;
        }

        /* ── RIGHT FORM PANEL ── */
        .lg-right {
          background: #ffffff;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 48px 40px;
          position: relative;
        }
        .lg-right::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
          background: linear-gradient(90deg, #2563eb, #60a5fa, #2563eb);
        }

        .lg-form-wrap { width: 100%; max-width: 400px; }
        .lg-form-header { margin-bottom: 36px; }
        .lg-form-title {
          font-family: 'Fraunces', serif; font-size: 36px; font-weight: 700;
          color: #0f172a; letter-spacing: -0.03em; line-height: 1.1; margin-bottom: 8px;
        }
        .lg-form-sub { font-size: 14px; color: #94a3b8; font-weight: 400; }

        .lg-field { margin-bottom: 18px; }
        .lg-label {
          font-size: 11px; font-weight: 700; letter-spacing: 0.12em;
          text-transform: uppercase; color: #64748b; margin-bottom: 8px;
          display: flex; align-items: center; gap: 6px; transition: color 0.2s;
        }
        .lg-label.active { color: #2563eb; }
        .lg-input-wrap { position: relative; }
        .lg-input-icon {
          position: absolute; left: 16px; top: 50%; transform: translateY(-50%);
          color: #cbd5e1; transition: color 0.2s; pointer-events: none;
        }
        .lg-input-icon.active { color: #2563eb; }
        .lg-input {
          width: 100%; padding: 14px 16px 14px 44px;
          border: 2px solid #e2e8f0; border-radius: 12px;
          font: 500 15px/1 'Outfit', sans-serif; color: #0f172a;
          background: #f8fafc; outline: none; transition: all 0.2s;
          letter-spacing: -0.01em;
        }
        .lg-input:focus { border-color: #2563eb; background: #fff; box-shadow: 0 0 0 4px rgba(37,99,235,0.08); }
        .lg-input.error { border-color: #fca5a5 !important; background: #fff5f5; }
        .lg-input::placeholder { color: #a0aec0; }
        .lg-field-error {
          display: flex; align-items: center; gap: 5px;
          color: #dc2626; font-size: 12px; font-weight: 600; margin-top: 6px;
        }
        .lg-submit {
          width: 100%; padding: 15px; background: #0f172a; color: #fff;
          border: none; border-radius: 12px; font: 700 14px/1 'Outfit', sans-serif;
          letter-spacing: 0.05em; text-transform: uppercase; cursor: pointer;
          transition: all 0.25s; display: flex; align-items: center;
          justify-content: center; gap: 8px; margin-top: 8px;
        }
        .lg-submit:hover { background: #2563eb; transform: translateY(-2px); box-shadow: 0 10px 28px rgba(37,99,235,0.28); }
        .lg-submit:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
        .lg-divider { display: flex; align-items: center; gap: 12px; margin: 24px 0; }
        .lg-divider-line { flex: 1; height: 1px; background: #e2e8f0; }
        .lg-divider-text {
          font-size: 11px; color: #94a3b8; font-weight: 600;
          letter-spacing: 0.1em; text-transform: uppercase; white-space: nowrap;
        }
        .lg-signup-row { text-align: center; font-size: 14px; color: #64748b; }
        .lg-signup-link { color: #2563eb; font-weight: 700; text-decoration: none; transition: color 0.2s; }
        .lg-signup-link:hover { color: #1d4ed8; }
        .lg-spin { animation: lg-rotate 1s linear infinite; }
        @keyframes lg-rotate { to { transform: rotate(360deg); } }

        /* ── MOBILE (≤768px): stack vertically, image on top ── */
        @media (max-width: 768px) {
          .lg-root {
            grid-template-columns: 1fr;
            grid-template-rows: 260px auto;
          }

          /* Image panel becomes a top banner */
          .lg-left {
            padding: 24px 20px;
            height: 260px;
          }

          /* Form panel sits below */
          .lg-right {
            padding: 36px 24px 48px;
            justify-content: flex-start;
            border-top: none;
          }
          .lg-right::before { display: none; }

          /* Blue accent line moves to top of image instead */
          .lg-left::after {
            content: '';
            position: absolute;
            top: 0; left: 0; right: 0;
            height: 3px;
            background: linear-gradient(90deg, #2563eb, #60a5fa, #2563eb);
            z-index: 4;
          }

          .lg-form-wrap { max-width: 100%; }
          .lg-form-title { font-size: 28px; }
        }

        /* ── SMALL MOBILE (≤480px) ── */
        @media (max-width: 480px) {
          .lg-root { grid-template-rows: 220px auto; }
          .lg-left { height: 220px; padding: 20px; }
          .lg-right { padding: 28px 20px 40px; }
          .lg-form-title { font-size: 24px; }
          .lg-form-sub { font-size: 13px; }
          .lg-form-header { margin-bottom: 24px; }
          .lg-field { margin-bottom: 14px; }
          .lg-input { font-size: 14px; padding: 12px 14px 12px 42px; }
          .lg-submit { padding: 13px; font-size: 13px; }
          .lg-label { font-size: 10px; }
        }

        /* ── VERY SMALL (≤360px) ── */
        @media (max-width: 360px) {
          .lg-root { grid-template-rows: 180px auto; }
          .lg-left { height: 180px; }
          .lg-right { padding: 24px 16px 36px; }
          .lg-form-title { font-size: 22px; }
        }
      `}</style>

      <div className="lg-root">

        {/* ── LEFT: IMAGE (top on mobile) ── */}
        <div className="lg-left">
          <img src={loginImage} alt="Workspace" />
          <div className="lg-left-veil" />
          <div className="lg-logo">
            <div style={{
              background: "#4f46e5", padding: 8, borderRadius: 12,
              transform: "rotate(3deg)", boxShadow: "0 8px 20px rgba(79,70,229,0.35)",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0, alignSelf: "center",
            }}>
              <LinkIcon size={18} color="#fff" />
            </div>
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 3 }}>
              <span style={{ fontSize: 17, fontWeight: 800, color: "#fff", letterSpacing: "-0.03em", textShadow: "0 1px 8px rgba(0,0,0,0.6)", lineHeight: 1 }}>
                INTERNAL<span style={{ color: "#93c5fd" }}>LINK</span>
              </span>
              <span style={{ fontSize: 7, fontWeight: 900, letterSpacing: "0.4em", textTransform: "uppercase", color: "rgba(255,255,255,0.45)", lineHeight: 1 }}>
                Systems Architecture
              </span>
            </div>
          </div>
        </div>

        {/* ── RIGHT: FORM (bottom on mobile) ── */}
        <div className="lg-right">
          <div className="lg-form-wrap">
            <div className="lg-form-header">
              <h1 className="lg-form-title">Welcome back</h1>
              <p className="lg-form-sub">Log in to your InternalLink account</p>
            </div>

            <form onSubmit={handleSubmit} noValidate>
              {/* Email */}
              <div className="lg-field">
                <label className={`lg-label ${focused === "email" ? "active" : ""}`}>
                  <Mail size={11} /> Email Address
                </label>
                <div className="lg-input-wrap">
                  <Mail size={16} className={`lg-input-icon ${focused === "email" ? "active" : ""}`} />
                  <input
                    className={`lg-input ${errors.email ? "error" : ""}`}
                    type="email" name="email" placeholder="you@internallink.com"
                    value={formData.email} onChange={handleChange}
                    onFocus={() => setFocused("email")} onBlur={() => setFocused("")}
                  />
                </div>
                {errors.email && <p className="lg-field-error"><AlertCircle size={12} />{errors.email}</p>}
              </div>

              {/* Password */}
              <div className="lg-field">
                <label className={`lg-label ${focused === "password" ? "active" : ""}`}>
                  <Lock size={11} /> Password
                </label>
                <div className="lg-input-wrap">
                  <Lock size={16} className={`lg-input-icon ${focused === "password" ? "active" : ""}`} />
                  <input
                    className={`lg-input ${errors.password ? "error" : ""}`}
                    type={showPassword ? "text" : "password"} name="password"
                    placeholder="Your password" value={formData.password}
                    onChange={handleChange} onFocus={() => setFocused("password")} onBlur={() => setFocused("")}
                    style={{ paddingRight: "44px" }}
                  />
                  <button
                    type="button" onClick={() => setShowPassword(!showPassword)}
                    style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: 0, display: "flex", alignItems: "center" }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <p className="lg-field-error"><AlertCircle size={12} />{errors.password}</p>}
              </div>

              <button type="submit" className="lg-submit" disabled={loading}>
                {loading ? (
                  <>
                    <svg className="lg-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                    </svg>
                    Signing in...
                  </>
                ) : <>Sign In <ArrowRight size={16} /></>}
              </button>
            </form>

            <p className="lg-signup-row" style={{ marginTop: 24 }}>
              Don't have an account? Contact your HR administrator.
            </p>
          </div>
        </div>

      </div>
    </>
  );
};

export default Login;