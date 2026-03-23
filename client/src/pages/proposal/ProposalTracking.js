import { useEffect, useState, useContext } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import api from "../../utils/api";
import { AuthContext } from "../../context/AuthContext";

// ── SVG Icons ───────────────────────────────────────────────────────────────
const PendingIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
);
const AcceptedIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);
const RejectedIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="15" y1="9" x2="9" y2="15"/>
    <line x1="9" y1="9" x2="15" y2="15"/>
  </svg>
);
const EmptyIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
  </svg>
);

function Badge({ status }) {
  const map = {
    pending:  { bg: "#fff7ed", color: "#ea580c" },
    accepted: { bg: "#dcfce7", color: "#16a34a" },
    rejected: { bg: "#fee2e2", color: "#dc2626" },
  };
  const c = map[status] || map.pending;
  return (
    <span style={{ padding: "4px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600, backgroundColor: c.bg, color: c.color, textTransform: "capitalize" }}>
      {status}
    </span>
  );
}

export default function ProposalTracking() {
  const { user, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [projectId, setProjectId] = useState("");

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    api.get(`/proposals/freelancer/${user.id}`)
      .then(res => setProposals(res.data))
      .catch(err => console.error("Proposals error:", err.response?.data || err.message))
      .finally(() => setLoading(false));
  }, [user]);

  if (authLoading) return <div style={{ padding: 32, color: "#6b7280" }}>Loading...</div>;
  if (!user) return <Navigate to="/freelancer/login" replace />;

  const counts = {
    pending:  proposals.filter(p => p.status?.toLowerCase() === "pending").length,
    accepted: proposals.filter(p => p.status?.toLowerCase() === "accepted").length,
    rejected: proposals.filter(p => p.status?.toLowerCase() === "rejected").length,
  };

  const handleGoToProject = () => {
    if (!projectId || isNaN(projectId) || Number(projectId) <= 0) {
      alert("Please enter a valid Project ID");
      return;
    }
    navigate(`/submit-proposal/${projectId}`);
  };

  return (
    <div style={{ padding: "32px", maxWidth: "1200px", margin: "0 auto", fontFamily: "'Segoe UI', sans-serif" }}>
      <h1 style={{ fontSize: 26, fontWeight: 700, color: "#111827", marginBottom: 4 }}>Proposal Tracking</h1>
      <p style={{ fontSize: 14, color: "#6b7280", marginBottom: 28 }}>Monitor the status of all your submitted proposals</p>

      {/* Submit by Project ID Quickbox */}
      <div style={{ backgroundColor: "#fff", borderRadius: 12, padding: "20px 24px", marginBottom: 28, boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: "#374151", marginBottom: 12 }}>📝 Submit a Proposal for a Project</div>
        <div style={{ display: "flex", gap: 12 }}>
          <input
            type="number" min="1"
            placeholder="Enter Project ID (e.g. 1, 2, 3...)"
            value={projectId}
            onChange={e => setProjectId(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleGoToProject()}
            style={{ flex: 1, padding: "10px 14px", border: "1.5px solid #e5e7eb", borderRadius: 8, fontSize: 14, backgroundColor: "#f9fafb", outline: "none" }}
          />
          <button onClick={handleGoToProject}
            style={{ padding: "10px 24px", background: "linear-gradient(135deg,#7c3aed,#a855f7)", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 14 }}>
            Go →
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 28 }}>
        {[
          { label: "Pending",  val: counts.pending,  icon: <PendingIcon />  },
          { label: "Accepted", val: counts.accepted, icon: <AcceptedIcon /> },
          { label: "Rejected", val: counts.rejected, icon: <RejectedIcon /> },
        ].map(s => (
          <div key={s.label} style={{ backgroundColor: "#fff", borderRadius: 12, padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
            <div>
              <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 6 }}>{s.label}</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: "#111827" }}>{s.val}</div>
            </div>
            {s.icon}
          </div>
        ))}
      </div>

      {loading && <p style={{ color: "#6b7280" }}>Loading proposals...</p>}

      {!loading && proposals.length === 0 && (
        <div style={{ backgroundColor: "#fff", borderRadius: 12, padding: "60px 32px", textAlign: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}><EmptyIcon /></div>
          <p style={{ color: "#6b7280", fontSize: 15 }}>No proposals yet. Browse projects and submit your first proposal!</p>
        </div>
      )}

      {proposals.map(p => (
        <div key={p.id} style={{ backgroundColor: "#fff", borderRadius: 12, padding: 24, marginBottom: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={{ fontSize: 15, fontWeight: 600, color: "#111827" }}>Project #{p.project_id}</span>
            <Badge status={p.status?.toLowerCase()} />
          </div>
          {p.cover_letter && (
            <div style={{ fontSize: 14, color: "#374151", lineHeight: 1.7, backgroundColor: "#f9fafb", padding: "10px 12px", borderRadius: 8, marginBottom: 8 }}>
              {p.cover_letter}
            </div>
          )}
          <div style={{ display: "flex", gap: 28, paddingTop: 14, borderTop: "1px solid #f3f4f6" }}>
            <div style={{ fontSize: 13, color: "#6b7280" }}>Budget <strong style={{ display: "block", color: "#111827", marginTop: 2 }}>${p.proposed_budget || p.bid_amount}</strong></div>
            <div style={{ fontSize: 13, color: "#6b7280" }}>Delivery <strong style={{ display: "block", color: "#111827", marginTop: 2 }}>{p.delivery_time || 'N/A'}</strong></div>
            {p.created_at && <div style={{ fontSize: 13, color: "#6b7280" }}>Submitted <strong style={{ display: "block", color: "#111827", marginTop: 2 }}>{new Date(p.created_at).toLocaleDateString()}</strong></div>}
          </div>
        </div>
      ))}
    </div>
  );
}
