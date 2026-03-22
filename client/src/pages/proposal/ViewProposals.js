import { useEffect, useState, useContext } from "react";
import { useNavigate, useParams, Navigate } from "react-router-dom";
import api from "../../utils/api";
import { AuthContext } from "../../context/AuthContext";

export default function ViewProposals() {
  const { projectId } = useParams();
  const { user, logout, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [proposals, setProposals] = useState([]);
  const [project, setProject]     = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [searchId, setSearchId]   = useState(projectId || "");

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get(`/proposals/project/${projectId}`);
      setProposals(res.data);
      try {
        const projRes = await api.get(`/projects/${projectId}`);
        setProject(projRes.data);
      } catch {}
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(typeof detail === "string" ? detail : Array.isArray(detail) ? detail[0]?.msg || "Error loading proposals." : "Error loading proposals.");
    } finally { setLoading(false); }
  };

  useEffect(() => { if (projectId && user) load(); }, [projectId, user]);

  const accept = async (id) => {
    try { await api.put(`/proposals/${id}/accept`); load(); }
    catch (err) { console.error("Accept error:", err.response?.data || err.message); }
  };

  const reject = async (id) => {
    try { await api.put(`/proposals/${id}/reject`); load(); }
    catch (err) { console.error("Reject error:", err.response?.data || err.message); }
  };

  const handleSearch = () => {
    if (!searchId || isNaN(searchId) || Number(searchId) <= 0) { alert("Please enter a valid Project ID"); return; }
    navigate(`/view-proposals/${searchId}`);
  };

  if (authLoading) return <div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:"100vh" }}><p>Loading...</p></div>;
  if (!user) return <Navigate to="/client/login" replace />;

  const counts = {
    total:    proposals.length,
    pending:  proposals.filter(p => p.status === "pending").length,
    accepted: proposals.filter(p => p.status === "accepted").length,
    rejected: proposals.filter(p => p.status === "rejected").length,
  };

  return (
    <div style={{ fontFamily:"'Segoe UI',sans-serif", backgroundColor:"#f8fafc", minHeight:"100vh" }}>

      {/* Topbar */}
      <div style={{ backgroundColor:"#fff", padding:"0 32px", display:"flex", justifyContent:"space-between", alignItems:"center", borderBottom:"1px solid #e2e8f0", height:64, position:"sticky", top:0, zIndex:100, boxShadow:"0 1px 3px rgba(0,0,0,0.05)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <button onClick={() => navigate("/projects")}
            style={{ background:"none", border:"none", fontSize:14, color:"#64748b", cursor:"pointer", display:"flex", alignItems:"center", gap:6, padding:"6px 12px", borderRadius:8 }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor="#f1f5f9"}
            onMouseLeave={e => e.currentTarget.style.backgroundColor="transparent"}>
            ← Back to Projects
          </button>
          <div style={{ width:1, height:24, backgroundColor:"#e2e8f0" }} />
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ width:8, height:8, borderRadius:"50%", background:"linear-gradient(135deg,#2563eb,#7c3aed)" }} />
            <span style={{ fontSize:15, fontWeight:700, color:"#111827" }}>Proposals</span>
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:16 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, backgroundColor:"#f8fafc", padding:"6px 14px", borderRadius:20, border:"1px solid #e2e8f0" }}>
            <div style={{ width:32, height:32, borderRadius:"50%", background:"linear-gradient(135deg,#2563eb,#7c3aed)", display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontWeight:700, fontSize:13 }}>
              {(user?.name || "C").charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight:600, fontSize:13, color:"#111827" }}>{user?.name}</div>
              <div style={{ fontSize:11, color:"#64748b" }}>Client</div>
            </div>
          </div>
          <button onClick={() => { logout(); navigate("/"); }}
            style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 16px", border:"1px solid #e2e8f0", borderRadius:8, cursor:"pointer", fontSize:13, color:"#64748b", background:"white" }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Logout
          </button>
        </div>
      </div>

      {/* Hero */}
      <div style={{ background:"linear-gradient(135deg,#1e3a5f 0%,#2563eb 50%,#7c3aed 100%)", padding:"32px 32px", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:-40, right:-40, width:180, height:180, borderRadius:"50%", background:"rgba(255,255,255,0.05)" }} />
        <div style={{ display:"inline-flex", alignItems:"center", gap:8, backgroundColor:"rgba(255,255,255,0.15)", borderRadius:20, padding:"4px 14px", fontSize:12, color:"white", fontWeight:600, marginBottom:10 }}>
          📋 Proposals
        </div>
        <h1 style={{ fontSize:28, fontWeight:800, color:"white", margin:"0 0 6px", letterSpacing:"-0.5px" }}>
          {project?.title || `Project #${projectId}`}
        </h1>
        <p style={{ fontSize:14, color:"rgba(255,255,255,0.75)", margin:0 }}>
          {counts.total} proposal{counts.total !== 1 ? "s" : ""} received
        </p>
      </div>

      <div style={{ padding:32 }}>

        {/* Stats Cards */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:24 }}>
          {[
            { label:"Total",    val:counts.total,    color:"#4f46e5", bg:"#f5f3ff", icon:"📋" },
            { label:"Pending",  val:counts.pending,  color:"#d97706", bg:"#fffbeb", icon:"⏳" },
            { label:"Accepted", val:counts.accepted, color:"#16a34a", bg:"#f0fdf4", icon:"✅" },
            { label:"Rejected", val:counts.rejected, color:"#dc2626", bg:"#fef2f2", icon:"❌" },
          ].map(s => (
            <div key={s.label} style={{ backgroundColor:"#fff", borderRadius:12, padding:"20px 24px", boxShadow:"0 1px 3px rgba(0,0,0,0.06)", border:"1px solid #e2e8f0", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div>
                <div style={{ fontSize:12, color:"#64748b", marginBottom:4, textTransform:"uppercase", letterSpacing:"0.5px" }}>{s.label}</div>
                <div style={{ fontSize:28, fontWeight:800, color:s.color }}>{s.val}</div>
              </div>
              <div style={{ width:44, height:44, borderRadius:12, backgroundColor:s.bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22 }}>{s.icon}</div>
            </div>
          ))}
        </div>

        {/* Project Details */}
        {project && (
          <div style={{ backgroundColor:"#fff", borderRadius:12, padding:"24px 28px", marginBottom:24, boxShadow:"0 1px 3px rgba(0,0,0,0.06)", border:"1px solid #e2e8f0" }}>
            <h3 style={{ fontSize:12, fontWeight:700, color:"#64748b", marginBottom:16, textTransform:"uppercase", letterSpacing:"0.5px" }}>Project Details</h3>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 2fr 1fr", gap:16, alignItems:"start" }}>
              <div>
                <div style={{ fontSize:11, color:"#64748b", textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:4 }}>Budget</div>
                <div style={{ fontSize:18, fontWeight:700, color:"#111827" }}>${project.budget}</div>
              </div>
              <div>
                <div style={{ fontSize:11, color:"#64748b", textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:4 }}>Duration</div>
                <div style={{ fontSize:18, fontWeight:700, color:"#111827" }}>{project.deadline}</div>
              </div>
              <div>
                <div style={{ fontSize:11, color:"#64748b", textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:6 }}>Skills</div>
                {project.skills ? (
                  <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                    {project.skills.split(",").map(s => (
                      <span key={s} style={{ padding:"4px 12px", background:"linear-gradient(135deg,#eff6ff,#f5f3ff)", color:"#4f46e5", borderRadius:20, fontSize:12, fontWeight:600, border:"1px solid #e0e7ff" }}>
                        {s.trim()}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span style={{ fontSize:14, color:"#64748b" }}>No skills specified</span>
                )}
              </div>
              <div>
                <div style={{ fontSize:11, color:"#64748b", textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:6 }}>Status</div>
                <span style={{ padding:"6px 16px", borderRadius:20, fontSize:12, fontWeight:700, background:"linear-gradient(135deg,#2563eb,#7c3aed)", color:"white" }}>
                  {project.status}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Switch Project */}
        <div style={{ backgroundColor:"#fff", borderRadius:12, padding:"20px 24px", marginBottom:24, boxShadow:"0 1px 3px rgba(0,0,0,0.06)", border:"1px solid #e2e8f0" }}>
          <div style={{ fontSize:13, fontWeight:600, color:"#374151", marginBottom:10 }}>🔍 Switch Project</div>
          <div style={{ display:"flex", gap:12 }}>
            <input type="number" min="1" placeholder="Enter Project ID..."
              value={searchId} onChange={e => setSearchId(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSearch()}
              style={{ flex:1, padding:"10px 14px", border:"1.5px solid #e2e8f0", borderRadius:8, fontSize:14, backgroundColor:"#f8fafc", outline:"none" }} />
            <button onClick={handleSearch}
              style={{ padding:"10px 24px", background:"linear-gradient(135deg,#2563eb,#7c3aed)", color:"white", border:"none", borderRadius:8, cursor:"pointer", fontWeight:600, fontSize:14 }}>
              View →
            </button>
          </div>
        </div>

        {error && (
          <div style={{ backgroundColor:"#fef2f2", border:"1.5px solid #fca5a5", borderRadius:10, padding:"12px 16px", fontSize:13, color:"#b91c1c", marginBottom:16 }}>
            ⚠️ {error}
          </div>
        )}

        {loading && <p style={{ color:"#64748b" }}>Loading proposals...</p>}

        {!loading && proposals.length === 0 && (
          <div style={{ backgroundColor:"#fff", borderRadius:16, padding:"60px 32px", textAlign:"center", boxShadow:"0 1px 3px rgba(0,0,0,0.06)", border:"1px solid #e2e8f0" }}>
            <div style={{ fontSize:56, marginBottom:16 }}>📭</div>
            <h3 style={{ fontSize:18, fontWeight:700, color:"#111827", marginBottom:8 }}>No proposals yet</h3>
            <p style={{ color:"#64748b", fontSize:14 }}>Freelancers haven't applied to this project yet.</p>
          </div>
        )}

        {proposals.map(p => (
          <div key={p.id} style={{ backgroundColor:"#fff", borderRadius:16, padding:24, marginBottom:16, boxShadow:"0 1px 3px rgba(0,0,0,0.06)", border:"1px solid #e2e8f0" }}
            onMouseEnter={e => e.currentTarget.style.boxShadow="0 4px 16px rgba(0,0,0,0.1)"}
            onMouseLeave={e => e.currentTarget.style.boxShadow="0 1px 3px rgba(0,0,0,0.06)"}>

            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16 }}>
              <div style={{ display:"flex", alignItems:"center", gap:14 }}>
                <div style={{ width:52, height:52, borderRadius:16, background:"linear-gradient(135deg,#2563eb,#7c3aed)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:20, color:"white", boxShadow:"0 4px 12px rgba(37,99,235,0.3)" }}>
                  {String(p.freelancer_id).charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight:700, fontSize:16, color:"#111827" }}>Freelancer #{p.freelancer_id}</div>
                  <div style={{ fontSize:13, color:"#64748b", marginTop:3 }}>
                    <span style={{ color:"#f59e0b" }}>★★★★★</span> Proposal #{p.id}
                  </div>
                </div>
              </div>
              <span style={{
                padding:"6px 16px", borderRadius:20, fontSize:12, fontWeight:700,
                background:
                  p.status==="pending"  ? "linear-gradient(135deg,#f8fafc,#f1f5f9)" :
                  p.status==="accepted" ? "linear-gradient(135deg,#f0fdf4,#dcfce7)" :
                                          "linear-gradient(135deg,#fef2f2,#fee2e2)",
                color:
                  p.status==="pending"  ? "#374151" :
                  p.status==="accepted" ? "#166534" : "#dc2626",
                border:`1px solid ${p.status==="pending" ? "#e2e8f0" : p.status==="accepted" ? "#86efac" : "#fca5a5"}`
              }}>
                {p.status}
              </span>
            </div>

            {p.cover_letter && (
              <div style={{ marginBottom:16 }}>
                <div style={{ fontSize:12, fontWeight:700, color:"#64748b", textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:8 }}>Cover Letter</div>
                <div style={{ fontSize:14, color:"#374151", lineHeight:1.8, backgroundColor:"#f8fafc", padding:"16px", borderRadius:10, border:"1px solid #e2e8f0" }}>
                  {p.cover_letter}
                </div>
              </div>
            )}

            <div style={{ display:"flex", gap:24, paddingTop:16, borderTop:"1px solid #f1f5f9" }}>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ width:36, height:36, borderRadius:10, backgroundColor:"#eff6ff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>💰</div>
                <div>
                  <div style={{ fontSize:11, color:"#64748b", textTransform:"uppercase", letterSpacing:"0.5px" }}>Proposed Budget</div>
                  <strong style={{ color:"#111827", fontSize:15 }}>${p.proposed_budget}</strong>
                </div>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ width:36, height:36, borderRadius:10, backgroundColor:"#f0fdf4", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>🕐</div>
                <div>
                  <div style={{ fontSize:11, color:"#64748b", textTransform:"uppercase", letterSpacing:"0.5px" }}>Delivery Time</div>
                  <strong style={{ color:"#111827", fontSize:15 }}>{p.delivery_time}</strong>
                </div>
              </div>
              {p.created_at && (
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <div style={{ width:36, height:36, borderRadius:10, backgroundColor:"#fdf4ff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>📅</div>
                  <div>
                    <div style={{ fontSize:11, color:"#64748b", textTransform:"uppercase", letterSpacing:"0.5px" }}>Submitted</div>
                    <strong style={{ color:"#111827", fontSize:15 }}>{new Date(p.created_at).toLocaleDateString()}</strong>
                  </div>
                </div>
              )}
            </div>

            {p.status === "pending" && (
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginTop:20 }}>
                <button onClick={() => accept(p.id)}
                  style={{ padding:"12px", background:"linear-gradient(135deg,#16a34a,#22c55e)", color:"white", border:"none", borderRadius:10, cursor:"pointer", fontWeight:700, fontSize:14, display:"flex", alignItems:"center", justifyContent:"center", gap:8, boxShadow:"0 4px 12px rgba(22,163,74,0.3)" }}>
                  ✓ Accept Proposal
                </button>
                <button onClick={() => reject(p.id)}
                  style={{ padding:"12px", background:"linear-gradient(135deg,#ef4444,#dc2626)", color:"white", border:"none", borderRadius:10, cursor:"pointer", fontWeight:700, fontSize:14, display:"flex", alignItems:"center", justifyContent:"center", gap:8, boxShadow:"0 4px 12px rgba(239,68,68,0.3)" }}>
                  ✕ Reject
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}