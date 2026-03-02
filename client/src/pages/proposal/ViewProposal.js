import { useEffect, useState, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../utils/api";
import { AuthContext } from "../../context/AuthContext";

const NAV = [
  { icon:"⊞",  label:"Dashboard",    path:"/client/dashboard" },
  { icon:"➕", label:"Post Project",  path:"/client/post-project" },
  { icon:"📁", label:"My Projects",   path:"/client/projects", active:true },
  { icon:"💬", label:"Messages",      path:"/client/messages" },
];

function Sidebar({ onNavigate }) {
  return (
    <div style={{ width:240, backgroundColor:"#fff", borderRight:"1px solid #e5e7eb", position:"fixed", top:0, left:0, height:"100vh", display:"flex", flexDirection:"column", padding:"24px 0", zIndex:100 }}>
      <div style={{ display:"flex", alignItems:"center", gap:10, padding:"0 24px 24px", borderBottom:"1px solid #e5e7eb", marginBottom:12 }}>
        <div style={{ width:36, height:36, background:"linear-gradient(135deg,#2563eb,#3b82f6)", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontSize:18 }}>💼</div>
        <span style={{ fontWeight:700, fontSize:18, color:"#2563eb" }}>TalentLink</span>
      </div>
      {NAV.map(n => (
        <div key={n.label}
          onClick={() => onNavigate(n.path)}
          style={{
            display:"flex", alignItems:"center", gap:12, padding:"10px 24px", cursor:"pointer", fontSize:14,
            fontWeight: n.active ? 700 : 500,
            color: n.active ? "#2563eb" : "#6b7280",
            backgroundColor: n.active ? "#eff6ff" : "transparent",
            borderLeft: n.active ? "3px solid #2563eb" : "3px solid transparent",
          }}>
          <span>{n.icon}</span><span>{n.label}</span>
        </div>
      ))}
    </div>
  );
}

function Badge({ status }) {
  const map = {
    pending:  { bg:"#fff7ed", color:"#ea580c" },
    accepted: { bg:"#dcfce7", color:"#16a34a" },
    rejected: { bg:"#fee2e2", color:"#dc2626" },
  };
  const c = map[status] || map.pending;
  return (
    <span style={{ padding:"4px 14px", borderRadius:20, fontSize:12, fontWeight:600, backgroundColor:c.bg, color:c.color, textTransform:"capitalize" }}>
      {status}
    </span>
  );
}

export default function ViewProposals() {
  const { projectId } = useParams();
  const { user, role, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading]     = useState(true);

  if (!user) {
    return (
      <div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:"100vh", fontFamily:"'Segoe UI',sans-serif" }}>
        <div style={{ backgroundColor:"#fff7ed", border:"1px solid #fed7aa", borderRadius:12, padding:24, color:"#c2410c", fontSize:14 }}>
          ⚠️ You must be logged in.{" "}
          <span style={{ textDecoration:"underline", cursor:"pointer" }} onClick={() => navigate("/client/login")}>Login here</span>
        </div>
      </div>
    );
  }

  const load = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/proposals/project/${projectId}`);
      setProposals(res.data);
    } catch { alert("Error loading proposals."); }
    finally { setLoading(false); }
  };

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => { if (projectId) load(); }, [projectId]);

  const accept = async (id) => { try { await api.put(`/proposals/${id}/accept`); load(); } catch { alert("Error accepting."); } };
  const reject = async (id) => { try { await api.put(`/proposals/${id}/reject`); load(); } catch { alert("Error rejecting."); } };

  const counts = {
    total:    proposals.length,
    pending:  proposals.filter(p => p.status === "pending").length,
    accepted: proposals.filter(p => p.status === "accepted").length,
    rejected: proposals.filter(p => p.status === "rejected").length,
  };

  return (
    <div style={{ display:"flex", minHeight:"100vh", backgroundColor:"#f0f2f5", fontFamily:"'Segoe UI',sans-serif" }}>
      <Sidebar onNavigate={navigate} />

      <div style={{ marginLeft:240, flex:1, display:"flex", flexDirection:"column" }}>
        {/* Top navbar */}
        <div style={{ backgroundColor:"#fff", padding:"16px 32px", display:"flex", justifyContent:"space-between", alignItems:"center", borderBottom:"1px solid #e5e7eb" }}>
          <span style={{ fontSize:18, fontWeight:700, color:"#111827" }}>Proposals</span>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ textAlign:"right" }}>
              <div style={{ fontWeight:600, fontSize:14, color:"#111827" }}>{user.name}</div>
              <div style={{ fontSize:12, color:"#6b7280", textTransform:"capitalize" }}>{role}</div>
            </div>
            <button onClick={() => { logout(); navigate("/"); }}
              style={{ padding:"8px 16px", border:"1px solid #e5e7eb", borderRadius:8, cursor:"pointer", fontSize:13, color:"#374151", background:"white" }}>
              Logout
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding:32 }}>
          <button onClick={() => navigate(-1)} style={{ background:"none", border:"none", fontSize:14, color:"#6b7280", cursor:"pointer", padding:0, marginBottom:20 }}>
            ← Back to Projects
          </button>
          <h1 style={{ fontSize:26, fontWeight:700, color:"#111827", marginBottom:4 }}>Proposals for Project #{projectId}</h1>
          <p style={{ fontSize:14, color:"#6b7280", marginBottom:24 }}>{counts.total} proposal{counts.total !== 1 ? "s" : ""} received</p>

          {/* Stats */}
          <div style={{ backgroundColor:"#fff", borderRadius:12, padding:"20px 28px", marginBottom:28, boxShadow:"0 1px 4px rgba(0,0,0,0.07)", display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16 }}>
            {[
              { label:"Total",    val:counts.total,    color:"#111827" },
              { label:"Pending",  val:counts.pending,  color:"#ea580c" },
              { label:"Accepted", val:counts.accepted, color:"#16a34a" },
              { label:"Rejected", val:counts.rejected, color:"#ef4444" },
            ].map(s => (
              <div key={s.label}>
                <div style={{ fontSize:13, color:"#6b7280" }}>{s.label}</div>
                <div style={{ fontSize:22, fontWeight:700, color:s.color, marginTop:4 }}>{s.val}</div>
              </div>
            ))}
          </div>

          {loading && <p style={{ color:"#6b7280" }}>Loading proposals...</p>}

          {!loading && proposals.length === 0 && (
            <div style={{ backgroundColor:"#fff", borderRadius:12, padding:"60px 32px", textAlign:"center", boxShadow:"0 1px 4px rgba(0,0,0,0.07)" }}>
              <div style={{ fontSize:48, marginBottom:12 }}>📭</div>
              <p style={{ color:"#6b7280", fontSize:15 }}>No proposals received yet for this project.</p>
            </div>
          )}

          {proposals.map(p => (
            <div key={p.id} style={{ backgroundColor:"#fff", borderRadius:12, padding:24, marginBottom:16, boxShadow:"0 1px 4px rgba(0,0,0,0.07)" }}>
              
              {/* Header */}
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
                <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                  <div style={{ width:44, height:44, borderRadius:"50%", background:"linear-gradient(135deg,#7c3aed,#a855f7)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:18, color:"white" }}>
                    {String(p.freelancer_id).charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontWeight:700, fontSize:15, color:"#111827" }}>Freelancer #{p.freelancer_id}</div>
                    <div style={{ fontSize:13, color:"#6b7280", marginTop:2 }}>Proposal #{p.id}</div>
                  </div>
                </div>
                <Badge status={p.status} />
              </div>

              {/* Cover Letter */}
              {p.cover_letter && (
                <>
                  <div style={{ fontWeight:600, fontSize:13, color:"#374151", marginBottom:6 }}>Cover Letter</div>
                  <div style={{ fontSize:14, color:"#374151", lineHeight:1.7, backgroundColor:"#f9fafb", padding:"12px", borderRadius:8 }}>{p.cover_letter}</div>
                </>
              )}

              {/* Meta */}
              <div style={{ display:"flex", gap:32, marginTop:16, paddingTop:16, borderTop:"1px solid #f3f4f6" }}>
                <div style={{ fontSize:13, color:"#6b7280" }}>Budget <strong style={{ display:"block", color:"#111827", marginTop:2 }}>${p.proposed_budget}</strong></div>
                <div style={{ fontSize:13, color:"#6b7280" }}>Delivery <strong style={{ display:"block", color:"#111827", marginTop:2 }}>{p.delivery_time}</strong></div>
                {p.created_at && <div style={{ fontSize:13, color:"#6b7280" }}>Submitted <strong style={{ display:"block", color:"#111827", marginTop:2 }}>{new Date(p.created_at).toLocaleDateString()}</strong></div>}
              </div>

              {/* Actions - only for pending */}
              {p.status === "pending" && (
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginTop:16 }}>
                  <button onClick={() => accept(p.id)}
                    style={{ padding:11, background:"linear-gradient(135deg,#16a34a,#22c55e)", color:"white", border:"none", borderRadius:8, cursor:"pointer", fontWeight:600, fontSize:14 }}>
                    ✓ Accept Proposal
                  </button>
                  <button onClick={() => reject(p.id)}
                    style={{ padding:11, backgroundColor:"#ef4444", color:"white", border:"none", borderRadius:8, cursor:"pointer", fontWeight:600, fontSize:14 }}>
                    ✕ Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
