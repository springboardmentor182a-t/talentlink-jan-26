import { useEffect, useState, useContext } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import api from "../../utils/api";
import { AuthContext } from "../../context/AuthContext";

function Badge({ status }) {
  const map = {
    pending:  { bg:"#fff7ed", color:"#ea580c", border:"#fed7aa" },
    accepted: { bg:"#f0fdf4", color:"#16a34a", border:"#86efac" },
    rejected: { bg:"#fef2f2", color:"#dc2626", border:"#fca5a5" },
  };
  const c = map[status] || map.pending;
  return (
    <span style={{ padding:"5px 14px", borderRadius:20, fontSize:12, fontWeight:700, backgroundColor:c.bg, color:c.color, border:`1px solid ${c.border}`, textTransform:"capitalize" }}>
      {status}
    </span>
  );
}

export default function ProposalTracking() {
  const { user, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    if (!user) return;
    api.get(`/proposals/freelancer/${user.id}`)
      .then(res => setProposals(res.data))
      .catch(err => console.error("Proposals error:", err.response?.data || err.message))
      .finally(() => setLoading(false));
  }, [user]);

  if (authLoading) return <div style={{ padding:32, color:"var(--text-muted)" }}>Loading...</div>;
  if (!user) return <Navigate to="/freelancer/login" replace />;

  const counts = {
    pending:  proposals.filter(p => p.status === "pending").length,
    accepted: proposals.filter(p => p.status === "accepted").length,
    rejected: proposals.filter(p => p.status === "rejected").length,
  };

  return (
    <div style={{ fontFamily:"'Segoe UI',sans-serif" }}>

      {/* Hero */}
      <div style={{ background:"linear-gradient(135deg,#3b0764 0%,#7c3aed 40%,#a855f7 100%)", padding:"24px 16px", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:-40, right:-40, width:180, height:180, borderRadius:"50%", background:"rgba(255,255,255,0.05)" }} />
        <div style={{ display:"inline-flex", alignItems:"center", gap:8, backgroundColor:"rgba(255,255,255,0.15)", borderRadius:20, padding:"4px 14px", fontSize:12, color:"white", fontWeight:600, marginBottom:10 }}>
          📄 My Proposals
        </div>
        <h1 style={{ fontSize:28, fontWeight:800, color:"white", margin:"0 0 6px", letterSpacing:"-0.5px" }}>Proposal Tracking</h1>
        <p style={{ fontSize:14, color:"rgba(255,255,255,0.75)", margin:0 }}>Monitor the status of all your submitted proposals</p>
      </div>

      <div style={{ padding:"20px 16px" }}>

        {/* Stats Cards */}
        <div style={{ display:"grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap:16, marginBottom:28 }}>
          {[
            { label:"Pending",  val:counts.pending,  color:"#d97706", bg:"#fffbeb", icon:"⏳" },
            { label:"Accepted", val:counts.accepted, color:"#16a34a", bg:"#f0fdf4", icon:"✅" },
            { label:"Rejected", val:counts.rejected, color:"#dc2626", bg:"#fef2f2", icon:"❌" },
          ].map(s => (
            <div key={s.label} style={{ backgroundColor:"var(--card)" /* TODO-DARK */, borderRadius:16, padding:"22px 24px", display:"flex", justifyContent:"space-between", alignItems:"center", boxShadow:"0 1px 3px rgba(0,0,0,0.06)", border:"1px solid var(--border)" }}>
              <div>
                <div style={{ fontSize:12, color:"var(--text-muted)", marginBottom:6, textTransform:"uppercase", letterSpacing:"0.5px" }}>{s.label}</div>
                <div style={{ fontSize:32, fontWeight:800, color:s.color }}>{s.val}</div>
              </div>
              <div style={{ width:48, height:48, borderRadius:14, backgroundColor:s.bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:24 }}>{s.icon}</div>
            </div>
          ))}
        </div>

        {loading && <p style={{ color:"var(--text-muted)" }}>Loading proposals...</p>}

        {!loading && proposals.length === 0 && (
          <div style={{ backgroundColor:"var(--card)" /* TODO-DARK */, borderRadius:16, padding:"60px 32px", textAlign:"center", boxShadow:"0 1px 3px rgba(0,0,0,0.06)", border:"1px solid var(--border)" }}>
            <div style={{ fontSize:56, marginBottom:16 }}>📄</div>
            <h3 style={{ fontSize:18, fontWeight:700, color:"var(--text-primary)", marginBottom:8 }}>No proposals yet</h3>
            <p style={{ color:"var(--text-muted)", fontSize:14, marginBottom:20 }}>Browse projects and submit your first proposal!</p>
            <button onClick={() => navigate("/freelancer/browse")}
              style={{ padding:"12px 28px", background:"linear-gradient(135deg,#7c3aed,#a855f7)", color:"white", border:"none", borderRadius:10, cursor:"pointer", fontWeight:600, fontSize:14, boxShadow:"0 4px 12px rgba(124,58,237,0.3)" }}>
              Browse Projects →
            </button>
          </div>
        )}

        {proposals.map(p => {
          const projectTitle = p.project_title || `Project #${p.project_id}`;
          const initials = projectTitle.charAt(0).toUpperCase();
          return (
            <div key={p.id} style={{ backgroundColor:"var(--card)" /* TODO-DARK */, borderRadius:16, padding:24, marginBottom:16, boxShadow:"0 1px 3px rgba(0,0,0,0.06)", border:"1px solid var(--border)" }}
              onMouseEnter={e => e.currentTarget.style.boxShadow="0 4px 16px rgba(0,0,0,0.1)"}
              onMouseLeave={e => e.currentTarget.style.boxShadow="0 1px 3px rgba(0,0,0,0.06)"}>

              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
                <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                  <div style={{ width:44, height:44, borderRadius:14, background:"linear-gradient(135deg,#7c3aed,#a855f7)", display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontWeight:700, fontSize:16, boxShadow:"0 4px 12px rgba(124,58,237,0.3)" }}>
                    {initials}
                  </div>
                  <div>
                    <div style={{ fontWeight:700, fontSize:15, color:"var(--text-primary)" }}>{projectTitle}</div>
                    <div style={{ fontSize:12, color:"var(--text-muted)", marginTop:2 }}>
                      Submitted {p.created_at ? new Date(p.created_at).toLocaleDateString() : "—"}
                    </div>
                  </div>
                </div>
                <Badge status={p.status} />
              </div>

              {p.cover_letter && (
                <div style={{ fontSize:14, color:"var(--text-secondary)", lineHeight:1.8, backgroundColor:"var(--page-bg)", padding:"14px 16px", borderRadius:10, marginBottom:14, border:"1px solid var(--border)" }}>
                  {p.cover_letter}
                </div>
              )}

              <div style={{ display:"flex", gap:24, paddingTop:14, borderTop:"1px solid var(--border-light)" }}>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <div style={{ width:32, height:32, borderRadius:8, backgroundColor:"#f5f3ff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>💰</div>
                  <div>
                    <div style={{ fontSize:11, color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:"0.5px" }}>Budget</div>
                    <strong style={{ color:"var(--text-primary)", fontSize:14 }}>${p.proposed_budget}</strong>
                  </div>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <div style={{ width:32, height:32, borderRadius:8, backgroundColor:"#f0fdf4", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>🕐</div>
                  <div>
                    <div style={{ fontSize:11, color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:"0.5px" }}>Delivery</div>
                    <strong style={{ color:"var(--text-primary)", fontSize:14 }}>{p.delivery_time}</strong>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}