import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const Landingpage = () => {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);
  const [visible, setVisible] = useState({});
  const observerRefs = useRef({});

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setVisible((v) => ({ ...v, [e.target.id]: true }));
        });
      },
      { threshold: 0.15 }
    );
    document.querySelectorAll("[data-animate]").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const features = [
    {
      icon: "◈",
      title: "Smart Attendance",
      desc: "Real-time check-in/out tracking with automated reports, export to PDF, and full attendance history per employee.",
    },
    {
      icon: "◇",
      title: "Task Intelligence",
      desc: "Assign, track, and close tasks with priority levels, proof uploads, and HR feedback — all in one place.",
    },
    {
      icon: "○",
      title: "Leave Management",
      desc: "Employees apply for leave in seconds. HR approves or rejects instantly. Everyone stays informed automatically.",
    },
    {
      icon: "△",
      title: "Live Notifications",
      desc: "Every action triggers a real-time alert — task assigned, leave approved, proof uploaded. Nothing slips through.",
    },
    {
      icon: "□",
      title: "Role-Based Access",
      desc: "Admin, HR, and Employee views — each role sees exactly what they need, nothing more, nothing less.",
    },
    {
      icon: "◎",
      title: "Team Directory",
      desc: "Full employee profiles with departments, contact info, and exportable records for HR documentation.",
    },
  ];

  const steps = [
    { num: "01", title: "Admin sets up", desc: "Register your HR team and employees. Assign departments and roles in minutes." },
    { num: "02", title: "HR operates", desc: "Assign tasks, review attendance, manage leaves, and track team performance." },
    { num: "03", title: "Employees execute", desc: "Clock in, complete tasks, upload proof, and request leave — all from one dashboard." },
    { num: "04", title: "Everyone stays aligned", desc: "Notifications keep every stakeholder updated without a single manual message." },
  ];

  const testimonials = [
    { name: "Arjun Mehta", role: "Operations Director", company: "NovaTech", quote: "InternalLink replaced three separate tools. Our HR team saves 6 hours a week on admin alone." },
    { name: "Priya Nair", role: "HR Manager", company: "Axiom Group", quote: "The task proof system changed everything. No more chasing employees for updates." },
    { name: "Rohan Verma", role: "CEO", company: "Steadfast Co.", quote: "I can see the entire workforce at a glance. It's the command center we always needed." },
  ];

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: "#080C14", color: "#E8EDF5", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,700;0,9..40,900;1,9..40,300&family=Instrument+Serif:ital@0;1&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .hero-glow {
          position: absolute;
          width: 800px; height: 800px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%);
          top: -200px; left: 50%; transform: translateX(-50%);
          pointer-events: none;
        }
        .grid-bg {
          position: absolute; inset: 0;
          background-image: 
            linear-gradient(rgba(99,102,241,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99,102,241,0.04) 1px, transparent 1px);
          background-size: 60px 60px;
          mask-image: radial-gradient(ellipse 80% 60% at 50% 0%, black 0%, transparent 100%);
        }
        .fade-up {
          opacity: 0;
          transform: translateY(40px);
          transition: opacity 0.8s cubic-bezier(0.16,1,0.3,1), transform 0.8s cubic-bezier(0.16,1,0.3,1);
        }
        .fade-up.visible {
          opacity: 1;
          transform: translateY(0);
        }
        .fade-up.delay-1 { transition-delay: 0.1s; }
        .fade-up.delay-2 { transition-delay: 0.2s; }
        .fade-up.delay-3 { transition-delay: 0.3s; }
        .fade-up.delay-4 { transition-delay: 0.4s; }
        .fade-up.delay-5 { transition-delay: 0.5s; }

        .nav-blur {
          backdrop-filter: blur(20px);
          background: rgba(8,12,20,0.8);
          border-bottom: 1px solid rgba(255,255,255,0.04);
        }
        .btn-primary {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white;
          border: none;
          padding: 14px 32px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        .btn-primary::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, #818cf8, #a78bfa);
          opacity: 0;
          transition: opacity 0.3s;
        }
        .btn-primary:hover::before { opacity: 1; }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 20px 40px rgba(99,102,241,0.3); }
        .btn-primary span { position: relative; z-index: 1; }

        .btn-ghost {
          background: transparent;
          color: #94a3b8;
          border: 1px solid rgba(255,255,255,0.1);
          padding: 14px 32px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .btn-ghost:hover {
          border-color: rgba(99,102,241,0.5);
          color: #e8edf5;
          background: rgba(99,102,241,0.08);
        }

        .feature-card {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 24px;
          padding: 36px;
          transition: all 0.4s cubic-bezier(0.16,1,0.3,1);
          position: relative;
          overflow: hidden;
        }
        .feature-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 0% 0%, rgba(99,102,241,0.08), transparent 60%);
          opacity: 0;
          transition: opacity 0.4s;
        }
        .feature-card:hover { 
          border-color: rgba(99,102,241,0.3);
          transform: translateY(-4px);
          background: rgba(99,102,241,0.04);
        }
        .feature-card:hover::before { opacity: 1; }

        .step-line {
          position: absolute;
          top: 28px;
          left: calc(50% + 28px);
          width: calc(100% - 56px);
          height: 1px;
          background: linear-gradient(90deg, rgba(99,102,241,0.4), rgba(99,102,241,0.05));
        }

        .testimonial-card {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 24px;
          padding: 40px;
          transition: all 0.4s ease;
        }
        .testimonial-card:hover {
          border-color: rgba(99,102,241,0.2);
          background: rgba(99,102,241,0.03);
        }

        .badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(99,102,241,0.1);
          border: 1px solid rgba(99,102,241,0.2);
          color: #a5b4fc;
          padding: 6px 16px;
          border-radius: 100px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }
        .badge-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #6366f1;
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }

        .hero-title {
          font-family: 'Instrument Serif', serif;
          font-size: clamp(52px, 8vw, 96px);
          line-height: 1.0;
          letter-spacing: -0.02em;
          color: #f1f5f9;
        }
        .hero-title em {
          font-style: italic;
          background: linear-gradient(135deg, #818cf8, #c4b5fd);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .section-label {
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #6366f1;
        }

        .stat-number {
          font-family: 'Instrument Serif', serif;
          font-size: 56px;
          line-height: 1;
          background: linear-gradient(135deg, #f1f5f9, #94a3b8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .divider {
          width: 1px;
          height: 60px;
          background: rgba(255,255,255,0.08);
        }

        .cta-glow {
          position: absolute;
          width: 600px; height: 400px;
          background: radial-gradient(ellipse, rgba(99,102,241,0.12) 0%, transparent 70%);
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          pointer-events: none;
        }
      `}</style>

      {/* ── NAV ─────────────────────────────────────────────────────────────── */}
      <nav className="nav-blur" style={{ position: "sticky", top: 0, zIndex: 100, padding: "0 48px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 72 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>◈</div>
            <span style={{ fontWeight: 900, fontSize: 18, letterSpacing: "-0.02em", color: "#f1f5f9" }}>INTERNAL<span style={{ color: "#818cf8" }}>LINK</span></span>
          </div>
          <div style={{ display: "flex", gap: 40 }}>
            {["Features", "How It Works", "Testimonials"].map((item) => (
              <a key={item} href={`#${item.toLowerCase().replace(/ /g, "-")}`}
                style={{ color: "#64748b", fontSize: 14, fontWeight: 500, textDecoration: "none", transition: "color 0.2s" }}
                onMouseEnter={e => e.target.style.color = "#e2e8f0"}
                onMouseLeave={e => e.target.style.color = "#64748b"}
              >{item}</a>
            ))}
          </div>
          <button className="btn-primary" onClick={() => navigate("/login")} style={{ padding: "10px 24px" }}>
            <span>Sign In →</span>
          </button>
        </div>
      </nav>

      {/* ── HERO ────────────────────────────────────────────────────────────── */}
      <section style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "120px 48px 80px" }}>
        <div className="hero-glow" />
        <div className="grid-bg" />

        <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1 }}>
          <div className="fade-up visible" style={{ marginBottom: 32 }}>
            <span className="badge"><span className="badge-dot" />Now in Production</span>
          </div>

          <h1 className="hero-title fade-up visible delay-1" style={{ marginBottom: 32 }}>
            The operating<br />system for your <em>people</em>
          </h1>

          <p className="fade-up visible delay-2" style={{ fontSize: 20, color: "#64748b", lineHeight: 1.7, maxWidth: 560, margin: "0 auto 48px", fontWeight: 400 }}>
            InternalLink unifies attendance, tasks, and leave management into a single command center — built for teams that move fast.
          </p>

          <div className="fade-up visible delay-3" style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <button className="btn-primary" onClick={() => navigate("/login")}>
              <span>Get Started Free</span>
            </button>
            <button className="btn-ghost" onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}>
              See Features
            </button>
          </div>

          {/* Stats row */}
          <div className="fade-up visible delay-4" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 48, marginTop: 80, flexWrap: "wrap" }}>
            {[["3x", "Faster HR ops"], ["100%", "Role-based access"], ["0", "Manual follow-ups"]].map(([num, label], i) => (
              <React.Fragment key={i}>
                {i > 0 && <div className="divider" />}
                <div style={{ textAlign: "center" }}>
                  <div className="stat-number">{num}</div>
                  <div style={{ fontSize: 12, color: "#475569", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 8 }}>{label}</div>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ────────────────────────────────────────────────────────── */}
      <section id="features" style={{ padding: "120px 48px", maxWidth: 1200, margin: "0 auto" }}>
        <div data-animate id="feat-header" className={`fade-up ${visible["feat-header"] ? "visible" : ""}`} style={{ textAlign: "center", marginBottom: 64 }}>
          <div className="section-label" style={{ marginBottom: 16 }}>What's Inside</div>
          <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: "clamp(36px, 5vw, 56px)", lineHeight: 1.1, color: "#f1f5f9", letterSpacing: "-0.02em" }}>
            Everything your HR team<br />actually needs
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20 }}>
          {features.map((f, i) => (
            <div
              key={i}
              data-animate
              id={`feat-${i}`}
              className={`feature-card fade-up ${visible[`feat-${i}`] ? "visible" : ""} delay-${i % 3 + 1}`}
            >
              <div style={{ fontSize: 28, marginBottom: 20, color: "#6366f1" }}>{f.icon}</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: "#f1f5f9", marginBottom: 12, letterSpacing: "-0.01em" }}>{f.title}</h3>
              <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.7, fontWeight: 400 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────────────────────── */}
      <section id="how-it-works" style={{ padding: "120px 48px", background: "rgba(99,102,241,0.02)", borderTop: "1px solid rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div data-animate id="how-header" className={`fade-up ${visible["how-header"] ? "visible" : ""}`} style={{ textAlign: "center", marginBottom: 80 }}>
            <div className="section-label" style={{ marginBottom: 16 }}>The Flow</div>
            <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: "clamp(36px, 5vw, 56px)", lineHeight: 1.1, color: "#f1f5f9", letterSpacing: "-0.02em" }}>
              Up and running<br />in four steps
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 0, position: "relative" }}>
            {steps.map((s, i) => (
              <div
                key={i}
                data-animate
                id={`step-${i}`}
                className={`fade-up ${visible[`step-${i}`] ? "visible" : ""} delay-${i + 1}`}
                style={{ padding: "0 32px", position: "relative", textAlign: "center" }}
              >
                {i < steps.length - 1 && (
                  <div style={{ position: "absolute", top: 28, left: "calc(50% + 28px)", width: "calc(100% - 56px)", height: 1, background: "linear-gradient(90deg, rgba(99,102,241,0.4), rgba(99,102,241,0.05))" }} />
                )}
                <div style={{
                  width: 56, height: 56, borderRadius: "50%",
                  border: "1px solid rgba(99,102,241,0.3)",
                  background: "rgba(99,102,241,0.08)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 24px",
                  fontFamily: "'Instrument Serif', serif",
                  fontSize: 20, color: "#818cf8"
                }}>{s.num}</div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#f1f5f9", marginBottom: 12 }}>{s.title}</h3>
                <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.7 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ────────────────────────────────────────────────────── */}
      <section id="testimonials" style={{ padding: "120px 48px", maxWidth: 1200, margin: "0 auto" }}>
        <div data-animate id="test-header" className={`fade-up ${visible["test-header"] ? "visible" : ""}`} style={{ textAlign: "center", marginBottom: 64 }}>
          <div className="section-label" style={{ marginBottom: 16 }}>Trusted By Teams</div>
          <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: "clamp(36px, 5vw, 56px)", lineHeight: 1.1, color: "#f1f5f9", letterSpacing: "-0.02em" }}>
            What operators say
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
          {testimonials.map((t, i) => (
            <div
              key={i}
              data-animate
              id={`test-${i}`}
              className={`testimonial-card fade-up ${visible[`test-${i}`] ? "visible" : ""} delay-${i + 1}`}
            >
              <div style={{ fontSize: 40, color: "#1e293b", marginBottom: 24, fontFamily: "serif", lineHeight: 1 }}>"</div>
              <p style={{ fontSize: 16, color: "#94a3b8", lineHeight: 1.8, fontStyle: "italic", marginBottom: 32, fontWeight: 300 }}>
                "{t.quote}"
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: "50%",
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 16, fontWeight: 700, color: "white"
                }}>{t.name[0]}</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#f1f5f9" }}>{t.name}</div>
                  <div style={{ fontSize: 12, color: "#475569" }}>{t.role} · {t.company}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────────────── */}
      <section style={{ padding: "80px 48px 120px" }}>
        <div
          data-animate id="cta"
          className={`fade-up ${visible["cta"] ? "visible" : ""}`}
          style={{
            maxWidth: 900, margin: "0 auto",
            background: "rgba(99,102,241,0.05)",
            border: "1px solid rgba(99,102,241,0.15)",
            borderRadius: 32,
            padding: "80px 48px",
            textAlign: "center",
            position: "relative",
            overflow: "hidden"
          }}
        >
          <div className="cta-glow" />
          <div className="section-label" style={{ marginBottom: 24, position: "relative" }}>Ready to Begin</div>
          <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: "clamp(36px, 5vw, 64px)", lineHeight: 1.05, color: "#f1f5f9", letterSpacing: "-0.02em", marginBottom: 24, position: "relative" }}>
            Your team deserves<br />better <em style={{ fontStyle: "italic", background: "linear-gradient(135deg,#818cf8,#c4b5fd)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>infrastructure</em>
          </h2>
          <p style={{ fontSize: 16, color: "#475569", marginBottom: 48, maxWidth: 480, margin: "0 auto 48px", lineHeight: 1.7, position: "relative" }}>
            Join the teams that run their workforce on InternalLink. Set up takes minutes.
          </p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap", position: "relative" }}>
            <button className="btn-primary" onClick={() => navigate("/login")} style={{ padding: "16px 40px", fontSize: 15 }}>
              <span>Access Dashboard →</span>
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────────────── */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.04)", padding: "40px 48px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 28, height: 28, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>◈</div>
          <span style={{ fontWeight: 900, fontSize: 15, color: "#334155" }}>INTERNAL<span style={{ color: "#4f46e5" }}>LINK</span></span>
        </div>
        <p style={{ fontSize: 12, color: "#334155" }}>© 2026 InternalLink. Built for modern teams.</p>
      </footer>
    </div>
  );
};

export default Landingpage;