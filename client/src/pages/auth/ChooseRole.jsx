import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function ChooseRole() {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [hoverClient, setHoverClient] = useState(false);
  const [hoverFreelancer, setHoverFreelancer] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => { setTimeout(() => setVisible(true), 100); }, []);

  // ── Handle GitHub OAuth errors redirected back to homepage ──
  useEffect(() => {
    const params       = new URLSearchParams(window.location.search);
    const errorParam   = params.get("error");
    const existingRole = params.get("existing_role");
    if (errorParam === "role_mismatch") {
      setErrorMsg(`This email is already registered as a ${existingRole}. Please use ${existingRole} login.`);
    }
    if (errorParam === "github_auth_failed") {
      setErrorMsg("GitHub login failed. Please try again.");
    }
  }, []);

  const fadeIn       = { opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(30px)", transition: "opacity 0.7s ease, transform 0.7s ease" };
  const fadeInDelay1 = { opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(30px)", transition: "opacity 0.7s ease 0.2s, transform 0.7s ease 0.2s" };
  const fadeInDelay2 = { opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(40px)", transition: "opacity 0.7s ease 0.4s, transform 0.7s ease 0.4s" };
  const fadeInDelay3 = { opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(40px)", transition: "opacity 0.7s ease 0.6s, transform 0.7s ease 0.6s" };

  const cardStyle = (hovered) => ({
    backgroundColor: "rgba(255,255,255,0.95)",
    backdropFilter: "blur(20px)",
    borderRadius: 20,
    padding: "36px 32px",
    width: 340,
    boxShadow: hovered ? "0 24px 64px rgba(0,0,0,0.25)" : "0 8px 32px rgba(0,0,0,0.12)",
    position: "relative",
    cursor: "pointer",
    transform: hovered ? "translateY(-10px)" : "translateY(0)",
    transition: "all 0.3s ease",
    border: "1px solid rgba(255,255,255,0.6)",
  });

  const list        = { listStyle: "none", padding: 0, margin: "0 0 28px", display: "flex", flexDirection: "column", gap: 10 };
  const item        = { display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: "#374151" };
  const btnBlue     = { width: "100%", padding: 14, background: "linear-gradient(135deg,#1e3a5f,#2563eb,#3b82f6)", color: "white", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 15, cursor: "pointer", transition: "all 0.2s ease", boxShadow: "0 4px 15px rgba(37,99,235,0.5)" };
  const btnPurple   = { width: "100%", padding: 14, background: "linear-gradient(135deg,#4c1d95,#7c3aed,#a855f7)", color: "white", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 15, cursor: "pointer", transition: "all 0.2s ease", boxShadow: "0 4px 15px rgba(124,58,237,0.5)" };
  const badgeBlue   = { position: "absolute", top: 20, right: 20, backgroundColor: "#eff6ff", color: "#2563eb", fontSize: 12, fontWeight: 600, padding: "4px 12px", borderRadius: 20 };
  const badgePurple = { position: "absolute", top: 20, right: 20, backgroundColor: "#f5f3ff", color: "#7c3aed", fontSize: 12, fontWeight: 600, padding: "4px 12px", borderRadius: 20 };
  const iconBlue    = { width: 52, height: 52, borderRadius: "50%", background: "linear-gradient(135deg,#eff6ff,#dbeafe)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, marginBottom: 20 };
  const iconPurple  = { width: 52, height: 52, borderRadius: "50%", background: "linear-gradient(135deg,#f5f3ff,#ede9fe)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, marginBottom: 20 };

  const navLinkStyle = {
    display: "flex", alignItems: "center", gap: 6, padding: "7px 16px",
    borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer",
    border: "1px solid rgba(255,255,255,0.2)", transition: "all 0.2s",
    background: "rgba(255,255,255,0.08)", color: "white",
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#0a0520 0%,#0f0c29 30%,#1a0845 60%,#0d1b3e 100%)", fontFamily: "'Segoe UI',sans-serif", position: "relative", overflow: "hidden" }}>

      <style>{`
        @keyframes pulse { 0%,100%{transform:scale(1);opacity:0.8} 50%{transform:scale(1.15);opacity:1} }
        @keyframes float { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-10px)} }
        .btn-blue:hover   { transform:translateY(-2px) !important; box-shadow:0 8px 25px rgba(37,99,235,0.7) !important; }
        .btn-purple:hover { transform:translateY(-2px) !important; box-shadow:0 8px 25px rgba(124,58,237,0.7) !important; }
        .nav-link-blue:hover   { background:rgba(37,99,235,0.3) !important; border-color:rgba(37,99,235,0.6) !important; }
        .nav-link-purple:hover { background:rgba(124,58,237,0.3) !important; border-color:rgba(124,58,237,0.6) !important; }
      `}</style>

      {/* Background blobs */}
      <div style={{ position: "fixed", top: -150, left: -150, width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(37,99,235,0.6) 0%, rgba(37,99,235,0.2) 40%, transparent 70%)", pointerEvents: "none", animation: "pulse 4s ease-in-out infinite", filter: "blur(30px)", zIndex: 0 }} />
      <div style={{ position: "fixed", bottom: -150, right: -150, width: 550, height: 550, borderRadius: "50%", background: "radial-gradient(circle, rgba(124,58,237,0.6) 0%, rgba(124,58,237,0.2) 40%, transparent 70%)", pointerEvents: "none", animation: "pulse 5s ease-in-out infinite reverse", filter: "blur(30px)", zIndex: 0 }} />
      <div style={{ position: "fixed", top: 50, right: -100, width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(59,130,246,0.5) 0%, transparent 70%)", pointerEvents: "none", animation: "pulse 6s ease-in-out infinite 1s", filter: "blur(25px)", zIndex: 0 }} />
      <div style={{ position: "fixed", top: "35%", left: -80, width: 350, height: 350, borderRadius: "50%", background: "radial-gradient(circle, rgba(168,85,247,0.5) 0%, transparent 70%)", pointerEvents: "none", animation: "pulse 5s ease-in-out infinite 2s", filter: "blur(25px)", zIndex: 0 }} />
      <div style={{ position: "fixed", top: "20%", right: "20%", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.4) 0%, transparent 70%)", pointerEvents: "none", animation: "pulse 7s ease-in-out infinite 0.5s", filter: "blur(20px)", zIndex: 0 }} />
      <div style={{ position: "fixed", bottom: "20%", left: "20%", width: 280, height: 280, borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.4) 0%, transparent 70%)", pointerEvents: "none", animation: "pulse 8s ease-in-out infinite 1.5s", filter: "blur(20px)", zIndex: 0 }} />

      {/* Navbar */}
      <div style={{ position: "relative", zIndex: 10, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 40px", backgroundColor: "rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(20px)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 38, height: 38, background: "linear-gradient(135deg,#2563eb,#7c3aed)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 18, boxShadow: "0 4px 15px rgba(37,99,235,0.4)" }}>💼</div>
          <span style={{ fontWeight: 800, fontSize: 20, background: "linear-gradient(135deg,#60a5fa,#a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>TalentLink</span>
        </div>

        {/* Direct sign in links */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <button className="nav-link-blue" style={navLinkStyle} onClick={() => navigate("/client/login")}>
            💼 Client
          </button>
          <button className="nav-link-purple" style={navLinkStyle} onClick={() => navigate("/freelancer/login")}>
            👤 Freelancer
          </button>
        </div>
      </div>

      {/* Error message banner */}
      {errorMsg && (
        <div style={{ position: "relative", zIndex: 10, margin: "20px 40px 0", backgroundColor: "rgba(220,38,38,0.15)", border: "1px solid rgba(220,38,38,0.4)", borderRadius: 12, padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <span style={{ color: "#fca5a5", fontSize: 14, fontWeight: 500 }}>⚠️ {errorMsg}</span>
          <button onClick={() => setErrorMsg("")} style={{ background: "none", border: "none", color: "#fca5a5", cursor: "pointer", fontSize: 18, lineHeight: 1 }}>×</button>
        </div>
      )}

      {/* Hero */}
      <div style={{ position: "relative", zIndex: 10, textAlign: "center", padding: "64px 20px 40px" }}>
        <div style={{ ...fadeIn, display: "inline-flex", alignItems: "center", gap: 8, backgroundColor: "rgba(37,99,235,0.2)", border: "1px solid rgba(37,99,235,0.4)", color: "#93c5fd", fontSize: 13, fontWeight: 600, padding: "6px 18px", borderRadius: 20, marginBottom: 24 }}>
          🚀 Join 10,000+ professionals on TalentLink
        </div>
        <h1 style={{ ...fadeInDelay1, fontSize: 48, fontWeight: 900, marginBottom: 16, letterSpacing: "-1.5px", lineHeight: 1.1 }}>
          <span style={{ background: "linear-gradient(135deg,#60a5fa,#a78bfa,#f472b6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Connect,</span>{" "}
          <span style={{ background: "linear-gradient(135deg,#a78bfa,#f472b6,#fb7185)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Collaborate,</span>{" "}
          <span style={{ background: "linear-gradient(135deg,#f472b6,#fb7185,#60a5fa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Create</span>
        </h1>
        <p style={{ ...fadeInDelay1, fontSize: 16, color: "rgba(255,255,255,0.65)", maxWidth: 520, margin: "0 auto 52px", lineHeight: 1.8 }}>
          The premier platform connecting talented freelancers with visionary clients. Choose your path to get started.
        </p>
      </div>

      {/* Cards */}
      <div style={{ ...fadeInDelay2, position: "relative", zIndex: 10, display: "flex", justifyContent: "center", gap: 28, padding: "0 40px 60px", flexWrap: "wrap" }}>

        {/* Client Card */}
        <div style={cardStyle(hoverClient)} onMouseEnter={() => setHoverClient(true)} onMouseLeave={() => setHoverClient(false)}>
          <span style={badgeBlue}>For Businesses</span>
          <div style={{ ...iconBlue, animation: "float 3s ease-in-out infinite" }}>💼</div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: "#111827", marginBottom: 8 }}>I'm a Client</h2>
          <p style={{ fontSize: 14, color: "#6b7280", marginBottom: 20, lineHeight: 1.6 }}>Post projects and hire talented freelancers to bring your vision to life.</p>
          <ul style={list}>
            {["Post unlimited projects", "Review freelancer proposals", "Manage contracts & progress", "Secure payment tracking"].map(f => (
              <li key={f} style={item}><span>✅</span>{f}</li>
            ))}
          </ul>
          <button className="btn-blue" style={btnBlue} onClick={() => navigate("/client/login")}>Continue as Client →</button>
          <p style={{ textAlign: "center", fontSize: 12, color: "#9ca3af", marginTop: 12 }}>
            New here?{" "}
            <span onClick={() => navigate("/client/signup")} style={{ color: "#2563eb", fontWeight: 600, cursor: "pointer" }}>Create account</span>
          </p>
        </div>

        {/* Freelancer Card */}
        <div style={cardStyle(hoverFreelancer)} onMouseEnter={() => setHoverFreelancer(true)} onMouseLeave={() => setHoverFreelancer(false)}>
          <span style={badgePurple}>For Professionals</span>
          <div style={{ ...iconPurple, animation: "float 3s ease-in-out infinite 1s" }}>👤</div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: "#111827", marginBottom: 8 }}>I'm a Freelancer</h2>
          <p style={{ fontSize: 14, color: "#6b7280", marginBottom: 20, lineHeight: 1.6 }}>Find exciting projects and work with clients from around the world.</p>
          <ul style={list}>
            {["Browse thousands of projects", "Submit competitive proposals", "Build your portfolio", "Get paid for your expertise"].map(f => (
              <li key={f} style={item}><span>✅</span>{f}</li>
            ))}
          </ul>
          <button className="btn-purple" style={btnPurple} onClick={() => navigate("/freelancer/login")}>Continue as Freelancer →</button>
          <p style={{ textAlign: "center", fontSize: 12, color: "#9ca3af", marginTop: 12 }}>
            New here?{" "}
            <span onClick={() => navigate("/freelancer/signup")} style={{ color: "#7c3aed", fontWeight: 600, cursor: "pointer" }}>Create account</span>
          </p>
        </div>
      </div>

      {/* Footer */}
      <div style={{ ...fadeInDelay3, position: "relative", zIndex: 10, textAlign: "center", paddingBottom: 32, fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
        © 2026 TalentLink · Connecting talent with opportunity
      </div>
    </div>
  );
}