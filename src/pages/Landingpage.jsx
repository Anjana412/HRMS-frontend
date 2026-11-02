import React, { useEffect, useState } from "react";
import { Link as LinkIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./Landingpage.css";

const Landingpage = () => {
  const navigate = useNavigate();
  const [visible, setVisible] = useState({});
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menu on scroll
  useEffect(() => {
    if (scrolled) setMenuOpen(false);
  }, [scrolled]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) setVisible((v) => ({ ...v, [e.target.id]: true }));
      }),
      { threshold: 0.1 }
    );
    document.querySelectorAll("[data-animate]").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Prevent body scroll when menu open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const handleNavLink = (href) => {
    setMenuOpen(false);
    setTimeout(() => {
      document.getElementById(href)?.scrollIntoView({ behavior: "smooth" });
    }, 200);
  };

  const features = [
    { icon: "◈", title: "Smart Attendance", desc: "Real-time check-in/out tracking with automated reports, export to PDF, and full attendance history per employee." },
    { icon: "◇", title: "Task Intelligence", desc: "Assign, track, and close tasks with priority levels, proof uploads, and HR feedback — all in one place." },
    { icon: "○", title: "Leave Management", desc: "Employees apply for leave in seconds. HR approves or rejects instantly. Everyone stays informed automatically." },
    { icon: "△", title: "Live Notifications", desc: "Every action triggers a real-time alert — task assigned, leave approved, proof uploaded. Nothing slips through." },
    { icon: "□", title: "Role-Based Access", desc: "Admin, HR, and Employee views — each role sees exactly what they need, nothing more, nothing less." },
    { icon: "◎", title: "Team Directory", desc: "Full employee profiles with departments, contact info, and exportable records for HR documentation." },
  ];

  const steps = [
    { num: "01", title: "Admin sets up", desc: "Register your HR team and employees. Assign departments and roles in minutes." },
    { num: "02", title: "HR operates", desc: "Assign tasks, review attendance, manage leaves, and track team performance." },
    { num: "03", title: "Employees execute", desc: "Clock in, complete tasks, upload proof, and request leave — all from one dashboard." },
    { num: "04", title: "Everyone aligned", desc: "Notifications keep every stakeholder updated without a single manual message." },
  ];

  const testimonials = [
    { name: "Arjun Mehta", role: "Operations Director", company: "NovaTech", quote: "InternalLink replaced three separate tools. Our HR team saves 6 hours a week on admin alone." },
    { name: "Priya Nair", role: "HR Manager", company: "Axiom Group", quote: "The task proof system changed everything. No more chasing employees for updates." },
    { name: "Rohan Verma", role: "CEO", company: "Steadfast Co.", quote: "I can see the entire workforce at a glance. It's the command center we always needed." },
  ];

  const v = (id) => visible[id] ? "in" : "";

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: "#fff", color: "#0f172a", overflowX: "hidden" }}>

      {/* ── NAVBAR ── */}
      <nav className={`lp-nav ${scrolled ? "scrolled" : ""}`}>
        <div className="lp-nav-in">

          {/* Logo */}
          <div className="lp-logo" style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              background: "#4f46e5",
              padding: 8,
              borderRadius: 12,
              transform: "rotate(3deg)",
              boxShadow: "0 8px 20px rgba(79,70,229,0.35)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              marginTop:-9,
              alignSelf: "center",
            }}>
              <LinkIcon size={18} color="#fff" />
            </div>
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 3 }}>
              <span className="lp-logo-text" style={{ lineHeight: 1 }}>INTERNAL<span>LINK</span></span>
              <span style={{
                fontSize: 7,
                fontWeight: 900,
                letterSpacing: "0.4em",
                textTransform: "uppercase",
                color: "#94a3b8",
                lineHeight: 1,
              }}>Systems Architecture</span>
            </div>
          </div>

          {/* Desktop links */}
          <div className="lp-nav-links">
            {["Features", "How It Works", "Testimonials"].map((item) => (
              <a key={item} className="lp-nav-lnk"
                href={`#${item.toLowerCase().replace(/ /g, "-")}`}>{item}</a>
            ))}
          </div>

          {/* Desktop buttons */}
          <div className="lp-nav-btns">
            <button className="lp-btn-border" onClick={() => navigate("/login")}>Log In</button>
          </div>

          {/* Mobile right side: Get Started + Hamburger */}
          <div className="lp-nav-mobile-right">
            
            <button
              className={`lp-hamburger ${menuOpen ? "open" : ""}`}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile drawer — outside nav so it's not clipped by sticky */}
      <div className={`lp-mobile-menu ${menuOpen ? "open" : ""}`}>
        <div className="lp-mobile-links">
          {["features", "how-it-works", "testimonials"].map((id, i) => (
            <a key={id} className="lp-mobile-lnk"
              href={`#${id}`}
              onClick={() => setMenuOpen(false)}>
              {["Features", "How It Works", "Testimonials"][i]}
            </a>
          ))}
        </div>
        <div className="lp-mobile-btns">
          
          <button className="lp-mobile-btn-border" onClick={() => { setMenuOpen(false); navigate("/login"); }}>
            Log In
          </button>
        </div>
      </div>

      {/* ── HERO ── */}
      <section className="lp-hero">
        <div className="lp-hero-orb1" />
        <div className="lp-hero-orb2" />
        <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1 }}>
          <div className="fade-up in" style={{ display: "flex", justifyContent: "center" }}>
            <div className="lp-hero-badge">
              <div className="lp-badge-dot">◈</div>
              Now in Production
            </div>
          </div>
          <h1 className="lp-hero-h fade-up in d1">
            The operating<br />system for your <em>people</em>
          </h1>
          <p className="lp-hero-p fade-up in d2">
            InternalLink unifies attendance, tasks, and leave management into a single command center — built for teams that move fast.
          </p>
          <div className="lp-hero-cta fade-up in d3">
            <button className="lp-btn-dark-lg" onClick={() => navigate("/login")}>Log In →</button>
          </div>
          <div className="lp-stat-row fade-up in d4">
            {[["3×", "Faster HR ops"], ["100%", "Role-based access"], ["0", "Manual follow-ups"]].map(([val, lbl], i) => (
              <div className="lp-stat-cell" key={i}>
                <div className="lp-stat-v">{val}</div>
                <div className="lp-stat-l">{lbl}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={{ padding: "110px 0", background: "#fff" }}>
        <div className="lp-wrap">
          <div data-animate id="fh" className={`fade-up ${v("fh")}`}>
            <div className="lp-feat-header">
              <div>
                <div className="lp-eyebrow">What's Inside</div>
                <h2 className="lp-sec-h">Everything your HR team<br /><em>actually</em> needs</h2>
              </div>
              <p className="lp-feat-sub">
                Six purpose-built modules working in harmony — from the moment an employee clocks in to the moment a task gets signed off.
              </p>
            </div>
          </div>
          <div className="lp-bento">
            {features.map((f, i) => (
              <div key={i} data-animate id={`fc${i}`}
                className={`lp-bento-card ${i === 0 || i === 3 ? "wide" : ""} fade-up ${v(`fc${i}`)} d${(i % 3) + 1}`}>
                {i === 0 || i === 3 ? (
                  <div className="lp-bc-inner">
                    <div className="lp-bc-text">
                      <span className="lp-bc-badge">Core Feature</span>
                      <div className="lp-bc-icon">{f.icon}</div>
                      <div className="lp-bc-title">{f.title}</div>
                      <div className="lp-bc-desc">{f.desc}</div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="lp-bc-num">0{i + 1}</div>
                    <div className="lp-bc-icon">{f.icon}</div>
                    <div className="lp-bc-title">{f.title}</div>
                    <div className="lp-bc-desc">{f.desc}</div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="lp-steps-section">
        <div className="lp-steps-inner">
          <div data-animate id="sh" className={`fade-up ${v("sh")}`}>
            <div className="lp-steps-eyebrow">The Flow</div>
            <h2 className="lp-steps-h">Up and running<br />in <em>four steps</em></h2>
          </div>
          <div className="lp-steps-grid">
            {steps.map((s, i) => (
              <div key={i} data-animate id={`sc${i}`} className={`lp-step fade-up ${v(`sc${i}`)} d${i + 1}`}>
                <div className="lp-step-circle">{s.num}</div>
                <div className="lp-step-num-label">Step {s.num}</div>
                <div className="lp-step-title">{s.title}</div>
                <div className="lp-step-desc">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section id="testimonials" style={{ padding: "110px 0", background: "#fff" }}>
        <div className="lp-wrap">
          <div data-animate id="th" className={`fade-up ${v("th")}`} style={{ textAlign: "center" }}>
            <div className="lp-eyebrow">Trusted By Teams</div>
            <h2 className="lp-sec-h">What operators say</h2>
          </div>
          <div className="lp-testi-grid">
            {testimonials.map((t, i) => (
              <div key={i} data-animate id={`tc${i}`} className={`lp-testi-card fade-up ${v(`tc${i}`)} d${i + 1}`}>
                <div style={{ display: "flex", gap: 3, marginBottom: 20 }}>
                  {[...Array(5)].map((_, si) => <span key={si} style={{ color: "#f59e0b", fontSize: 14 }}>★</span>)}
                </div>
                <p className="lp-t-quote">"{t.quote}"</p>
                <div className="lp-t-author">
                  <div className="lp-t-avatar">{t.name[0]}</div>
                  <div>
                    <div className="lp-t-name">{t.name}</div>
                    <div className="lp-t-role">{t.role} · {t.company}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: "80px 0 110px", background: "#fff" }}>
        <div className="lp-wrap">
          <div data-animate id="ca" className={`lp-cta-box fade-up ${v("ca")}`}>
            <h2 className="lp-cta-h">Your team deserves<br />better <em>infrastructure</em></h2>
            <p className="lp-cta-p">Join the teams that run their workforce on InternalLink. Set up takes minutes.</p>
            <div className="lp-cta-btns">
              <button className="lp-btn-blue" onClick={() => navigate("/login")}>Log In →</button>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="lp-footer">
        <div className="lp-footer-in">
          <div className="lp-f-logo" style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <div style={{
              background: "#4f46e5",
              padding: 6,
              borderRadius: 10,
              transform: "rotate(3deg)",
              boxShadow: "0 4px 12px rgba(79,70,229,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              alignSelf: "center",
            }}>
              <LinkIcon size={13} color="#fff" />
            </div>
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 3 }}>
              <span className="lp-f-logo-text" style={{ lineHeight: 1 }}>INTERNAL<span>LINK</span></span>
              <span style={{
                fontSize: 6,
                fontWeight: 900,
                letterSpacing: "0.4em",
                textTransform: "uppercase",
                color: "#94a3b8",
                lineHeight: 1,
              }}>Systems Architecture</span>
            </div>
          </div>
          <p className="lp-f-copy">© 2026 InternalLink. Built for modern teams.</p>
          <div className="lp-f-links">
            {["Features", "How It Works", "Testimonials"].map(item => (
              <a key={item} className="lp-f-lnk" href={`#${item.toLowerCase().replace(/ /g, "-")}`}>{item}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landingpage;