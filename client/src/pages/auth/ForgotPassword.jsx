import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../utils/api";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail]     = useState("");
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => { setTimeout(() => setVisible(true), 50); }, []);

  const fadeUp = { opacity:visible?1:0, transform:visible?"translateY(0)":"translateY(24px)", transition:"opacity 0.6s ease, transform 0.6s ease" };

  const handleSubmit = async () => {
    setError(""); setSuccess("");
    if (!email) { setError("Please enter your email address."); return; }
    try {
      setLoading(true);
      await api.post("/auth/forgot-password", { email });
      setSuccess("✅ Reset link sent! Check your email inbox.");
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(typeof detail === "string" ? detail : "Failed to send reset email. Please try again.");
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(135deg,#0a0520 0%,#0f0c29 30%,#1a0845 60%,#0d1b3e 100%)", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Segoe UI',sans-serif", position:"relative", overflow:"hidden" }}>
      <style>{`
        @keyframes pulse { 0%,100%{transform:scale(1);opacity:0.8} 50%{transform:scale(1.15);opacity:1} }
        @keyframes pulse-ring { 0%{transform:scale(1);opacity:1} 100%{transform:scale(1.5);opacity:0} }
        .inp-focus:focus { border-color:#2563eb !important; box-shadow:0 0 0 3px rgba(37,99,235,0.1) !important; }
        .btn-hover:hover { transform:translateY(-2px) !important; box-shadow:0 8px 25px rgba(37,99,235,0.6) !important; }
      `}</style>

      <div style={{ position:"fixed", top:-150, left:-150, width:500, height:500, borderRadius:"50%", background:"radial-gradient(circle, rgba(37,99,235,0.6) 0%, rgba(37,99,235,0.2) 40%, transparent 70%)", pointerEvents:"none", animation:"pulse 4s ease-in-out infinite", filter:"blur(30px)" }} />
      <div style={{ position:"fixed", bottom:-150, right:-150, width:550, height:550, borderRadius:"50%", background:"radial-gradient(circle, rgba(124,58,237,0.6) 0%, rgba(124,58,237,0.2) 40%, transparent 70%)", pointerEvents:"none", animation:"pulse 5s ease-in-out infinite reverse", filter:"blur(30px)" }} />
      <div style={{ position:"fixed", top:50, right:-100, width:400, height:400, borderRadius:"50%", background:"radial-gradient(circle, rgba(168,85,247,0.5) 0%, transparent 70%)", pointerEvents:"none", animation:"pulse 6s ease-in-out infinite 1s", filter:"blur(25px)" }} />
      <div style={{ position:"fixed", top:"40%", left:-80, width:350, height:350, borderRadius:"50%", background:"radial-gradient(circle, rgba(59,130,246,0.5) 0%, transparent 70%)", pointerEvents:"none", animation:"pulse 5s ease-in-out infinite 2s", filter:"blur(25px)" }} />

      <div style={{ ...fadeUp, position:"relative", zIndex:10, backgroundColor:"var(--card)" /* TODO-DARK */, borderRadius:24, padding:"44px 40px", width:"100%", maxWidth:440, boxShadow:"0 20px 60px rgba(0,0,0,0.4)", border:"1px solid rgba(255,255,255,0.2)" }}>

        <button onClick={() => navigate(-1)}
          style={{ background:"none", border:"none", fontSize:14, color:"#2563eb", cursor:"pointer", padding:"4px 0", marginBottom:20, display:"flex", alignItems:"center", gap:6, fontWeight:500 }}>
          ← Back
        </button>

        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:10, marginBottom:28 }}>
          <div style={{ width:44, height:44, background:"linear-gradient(135deg,#2563eb,#7c3aed)", borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontSize:22, boxShadow:"0 4px 15px rgba(37,99,235,0.4)" }}>💼</div>
          <span style={{ fontWeight:800, fontSize:22, background:"linear-gradient(135deg,#2563eb,#7c3aed)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>TalentLink</span>
        </div>

        <div style={{ textAlign:"center", marginBottom:28 }}>
          <div style={{ position:"relative", display:"inline-block", marginBottom:16 }}>
            <div style={{ fontSize:52 }}>🔐</div>
            <div style={{ position:"absolute", inset:-8, borderRadius:"50%", border:"2px solid rgba(37,99,235,0.3)", animation:"pulse-ring 2s ease-out infinite" }} />
          </div>
          <h2 style={{ fontSize:24, fontWeight:800, color:"var(--text-primary)", marginBottom:8, letterSpacing:"-0.5px" }}>Forgot Password?</h2>
          <p style={{ fontSize:14, color:"var(--text-faint)", lineHeight:1.6 }}>Enter your email and we'll send you a reset link.</p>
        </div>

        {error && <div style={{ backgroundColor:"#fef2f2", border:"1.5px solid #fecaca", borderRadius:10, padding:"12px 16px", fontSize:13, color:"#dc2626", marginBottom:16 }}>⚠️ {error}</div>}
        {success && <div style={{ backgroundColor:"#f0fdf4", border:"1.5px solid #bbf7d0", borderRadius:10, padding:"12px 16px", fontSize:13, color:"#16a34a", marginBottom:16 }}>{success}</div>}

        <label style={{ display:"block", fontSize:13, fontWeight:600, color:"var(--text-secondary)", marginBottom:6 }}>Email Address</label>
        <input className="inp-focus" type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSubmit()}
          style={{ width:"100%", padding:"12px 16px", border:"1.5px solid #e5e7eb", borderRadius:10, fontSize:14, backgroundColor:"var(--page-bg)", outline:"none", boxSizing:"border-box", marginBottom:24, transition:"all 0.2s", color:"var(--text-primary)" }} />

        <button className="btn-hover" onClick={handleSubmit} disabled={loading}
          style={{ width:"100%", padding:14, background: loading ? "#cbd5e1" : "linear-gradient(135deg,#2563eb,#7c3aed)", color:"white", border:"none", borderRadius:10, cursor: loading ? "not-allowed" : "pointer", fontWeight:700, fontSize:15, boxShadow:"0 4px 15px rgba(37,99,235,0.4)", transition:"all 0.2s" }}>
          {loading ? "Sending..." : "Send Reset Link →"}
        </button>

        <div style={{ textAlign:"center", marginTop:16, fontSize:13, color:"var(--text-faint)" }}>
          Remember your password?{" "}
          <Link to="/client/login" style={{ color:"#2563eb", fontWeight:700, textDecoration:"none" }}>Sign in</Link>
        </div>
      </div>
    </div>
  );
}