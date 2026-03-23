import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../utils/api";
import { AuthContext } from "../../context/AuthContext";

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 48 48">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
  </svg>
);

const GitHubIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
  </svg>
);

export default function FreelancerLogin() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async () => {
    setError("");
    if (!email || !password) { setError("Please enter your email and password."); return; }
    try {
      setLoading(true);
      const res = await api.post("/auth/login", { email, password });
      const userRole = res.data.role?.toLowerCase();
      if (userRole !== "freelancer") {
        setError("This account is not a freelancer. Please use Client Login.");
        return;
      }
      login({ token: res.data.token, role: userRole, user: res.data.user });
      navigate("/freelancer/dashboard");
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(
        typeof detail === "string"
          ? detail
          : Array.isArray(detail)
            ? detail[0]?.msg || "Invalid email or password. Please try again."
            : "Invalid email or password. Please try again."
      );
    } finally { setLoading(false); }
  };

  const inp = { width:"100%", padding:"11px 14px", border:"1.5px solid #e5e7eb", borderRadius:8, fontSize:14, backgroundColor:"#f9fafb", outline:"none", boxSizing:"border-box", marginBottom:16 };
  const lbl = { display:"block", fontSize:13, fontWeight:600, color:"#374151", marginBottom:6 };

  return (
    <div style={{ minHeight:"100vh", backgroundColor:"#f5f3ff", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Segoe UI',sans-serif" }}>
      <div style={{ backgroundColor:"#fff", borderRadius:16, padding:"40px 36px", width:"100%", maxWidth:420, boxShadow:"0 4px 24px rgba(0,0,0,0.09)" }}>
        <button onClick={() => navigate("/")}
          style={{ background:"none", border:"none", fontSize:14, color:"#2563eb", cursor:"pointer", padding:0, marginBottom:16, display:"flex", alignItems:"center", gap:6 }}>
          ← Back
        </button>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:10, marginBottom:24 }}>
          <div style={{ width:40, height:40, background:"linear-gradient(135deg,#7c3aed,#a855f7)", borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontSize:20 }}>👤</div>
          <span style={{ fontWeight:700, fontSize:20, color:"#7c3aed" }}>TalentLink</span>
        </div>

        <h2 style={{ fontSize:22, fontWeight:700, color:"#111827", marginBottom:4, textAlign:"center" }}>Freelancer Login</h2>
        <p style={{ fontSize:14, color:"#6b7280", marginBottom:24, textAlign:"center" }}>Access your dashboard to browse projects and manage proposals</p>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:20 }}>
          <button onClick={() => alert("Google login coming soon!")}
            style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, padding:11, border:"1.5px solid #e5e7eb", borderRadius:8, cursor:"pointer", backgroundColor:"white", fontSize:14, fontWeight:600, color:"#374151" }}>
            <GoogleIcon /> Google
          </button>
          <button onClick={() => alert("GitHub login coming soon!")}
            style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, padding:11, border:"1.5px solid #24292e", borderRadius:8, cursor:"pointer", backgroundColor:"#24292e", fontSize:14, fontWeight:600, color:"white" }}>
            <GitHubIcon /> GitHub
          </button>
        </div>

        <div style={{ display:"flex", alignItems:"center", gap:12, margin:"20px 0", color:"#9ca3af", fontSize:12 }}>
          <div style={{ flex:1, height:1, backgroundColor:"#e5e7eb" }} />
          or continue with email
          <div style={{ flex:1, height:1, backgroundColor:"#e5e7eb" }} />
        </div>

        {error && (
          <div style={{ backgroundColor:"#fef2f2", border:"1.5px solid #fecaca", borderRadius:8, padding:"10px 14px", fontSize:13, color:"#dc2626", marginBottom:16 }}>
            ⚠️ {error}
          </div>
        )}

        <label style={lbl}>Email</label>
        <input style={inp} type="email" placeholder="freelancer@example.com" value={email} onChange={e => setEmail(e.target.value)} />

        <label style={lbl}>Password</label>
        <input
          style={inp} type="password" placeholder="••••••••" value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSubmit()}
        />

        <button
          onClick={handleSubmit} disabled={loading}
          style={{ width:"100%", padding:13, background: loading ? undefined : "linear-gradient(135deg,#7c3aed,#a855f7)", backgroundColor: loading ? "#9ca3af" : undefined, color:"white", border:"none", borderRadius:8, cursor: loading ? "not-allowed" : "pointer", fontWeight:700, fontSize:15 }}>
          {loading ? "Signing in..." : "Sign In →"}
        </button>

        <div style={{ textAlign:"center", marginTop:14, fontSize:13, color:"#6b7280" }}>
          <Link to="/forgot-password" style={{ color:"#7c3aed", fontWeight:600, textDecoration:"none" }}>Forgot Password?</Link>
        </div>
        <div style={{ textAlign:"center", marginTop:10, fontSize:13, color:"#6b7280" }}>
          Don't have an account?{" "}
          <Link to="/freelancer/signup" style={{ color:"#7c3aed", fontWeight:600, textDecoration:"none" }}>Sign up</Link>
        </div>
      </div>
    </div>
  );
}
import { useState, useContext, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import api from "../../utils/api";
import { AuthContext } from "../../context/AuthContext";

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 48 48">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
  </svg>
);
const GitHubIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
  </svg>
);

export default function FreelancerLogin() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [visible,  setVisible]  = useState(false);

  useEffect(() => { setTimeout(() => setVisible(true), 50); }, []);

  const fadeUp = {
    opacity:   visible ? 1 : 0,
    transform: visible ? "translateY(0)" : "translateY(24px)",
    transition:"opacity 0.6s ease, transform 0.6s ease"
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const res = await api.post("/auth/google", { token: tokenResponse.access_token, role: "freelancer" });
        login({ token: res.data.token, role: res.data.role, user: res.data.user });
        navigate("/freelancer/dashboard");
      } catch { setError("Google login failed. Please try again."); }
    },
    onError: () => setError("Google login failed.")
  });

  const handleGitHub = () => {
    window.location.href = `https://github.com/login/oauth/authorize?client_id=Ov23lil8Mv6gmI3t7Ecd&scope=user:email`;
  };

  const handleSubmit = async () => {
    setError("");
    if (!email || !password) { setError("Please enter your email and password."); return; }
    try {
      setLoading(true);
      const res = await api.post("/auth/login", { email, password });
      const userRole = res.data.role?.toLowerCase();
      if (userRole !== "freelancer") {
        setError("This account is not a freelancer. Please use Client Login.");
        return;
      }
      login({ token: res.data.token, role: userRole, user: res.data.user });
      navigate("/freelancer/dashboard");   // ✅ fixed
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(
        typeof detail === "string" ? detail :
        Array.isArray(detail) ? detail[0]?.msg || "Invalid email or password." :
        "Invalid email or password."
      );
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(135deg,#0a0520 0%,#0f0c29 30%,#1a0845 60%,#0d1b3e 100%)", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Segoe UI',sans-serif", position:"relative", overflow:"hidden" }}>
      <style>{`
        @keyframes pulse { 0%,100%{transform:scale(1);opacity:0.8} 50%{transform:scale(1.15);opacity:1} }
        .inp-focus-p:focus { border-color:#7c3aed !important; box-shadow:0 0 0 3px rgba(124,58,237,0.1) !important; }
        .btn-hover-p:hover { transform:translateY(-2px) !important; box-shadow:0 8px 25px rgba(124,58,237,0.6) !important; }
        .social-hover:hover { transform:translateY(-1px) !important; box-shadow:0 4px 12px rgba(0,0,0,0.15) !important; }
      `}</style>

      {/* Background blobs */}
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

        <h2 style={{ fontSize:24, fontWeight:800, color:"#111827", marginBottom:6, textAlign:"center", letterSpacing:"-0.5px" }}>Freelancer Login</h2>
        <p style={{ fontSize:14, color:"#6b7280", marginBottom:28, textAlign:"center" }}>Access your dashboard to browse projects and manage proposals</p>

        {/* Social buttons */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:20 }}>
          <button className="social-hover" onClick={() => googleLogin()}
            style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, padding:12, border:"1.5px solid #e5e7eb", borderRadius:10, cursor:"pointer", backgroundColor:"white", fontSize:14, fontWeight:600, color:"#374151", transition:"all 0.2s" }}>
            <GoogleIcon /> Google
          </button>
          <button className="social-hover" onClick={handleGitHub}
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

        <label style={{ display:"block", fontSize:13, fontWeight:600, color:"#374151", marginBottom:6 }}>Email</label>
        <input className="inp-focus-p" type="email" placeholder="freelancer@example.com"
          value={email} onChange={e => setEmail(e.target.value)}
          style={{ width:"100%", padding:"12px 16px", border:"1.5px solid #e5e7eb", borderRadius:10, fontSize:14, backgroundColor:"#f9fafb", outline:"none", boxSizing:"border-box", marginBottom:16, transition:"all 0.2s", color:"#111827" }} />

        <label style={{ display:"block", fontSize:13, fontWeight:600, color:"#374151", marginBottom:6 }}>Password</label>
        <input className="inp-focus-p" type="password" placeholder="••••••••"
          value={password} onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSubmit()}
          style={{ width:"100%", padding:"12px 16px", border:"1.5px solid #e5e7eb", borderRadius:10, fontSize:14, backgroundColor:"#f9fafb", outline:"none", boxSizing:"border-box", marginBottom:24, transition:"all 0.2s", color:"#111827" }} />

        <button className="btn-hover-p" onClick={handleSubmit} disabled={loading}
          style={{ width:"100%", padding:14, background: loading ? "#cbd5e1" : "linear-gradient(135deg,#7c3aed,#a855f7)", color:"white", border:"none", borderRadius:10, cursor: loading ? "not-allowed" : "pointer", fontWeight:700, fontSize:15, boxShadow:"0 4px 15px rgba(124,58,237,0.4)", transition:"all 0.2s" }}>
          {loading ? "Signing in..." : "Sign In →"}
        </button>

        <div style={{ textAlign:"center", marginTop:16, fontSize:13, color:"#6b7280" }}>
          <Link to="/forgot-password" style={{ color:"#7c3aed", fontWeight:600, textDecoration:"none" }}>Forgot Password?</Link>
        </div>
        <div style={{ textAlign:"center", marginTop:10, fontSize:13, color:"#6b7280" }}>
          Don't have an account?{" "}
          <Link to="/freelancer/signup" style={{ color:"#7c3aed", fontWeight:700, textDecoration:"none" }}>Sign up</Link>
        </div>
      </div>
    </div>
  );
}
