<<<<<<< Group-A-feature/freelancer-dashboard-adwaith
import { useState, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../utils/api";
import { AuthContext } from "../../context/AuthContext";

export default function SubmitProposal() {
  const { projectId }          = useParams();
  const { user, role, logout } = useContext(AuthContext);
  const navigate               = useNavigate();

  const [coverLetter, setCoverLetter]   = useState("");
  const [budget, setBudget]             = useState("");
  const [deliveryTime, setDeliveryTime] = useState("");
  const [errors, setErrors]             = useState({});
  const [loading, setLoading]           = useState(false);

  if (!user) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", fontFamily: "'Segoe UI',sans-serif" }}>
        <div style={{ backgroundColor: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 12, padding: 24, color: "#c2410c", fontSize: 14 }}>
          ⚠️ You must be logged in to submit a proposal.{" "}
          <span style={{ textDecoration: "underline", cursor: "pointer" }} onClick={() => navigate("/freelancer/login")}>Login here</span>
        </div>
      </div>
    );
  }

  const validate = () => {
    const e = {};
    if (!coverLetter.trim())  e.coverLetter  = "Cover letter is required";
    if (!budget)              e.budget       = "Budget is required";
    else if (isNaN(budget) || Number(budget) <= 0) e.budget = "Enter a valid budget amount";
    if (!deliveryTime.trim()) e.deliveryTime = "Delivery time is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      setLoading(true);
      await api.post("/proposals/", {
        project_id:      parseInt(projectId),
        freelancer_id:   user.id,
        cover_letter:    coverLetter,
        proposed_budget: parseFloat(budget),
        delivery_time:   deliveryTime,
      });
      alert("✅ Proposal submitted successfully!");
      navigate("/proposal-tracking");
    } catch (err) {
      const detail = err.response?.data?.detail;
      const msg = typeof detail === "string"
        ? detail
        : Array.isArray(detail)
          ? detail[0]?.msg || "❌ Error submitting proposal. Please try again."
          : "❌ Error submitting proposal. Please try again.";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  const inp = { width: "100%", padding: "12px 14px", border: "1.5px solid #e5e7eb", borderRadius: 8, fontSize: 14, backgroundColor: "#f9fafb", outline: "none", boxSizing: "border-box" };

  return (
    <div style={{ padding: 32, maxWidth: 760, margin: "0 auto", fontFamily: "'Segoe UI',sans-serif" }}>
      <button onClick={() => navigate(-1)}
        style={{ background: "none", border: "none", fontSize: 14, color: "#6b7280", cursor: "pointer", padding: 0, marginBottom: 20 }}>
        ← Back
      </button>
      <h1 style={{ fontSize: 26, fontWeight: 700, color: "#111827", marginBottom: 4 }}>Submit a Proposal</h1>
      <p style={{ fontSize: 14, color: "#6b7280", marginBottom: 28 }}>Project #{projectId} — Fill in the details below to apply</p>

      <div style={{ backgroundColor: "#fff", borderRadius: 12, padding: 32, boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>

        <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Cover Letter *</label>
        <textarea
          value={coverLetter} onChange={e => setCoverLetter(e.target.value)}
          placeholder="Describe your relevant experience, skills, and why you're the best fit for this project..."
          style={{ ...inp, resize: "vertical", minHeight: 140, lineHeight: 1.6, marginBottom: 4 }}
        />
        {errors.coverLetter && <p style={{ fontSize: 12, color: "#ef4444", margin: "0 0 16px" }}>{errors.coverLetter}</p>}
        {!errors.coverLetter && <div style={{ marginBottom: 20 }} />}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 8 }}>
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Proposed Budget ($) *</label>
            <input style={inp} type="number" min="1" placeholder="e.g. 5000" value={budget} onChange={e => setBudget(e.target.value)} />
            {errors.budget && <p style={{ fontSize: 12, color: "#ef4444", marginTop: 4 }}>{errors.budget}</p>}
          </div>
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Delivery Time *</label>
            <input style={inp} type="text" placeholder="e.g. 2 weeks, 10 days" value={deliveryTime} onChange={e => setDeliveryTime(e.target.value)} />
            {errors.deliveryTime && <p style={{ fontSize: 12, color: "#ef4444", marginTop: 4 }}>{errors.deliveryTime}</p>}
          </div>
        </div>

        <button onClick={handleSubmit} disabled={loading}
          style={{ width: "100%", padding: 14, background: loading ? undefined : "linear-gradient(135deg,#7c3aed,#a855f7)", backgroundColor: loading ? "#9ca3af" : undefined, color: "white", border: "none", borderRadius: 8, cursor: loading ? "not-allowed" : "pointer", fontWeight: 700, fontSize: 15, marginTop: 16 }}>
          {loading ? "Submitting..." : "Submit Proposal →"}
        </button>
      </div>
    </div>
  );
}
=======
import { useState, useEffect, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../utils/api";
import { AuthContext } from "../../context/AuthContext";

export default function SubmitProposal() {
  const { projectId }          = useParams();
  const { user, role, logout } = useContext(AuthContext);
  const navigate               = useNavigate();

  const [coverLetter, setCoverLetter]   = useState("");
  const [budget, setBudget]             = useState("");
  const [deliveryTime, setDeliveryTime] = useState("");
  const [errors, setErrors]             = useState({});
  const [loading, setLoading]           = useState(false);
  const [project, setProject]           = useState(null);

  useEffect(() => {
    if (projectId) {
      api.get(`/projects/${projectId}`)
        .then(res => setProject(res.data))
        .catch(() => setProject(null));
    }
  }, [projectId]);

  if (!user) {
    return (
      <div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:"100vh", fontFamily:"'Segoe UI',sans-serif" }}>
        <div style={{ backgroundColor:"#fff7ed", border:"1px solid #fed7aa", borderRadius:12, padding:24, color:"#c2410c", fontSize:14 }}>
          ⚠️ You must be logged in.{" "}
          <span style={{ textDecoration:"underline", cursor:"pointer" }} onClick={() => navigate("/freelancer/login")}>Login here</span>
        </div>
      </div>
    );
  }

  const validate = () => {
    const e = {};
    if (!coverLetter.trim())  e.coverLetter  = "Cover letter is required";
    if (!budget)              e.budget       = "Budget is required";
    else if (isNaN(budget) || Number(budget) <= 0) e.budget = "Enter a valid budget amount";
    if (!deliveryTime.trim()) e.deliveryTime = "Delivery time is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      setLoading(true);
      await api.post("/proposals/", {
        project_id:      parseInt(projectId),
        freelancer_id:   user.id,
        cover_letter:    coverLetter,
        proposed_budget: parseFloat(budget),
        delivery_time:   deliveryTime,
      });
      navigate("/proposal-tracking");
    } catch (err) {
      const detail = err.response?.data?.detail;
      const msg = typeof detail === "string" ? detail : Array.isArray(detail) ? detail[0]?.msg || "❌ Error submitting." : "❌ Error submitting.";
      alert(msg);
    } finally { setLoading(false); }
  };

  const charCount = coverLetter.length;
  const projectLabel = project?.title || `Project #${projectId}`;

  return (
    <div style={{ fontFamily:"'Segoe UI',sans-serif", backgroundColor:"#f8fafc", minHeight:"100vh" }}>

      {/* Topbar */}
      <div style={{ backgroundColor:"#fff", padding:"0 32px", display:"flex", justifyContent:"space-between", alignItems:"center", borderBottom:"1px solid #e2e8f0", height:64, position:"sticky", top:0, zIndex:100, boxShadow:"0 1px 3px rgba(0,0,0,0.05)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <button onClick={() => navigate("/proposal-tracking")}
            style={{ background:"none", border:"none", fontSize:14, color:"#64748b", cursor:"pointer", display:"flex", alignItems:"center", gap:6, padding:"6px 12px", borderRadius:8 }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor="#f1f5f9"}
            onMouseLeave={e => e.currentTarget.style.backgroundColor="transparent"}>
            ← Back
          </button>
          <div style={{ width:1, height:24, backgroundColor:"#e2e8f0" }} />
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ width:8, height:8, borderRadius:"50%", background:"linear-gradient(135deg,#7c3aed,#a855f7)" }} />
            <span style={{ fontSize:15, fontWeight:700, color:"#111827" }}>Submit Proposal</span>
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:16 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, backgroundColor:"#f8fafc", padding:"6px 14px", borderRadius:20, border:"1px solid #e2e8f0" }}>
            <div style={{ width:32, height:32, borderRadius:"50%", background:"linear-gradient(135deg,#7c3aed,#a855f7)", display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontWeight:700, fontSize:13 }}>
              {(user?.name || "F").charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight:600, fontSize:13, color:"#111827" }}>{user.name}</div>
              <div style={{ fontSize:11, color:"#64748b", textTransform:"capitalize" }}>{role}</div>
            </div>
          </div>
          <button onClick={() => { logout(); navigate("/"); }}
            style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 16px", border:"1px solid #e2e8f0", borderRadius:8, cursor:"pointer", fontSize:13, color:"#64748b", background:"white" }}>
            Logout
          </button>
        </div>
      </div>

      {/* Hero */}
      <div style={{ background:"linear-gradient(135deg,#2d1b69 0%,#7c3aed 50%,#a855f7 100%)", padding:"32px 32px", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:-40, right:-40, width:180, height:180, borderRadius:"50%", background:"rgba(255,255,255,0.05)" }} />
        <div style={{ display:"inline-flex", alignItems:"center", gap:8, backgroundColor:"rgba(255,255,255,0.15)", borderRadius:20, padding:"4px 14px", fontSize:12, color:"white", fontWeight:600, marginBottom:10 }}>
          🚀 Apply Now
        </div>
        <h1 style={{ fontSize:28, fontWeight:800, color:"white", margin:"0 0 6px", letterSpacing:"-0.5px" }}>Submit a Proposal</h1>
        <p style={{ fontSize:14, color:"rgba(255,255,255,0.75)", margin:0 }}>{projectLabel} — Fill in your details to apply</p>
      </div>

      <div style={{ padding:32, maxWidth:800, margin:"0 auto" }}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 300px", gap:24, alignItems:"start" }}>

          {/* Form */}
          <div style={{ backgroundColor:"#fff", borderRadius:16, padding:32, boxShadow:"0 1px 3px rgba(0,0,0,0.06)", border:"1px solid #e2e8f0" }}>

            <div style={{ marginBottom:24 }}>
              <label style={lbl}>
                Cover Letter <span style={{ color:"#ef4444" }}>*</span>
                <span style={{ fontSize:11, color:"#9ca3af", fontWeight:400, marginLeft:8 }}>Describe your experience and approach</span>
              </label>
              <textarea
                value={coverLetter} onChange={e => setCoverLetter(e.target.value)}
                placeholder="Describe your relevant experience, skills, and why you're the best fit for this project..."
                style={{ ...inp, resize:"vertical", minHeight:160, lineHeight:1.7, borderColor: coverLetter ? "#7c3aed" : "#e2e8f0" }}
              />
              <div style={{ display:"flex", justifyContent:"space-between", marginTop:4 }}>
                {errors.coverLetter
                  ? <p style={{ fontSize:12, color:"#ef4444", margin:0 }}>{errors.coverLetter}</p>
                  : <span />
                }
                <span style={{ fontSize:12, color: charCount > 50 ? "#16a34a" : "#9ca3af" }}>{charCount} characters</span>
              </div>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, marginBottom:8 }}>
              <div>
                <label style={lbl}>
                  Proposed Budget ($) <span style={{ color:"#ef4444" }}>*</span>
                </label>
                <div style={{ position:"relative" }}>
                  <span style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", color:"#64748b", fontWeight:600 }}>$</span>
                  <input style={{ ...inp, paddingLeft:26, borderColor: budget ? "#7c3aed" : "#e2e8f0" }} type="number" min="1" placeholder="5000" value={budget} onChange={e => setBudget(e.target.value)} />
                </div>
                {errors.budget && <p style={{ fontSize:12, color:"#ef4444", marginTop:4 }}>{errors.budget}</p>}
              </div>
              <div>
                <label style={lbl}>
                  Delivery Time <span style={{ color:"#ef4444" }}>*</span>
                </label>
                <input style={{ ...inp, borderColor: deliveryTime ? "#7c3aed" : "#e2e8f0" }} type="text" placeholder="e.g. 2 weeks, 10 days" value={deliveryTime} onChange={e => setDeliveryTime(e.target.value)} />
                {errors.deliveryTime && <p style={{ fontSize:12, color:"#ef4444", marginTop:4 }}>{errors.deliveryTime}</p>}
              </div>
            </div>

            <div style={{ paddingTop:24, marginTop:16, borderTop:"1px solid #f1f5f9" }}>
              <button onClick={handleSubmit} disabled={loading}
                style={{ width:"100%", padding:14, background: loading ? "#cbd5e1" : "linear-gradient(135deg,#7c3aed,#a855f7)", color:"white", border:"none", borderRadius:10, cursor: loading ? "not-allowed" : "pointer", fontWeight:700, fontSize:15, boxShadow: loading ? "none" : "0 4px 15px rgba(124,58,237,0.4)", transition:"all 0.2s" }}>
                {loading ? "Submitting..." : "🚀 Submit Proposal →"}
              </button>
            </div>
          </div>

          {/* Tips Panel */}
          <div style={{ display:"flex", flexDirection:"column", gap:16, position:"sticky", top:80 }}>
            <div style={{ backgroundColor:"#fff", borderRadius:16, padding:24, boxShadow:"0 1px 3px rgba(0,0,0,0.06)", border:"1px solid #e2e8f0" }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:16 }}>
                <span style={{ fontSize:18 }}>💡</span>
                <h3 style={{ fontSize:14, fontWeight:700, color:"#111827", margin:0 }}>Tips for Winning</h3>
              </div>
              {[
                { icon:"✍️", text:"Personalize your cover letter for each project" },
                { icon:"💰", text:"Set a competitive but fair budget" },
                { icon:"⚡", text:"Apply early — first proposals get more attention" },
                { icon:"📋", text:"Mention specific skills relevant to the project" },
                { icon:"🤝", text:"Show enthusiasm and professionalism" },
              ].map((t, i) => (
                <div key={i} style={{ display:"flex", gap:10, marginBottom:12, fontSize:13, color:"#374151", lineHeight:1.5 }}>
                  <span style={{ flexShrink:0 }}>{t.icon}</span>
                  {t.text}
                </div>
              ))}
            </div>

            <div style={{ background:"linear-gradient(135deg,#2d1b69,#7c3aed)", borderRadius:16, padding:24, color:"white" }}>
              <h3 style={{ fontSize:14, fontWeight:700, margin:"0 0 12px" }}>📊 Proposal Stats</h3>
              {[
                { label:"Avg Response Time", val:"24 hrs" },
                { label:"Acceptance Rate",   val:"~35%" },
                { label:"Avg Proposals/Job", val:"12-15" },
              ].map((s, i) => (
                <div key={i} style={{ display:"flex", justifyContent:"space-between", marginBottom:10, padding:"8px 12px", backgroundColor:"rgba(255,255,255,0.1)", borderRadius:8 }}>
                  <span style={{ fontSize:12, color:"rgba(255,255,255,0.75)" }}>{s.label}</span>
                  <span style={{ fontSize:13, fontWeight:700, color:"white" }}>{s.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const lbl = { display:"block", fontSize:13, fontWeight:600, color:"#374151", marginBottom:6 };
const inp = { width:"100%", padding:"10px 14px", border:"1.5px solid #e2e8f0", borderRadius:10, fontSize:14, outline:"none", fontFamily:"inherit", backgroundColor:"#fff", boxSizing:"border-box", transition:"border-color 0.2s" };
>>>>>>> main-group-A
