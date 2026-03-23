import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../utils/api";

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

const GitHubIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
  </svg>
);

export default function FreelancerSignup() {
  const navigate = useNavigate();
  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [visible, setVisible]   = useState(false);

  useEffect(() => { setTimeout(() => setVisible(true), 50); }, []);

  const fadeUp = { opacity:visible?1:0, transform:visible?"translateY(0)":"translateY(24px)", transition:"opacity 0.6s ease, transform 0.6s ease" };

  const handleSubmit = async () => {
    setError("");
    if (!name || !email || !password) { setError("All fields are required."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    try {
      setLoading(true);
      await api.post("/auth/register", { name, email, password, role: "freelancer" });
      navigate("/freelancer/login");
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(typeof detail === "string" ? detail : Array.isArray(detail) ? detail[0]?.msg || "Registration failed." : "Registration failed.");
    } finally { setLoading(false); }
  };

  const inp = { width:"100%", padding:"12px 16px", border:"1.5px solid #e5e7eb", borderRadius:10, fontSize:14, backgroundColor:"#f9fafb", outline:"none", boxSizing:"border-box", marginBottom:16, transition:"all 0.2s", color:"#111827" };
  const lbl = { display:"block", fontSize:13, fontWeight:600, color:"#374151", marginBottom:6 };

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(135deg,#0a0520 0%,#0f0c29 30%,#1a0845 60%,#0d1b3e 100%)", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Segoe UI',sans-serif", position:"relative", overflow:"hidden" }}>
      <style>{`
        @keyframes pulse { 0%,100%{transform:scale(1);opacity:0.8} 50%{transform:scale(1.15);opacity:1} }
        .inp-focus-p:focus { border-color:#7c3aed !important; box-shadow:0 0 0 3px rgba(124,58,237,0.1) !important; }
        .btn-hover-p:hover { transform:translateY(-2px) !important; box-shadow:0 8px 25px rgba(124,58,237,0.6) !important; }
        .social-hover:hover { transform:translateY(-1px) !important; box-shadow:0 4px 12px rgba(0,0,0,0.15) !important; }
      `}</style>

      <div style={{ position:"fixed", top:-150, left:-150, width:500, height:500, borderRadius:"50%", background:"radial-gradient(circle, rgba(124,58,237,0.6) 0%, rgba(124,58,237,0.2) 40%, transparent 70%)", pointerEvents:"none", animation:"pulse 4s ease-in-out infinite", filter:"blur(30px)" }} />
      <div style={{ position:"fixed", bottom:-150, right:-150, width:550, height:550, borderRadius:"50%", background:"radial-gradient(circle, rgba(37,99,235,0.6) 0%, rgba(37,99,235,0.2) 40%, transparent 70%)", pointerEvents:"none", animation:"pulse 5s ease-in-out infinite reverse", filter:"blur(30px)" }} />
      <div style={{ position:"fixed", top:50, right:-100, width:400, height:400, borderRadius:"50%", background:"radial-gradient(circle, rgba(168,85,247,0.5) 0%, transparent 70%)", pointerEvents:"none", animation:"pulse 6s ease-in-out infinite 1s", filter:"blur(25px)" }} />
      <div style={{ position:"fixed", top:"40%", left:-80, width:350, height:350, borderRadius:"50%", background:"radial-gradient(circle, rgba(59,130,246,0.5) 0%, transparent 70%)", pointerEvents:"none", animation:"pulse 5s ease-in-out infinite 2s", filter:"blur(25px)" }} />

      <div style={{ ...fadeUp, position:"relative", zIndex:10, backgroundColor:"#ffffff", borderRadius:24, padding:"44px 40px", width:"100%", maxWidth:440, boxShadow:"0 20px 60px rgba(0,0,0,0.4)", border:"1px solid rgba(255,255,255,0.2)" }}>

        <button onClick={() => navigate("/")}
          style={{ background:"none", border:"none", fontSize:14, color:"#7c3aed", cursor:"pointer", padding:"4px 0", marginBottom:20, display:"flex", alignItems:"center", gap:6, fontWeight:500 }}>
          ← Back
        </button>

        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:10, marginBottom:28 }}>
          <div style={{ width:44, height:44, background:"linear-gradient(135deg,#7c3aed,#a855f7)", borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontSize:22, boxShadow:"0 4px 15px rgba(124,58,237,0.4)" }}>👤</div>
          <span style={{ fontWeight:800, fontSize:22, background:"linear-gradient(135deg,#7c3aed,#a855f7)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>TalentLink</span>
        </div>

        <h2 style={{ fontSize:24, fontWeight:800, color:"#111827", marginBottom:6, textAlign:"center", letterSpacing:"-0.5px" }}>Create Freelancer Account</h2>
        <p style={{ fontSize:14, color:"#6b7280", marginBottom:28, textAlign:"center" }}>Join TalentLink and start finding amazing projects</p>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:20 }}>
          <button className="social-hover" onClick={() => alert("Google signup coming soon!")}
            style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, padding:12, border:"1.5px solid #e5e7eb", borderRadius:10, cursor:"pointer", backgroundColor:"white", fontSize:14, fontWeight:600, color:"#374151", transition:"all 0.2s" }}>
            <GoogleIcon /> Google
          </button>
          <button className="social-hover" onClick={() => alert("GitHub signup coming soon!")}
            style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, padding:12, border:"1.5px solid #24292e", borderRadius:10, cursor:"pointer", backgroundColor:"#24292e", fontSize:14, fontWeight:600, color:"white", transition:"all 0.2s" }}>
            <GitHubIcon /> GitHub
          </button>
        </div>

        <div style={{ display:"flex", alignItems:"center", gap:12, margin:"20px 0", color:"#9ca3af", fontSize:12 }}>
          <div style={{ flex:1, height:1, backgroundColor:"#e5e7eb" }} />
          or continue with email
          <div style={{ flex:1, height:1, backgroundColor:"#e5e7eb" }} />
        </div>

        {error && (
          <div style={{ backgroundColor:"#fef2f2", border:"1.5px solid #fecaca", borderRadius:10, padding:"12px 16px", fontSize:13, color:"#dc2626", marginBottom:16 }}>
            ⚠️ {error}
          </div>
        )}

        <label style={lbl}>Full Name</label>
        <input className="inp-focus-p" style={inp} type="text" placeholder="John Doe" value={name} onChange={e => setName(e.target.value)} />

        <label style={lbl}>Email Address</label>
        <input className="inp-focus-p" style={inp} type="email" placeholder="freelancer@example.com" value={email} onChange={e => setEmail(e.target.value)} />

        <label style={lbl}>Password</label>
        <input className="inp-focus-p" style={{ ...inp, marginBottom:24 }} type="password" placeholder="Min. 6 characters" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSubmit()} />

        <button className="btn-hover-p" onClick={handleSubmit} disabled={loading}
          style={{ width:"100%", padding:14, background: loading ? "#cbd5e1" : "linear-gradient(135deg,#7c3aed,#a855f7)", color:"white", border:"none", borderRadius:10, cursor: loading ? "not-allowed" : "pointer", fontWeight:700, fontSize:15, boxShadow:"0 4px 15px rgba(124,58,237,0.4)", transition:"all 0.2s" }}>
          {loading ? "Creating Account..." : "Create Account →"}
        </button>

        <p style={{ fontSize:12, color:"#9ca3af", textAlign:"center", marginTop:16, lineHeight:1.5 }}>
          By signing up, you agree to our Terms of Service and Privacy Policy
        </p>
        <div style={{ textAlign:"center", marginTop:10, fontSize:13, color:"#6b7280" }}>
          Already have an account?{" "}
          <Link to="/freelancer/login" style={{ color:"#7c3aed", fontWeight:700, textDecoration:"none" }}>Sign in</Link>
        </div>
      </div>
    </div>
  );
}
