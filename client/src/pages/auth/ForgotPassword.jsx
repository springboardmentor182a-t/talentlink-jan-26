import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail]     = useState("");
  const [message, setMessage] = useState("");
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setMessage(""); setError("");
    if (!email) { setError("Please enter your email address."); return; }
    try {
      setLoading(true);
      const res = await api.post("/auth/forgot-password", { email });
      setMessage(res.data.message || "Reset link sent! Please check your email.");
    } catch (err) {
      setError(err.response?.data?.detail || "Error sending reset request. Please try again.");
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight:"100vh", backgroundColor:"#f0f2f5", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Segoe UI',sans-serif" }}>
      <div style={{ backgroundColor:"#fff", borderRadius:16, padding:"40px 36px", width:"100%", maxWidth:420, boxShadow:"0 4px 24px rgba(0,0,0,0.09)", textAlign:"center" }}>

        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:10, marginBottom:24 }}>
          <div style={{ width:40, height:40, background:"linear-gradient(135deg,#2563eb,#3b82f6)", borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontSize:20 }}>💼</div>
          <span style={{ fontWeight:700, fontSize:20, color:"#2563eb" }}>TalentLink</span>
        </div>

        <h2 style={{ fontSize:22, fontWeight:700, color:"#111827", marginBottom:4 }}>Forgot Password</h2>
        <p style={{ fontSize:14, color:"#6b7280", marginBottom:28 }}>Enter your email and we'll send you a reset link</p>

        {message && (
          <div style={{ backgroundColor:"#dcfce7", border:"1.5px solid #bbf7d0", borderRadius:8, padding:"12px 14px", fontSize:13, color:"#16a34a", marginBottom:16 }}>
            ✅ {message}
          </div>
        )}
        {error && (
          <div style={{ backgroundColor:"#fef2f2", border:"1.5px solid #fecaca", borderRadius:8, padding:"12px 14px", fontSize:13, color:"#dc2626", marginBottom:16 }}>
            ⚠️ {error}
          </div>
        )}

        <label style={{ display:"block", textAlign:"left", fontSize:13, fontWeight:600, color:"#374151", marginBottom:6 }}>Email Address</label>
        <input
          type="email" placeholder="Enter your email" value={email}
          onChange={e => setEmail(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSubmit()}
          style={{ width:"100%", padding:"11px 14px", border:"1.5px solid #e5e7eb", borderRadius:8, fontSize:14, backgroundColor:"#f9fafb", outline:"none", boxSizing:"border-box", marginBottom:20 }}
        />

        <button
          onClick={handleSubmit} disabled={loading}
          style={{ width:"100%", padding:13, background: loading ? undefined : "linear-gradient(135deg,#2563eb,#3b82f6)", backgroundColor: loading ? "#9ca3af" : undefined, color:"white", border:"none", borderRadius:8, cursor: loading ? "not-allowed" : "pointer", fontWeight:700, fontSize:15 }}>
          {loading ? "Sending..." : "Send Reset Link"}
        </button>

        <button
          onClick={() => navigate(-1)}
          style={{ marginTop:16, fontSize:13, color:"#2563eb", cursor:"pointer", background:"none", border:"none", textDecoration:"underline" }}>
          ← Back to Login
        </button>
      </div>
    </div>
  );
}
