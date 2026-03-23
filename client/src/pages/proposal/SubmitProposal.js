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
