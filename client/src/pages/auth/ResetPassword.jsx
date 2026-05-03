import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import api from "../../utils/api";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get("token");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm]   = useState("");
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState("");
  const [loading, setLoading]   = useState(false);
  const [visible, setVisible]   = useState(false);

  useEffect(() => { setTimeout(() => setVisible(true), 50); }, []);

  const fadeUp = { opacity:visible?1:0, transform:visible?"translateY(0)":"translateY(24px)", transition:"opacity 0.6s ease, transform 0.6s ease" };

  const handleSubmit = async () => {
    setError(""); setSuccess("");
    if (!password || !confirm) { setError("Please fill all fields."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (password !== confirm) { setError("Passwords do not match."); return; }
    if (!token) { setError("Invalid reset link."); return; }
    try {
      setLoading(true);
      await api.post("/auth/reset-password", { token, password });
      setSuccess("✅ Password reset successful! Redirecting...");
      setTimeout(() => navigate("/client/login"), 2000);
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(typeof detail === "string" ? detail : "Reset failed. Please try again.");
    } finally { setLoading(false); }
  };

  const strengthScore = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3;
  const strengthColor = ["#e5e7eb","#ef4444","#f59e0b","#16a34a"][strengthScore];
  const strengthLabel = ["","Weak","Fair","Strong"][strengthScore];

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(135deg,#0a0520 0%,#0f0c29 30%,#1a0845 60%,#0d1b3e 100%)", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Segoe UI',sans-serif", position:"relative", overflow:"hidden" }}>
      <style>{`
        @keyframes pulse { 0%,100%{transform:scale(1);opacity:0.8} 50%{transform:scale(1.15);opacity:1} }
        .inp-focus:focus { border-color:#2563eb !important; box-shadow:0 0 0 3px rgba(37,99,235,0.1) !important; }
        .btn-hover:hover { transform:translateY(-2px) !important; box-shadow:0 8px 25px rgba(37,99,235,0.6) !important; }
      `}</style>

      <div style={{ position:"fixed", top:-150, left:-150, width:500, height:500, borderRadius:"50%", background:"radial-gradient(circle, rgba(37,99,235,0.6) 0%, rgba(37,99,235,0.2) 40%, transparent 70%)", pointerEvents:"none", animation:"pulse 4s ease-in-out infinite", filter:"blur(30px)" }} />
      <div style={{ position:"fixed", bottom:-150, right:-150, width:550, height:550, borderRadius:"50%", background:"radial-gradient(circle, rgba(124,58,237,0.6) 0%, rgba(124,58,237,0.2) 40%, transparent 70%)", pointerEvents:"none", animation:"pulse 5s ease-in-out infinite reverse", filter:"blur(30px)" }} />
      <div style={{ position:"fixed", top:50, right:-100, width:400, height:400, borderRadius:"50%", background:"radial-gradient(circle, rgba(168,85,247,0.5) 0%, transparent 70%)", pointerEvents:"none", animation:"pulse 6s ease-in-out infinite 1s", filter:"blur(25px)" }} />
      <div style={{ position:"fixed", top:"40%", left:-80, width:350, height:350, borderRadius:"50%", background:"radial-gradient(circle, rgba(59,130,246,0.5) 0%, transparent 70%)", pointerEvents:"none", animation:"pulse 5s ease-in-out infinite 2s", filter:"blur(25px)" }} />

      <div style={{ ...fadeUp, position:"relative", zIndex:10, backgroundColor:"var(--card)", borderRadius:24, padding:"44px 40px", width:"100%", maxWidth:440, boxShadow:"0 20px 60px rgba(0,0,0,0.4)", border:"1px solid rgba(255,255,255,0.2)" }}>

        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:10, marginBottom:28 }}>
          <div style={{ width:44, height:44, background:"linear-gradient(135deg,#2563eb,#7c3aed)", borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontSize:22, boxShadow:"0 4px 15px rgba(37,99,235,0.4)" }}>💼</div>
          <span style={{ fontWeight:800, fontSize:22, background:"linear-gradient(135deg,#2563eb,#7c3aed)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>TalentLink</span>
        </div>

        <div style={{ textAlign:"center", marginBottom:28 }}>
          <div style={{ fontSize:52, marginBottom:12 }}>🔑</div>
          <h2 style={{ fontSize:24, fontWeight:800, color:"var(--text-primary)", marginBottom:8, letterSpacing:"-0.5px" }}>Reset Password</h2>
          <p style={{ fontSize:14, color:"var(--text-faint)" }}>Enter your new password below.</p>
        </div>

        {error && <div style={{ backgroundColor:"var(--tint-red)", border:"1.5px solid var(--tint-red-border)", borderRadius:10, padding:"12px 16px", fontSize:13, color:"var(--text-error)", marginBottom:16 }}>⚠️ {error}</div>}
        {success && <div style={{ backgroundColor:"var(--tint-green)", border:"1.5px solid var(--tint-green-border)", borderRadius:10, padding:"12px 16px", fontSize:13, color:"#16a34a", marginBottom:16 }}>{success}</div>}

        <label style={{ display:"block", fontSize:13, fontWeight:600, color:"var(--text-secondary)", marginBottom:6 }}>New Password</label>
        <input className="inp-focus" type="password" placeholder="Min. 6 characters" value={password} onChange={e => setPassword(e.target.value)}
          style={{ width:"100%", padding:"12px 16px", border:"1.5px solid var(--border)", borderRadius:10, fontSize:14, backgroundColor:"var(--input-background)", outline:"none", boxSizing:"border-box", marginBottom:8, transition:"all 0.2s", color:"var(--text-primary)" }} />

        {password.length > 0 && (
          <div style={{ marginBottom:16 }}>
            <div style={{ display:"flex", gap:4, marginBottom:4 }}>
              {[1,2,3].map(i => (
                <div key={i} style={{ flex:1, height:4, borderRadius:2, backgroundColor: i <= strengthScore ? strengthColor : "var(--border)", transition:"all 0.3s" }} />
              ))}
            </div>
            <div style={{ fontSize:11, color:strengthColor, fontWeight:600 }}>{strengthLabel}</div>
          </div>
        )}

        <label style={{ display:"block", fontSize:13, fontWeight:600, color:"var(--text-secondary)", marginBottom:6 }}>Confirm Password</label>
        <input className="inp-focus" type="password" placeholder="Confirm new password" value={confirm} onChange={e => setConfirm(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSubmit()}
          style={{ width:"100%", padding:"12px 16px", border:`1.5px solid ${confirm && confirm !== password ? "#ef4444" : "var(--border)"}`, borderRadius:10, fontSize:14, backgroundColor:"var(--page-bg)", outline:"none", boxSizing:"border-box", marginBottom: confirm && confirm !== password ? 4 : 24, transition:"all 0.2s", color:"var(--text-primary)" }} />

        {confirm && confirm !== password && (
          <p style={{ fontSize:12, color:"#ef4444", marginBottom:16, marginTop:0 }}>Passwords do not match</p>
        )}

        <button className="btn-hover" onClick={handleSubmit} disabled={loading}
          style={{ width:"100%", padding:14, background: loading ? "var(--muted)" : "linear-gradient(135deg,#2563eb,#7c3aed)", color:"white", border:"none", borderRadius:10, cursor: loading ? "not-allowed" : "pointer", fontWeight:700, fontSize:15, boxShadow:"0 4px 15px rgba(37,99,235,0.4)", transition:"all 0.2s" }}>
          {loading ? "Resetting..." : "Reset Password →"}
        </button>

        <div style={{ textAlign:"center", marginTop:16, fontSize:13, color:"var(--text-faint)" }}>
          <Link to="/client/login" style={{ color:"#2563eb", fontWeight:700, textDecoration:"none" }}>Back to Login</Link>
        </div>
      </div>
    </div>
  );
}