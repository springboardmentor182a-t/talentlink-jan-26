import { useEffect, useState, useContext } from "react";
import { useNavigate, useParams, Navigate } from "react-router-dom";
import api from "../../utils/api";
import { AuthContext } from "../../context/AuthContext";

export default function ViewProposals() {
  const { projectId } = useParams();
  const { user, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [proposals, setProposals]       = useState([]);
  const [project, setProject]           = useState(null);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState("");
  const [matchScores, setMatchScores]   = useState({});
  const [matchLoading, setMatchLoading] = useState({});
  const [rankings, setRankings]         = useState([]);
  const [rankLoading, setRankLoading]   = useState(false);
  const [showRanked, setShowRanked]     = useState(false);

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

  const checkMatchScore = async (freelancerId) => {
    setMatchLoading(prev => ({ ...prev, [freelancerId]: true }));
    try {
      const token = localStorage.getItem("token");
      const res = await api.get(`/ai/match-score-client/${projectId}/${freelancerId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMatchScores(prev => ({ ...prev, [freelancerId]: res.data }));
    } catch (err) {
      console.error("Match score error:", err.message);
    } finally {
      setMatchLoading(prev => ({ ...prev, [freelancerId]: false }));
    }
  };

  const rankAllProposals = async () => {
    setRankLoading(true);
    setShowRanked(false);
    try {
      const token = localStorage.getItem("token");
      const res = await api.get(`/ai/rank-proposals/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRankings(res.data);
      setShowRanked(true);
    } catch (err) {
      console.error("Ranking error:", err.message);
    } finally {
      setRankLoading(false);
    }
  };

  if (authLoading) return <div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:"60vh" }}><p>Loading...</p></div>;
  if (!user) return <Navigate to="/client/login" replace />;

  const counts = {
    total:    proposals.length,
    pending:  proposals.filter(p => p.status === "pending").length,
    accepted: proposals.filter(p => p.status === "accepted").length,
    rejected: proposals.filter(p => p.status === "rejected").length,
  };

  const getRankInfo = (proposalId) => rankings.find(r => r.id === proposalId);

  return (
    <div style={{ fontFamily:"'Segoe UI',sans-serif", backgroundColor:"var(--page-bg)", minHeight:"100vh" }}>

      {/* Back link */}
      <div style={{ padding:"16px 32px 0" }}>
        <button onClick={() => navigate("/projects")}
          style={{ background:"none", border:"none", fontSize:14, color:"var(--text-muted)", cursor:"pointer", display:"flex", alignItems:"center", gap:6, padding:"6px 0" }}
          onMouseEnter={e => e.currentTarget.style.color="#2563eb"}
          onMouseLeave={e => e.currentTarget.style.color="#64748b"}>
          ← Back to Projects
        </button>
      </div>

      {/* Hero */}
      <div style={{ background:"linear-gradient(135deg,#1e3a5f 0%,#2563eb 50%,#3b82f6 100%)", padding:"20px 16px", margin:"16px 32px 0", borderRadius:16, position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:-40, right:-40, width:180, height:180, borderRadius:"50%", background:"rgba(255,255,255,0.05)" }} />
        <div style={{ display:"inline-flex", alignItems:"center", gap:8, backgroundColor:"rgba(255,255,255,0.15)", borderRadius:20, padding:"4px 14px", fontSize:12, color:"white", fontWeight:600, marginBottom:10 }}>
          📋 Proposals
        </div>
        <h1 style={{ fontSize:26, fontWeight:800, color:"white", margin:"0 0 4px", letterSpacing:"-0.5px" }}>
          {project?.title || `Project #${projectId}`}
        </h1>
        <p style={{ fontSize:14, color:"rgba(255,255,255,0.75)", margin:0 }}>
          {counts.total} proposal{counts.total !== 1 ? "s" : ""} received
        </p>
      </div>

      <div style={{ padding:"20px 16px" }}>

        {/* Stats */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(130px, 1fr))", gap:16, marginBottom:24 }}>
          {[
            { label:"Total",    val:counts.total,    color:"#4f46e5", bg:"var(--tint-purple)", icon:"📋" },
            { label:"Pending",  val:counts.pending,  color:"#d97706", bg:"#fffbeb", icon:"⏳" },
            { label:"Accepted", val:counts.accepted, color:"#16a34a", bg:"var(--tint-green)", icon:"✅" },
            { label:"Rejected", val:counts.rejected, color:"#dc2626", bg:"#fef2f2", icon:"❌" },
          ].map(s => (
            <div key={s.label} style={{ backgroundColor:"var(--card)" /* TODO-DARK */, borderRadius:12, padding:"20px 24px", boxShadow:"0 1px 3px rgba(0,0,0,0.06)", border:"1px solid var(--border)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div>
                <div style={{ fontSize:12, color:"var(--text-muted)", marginBottom:4, textTransform:"uppercase", letterSpacing:"0.5px" }}>{s.label}</div>
                <div style={{ fontSize:28, fontWeight:800, color:s.color }}>{s.val}</div>
              </div>
              <div style={{ width:44, height:44, borderRadius:12, backgroundColor:s.bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22 }}>{s.icon}</div>
            </div>
          ))}
        </div>

        {/* Project Details */}
        {project && (
          <div style={{ backgroundColor:"var(--card)" /* TODO-DARK */, borderRadius:12, padding:"24px 28px", marginBottom:24, boxShadow:"0 1px 3px rgba(0,0,0,0.06)", border:"1px solid var(--border)" }}>
            <h3 style={{ fontSize:12, fontWeight:700, color:"var(--text-muted)", marginBottom:16, textTransform:"uppercase", letterSpacing:"0.5px" }}>Project Details</h3>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(120px, 1fr))", gap:16, alignItems:"start" }}>
              <div>
                <div style={{ fontSize:11, color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:4 }}>Budget</div>
                <div style={{ fontSize:18, fontWeight:700, color:"var(--text-primary)" }}>${project.budget}</div>
              </div>
              <div>
                <div style={{ fontSize:11, color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:4 }}>Deadline</div>
                <div style={{ fontSize:18, fontWeight:700, color:"var(--text-primary)" }}>{project.deadline}</div>
              </div>
              <div>
                <div style={{ fontSize:11, color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:6 }}>Skills</div>
                {project.skills ? (
                  <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                    {project.skills.split(",").map(s => (
                      <span key={s} style={{ padding:"4px 12px", background:"linear-gradient(135deg,#eff6ff,#f5f3ff)", color:"#2563eb", borderRadius:20, fontSize:12, fontWeight:600, border:"1px solid #bfdbfe" }}>
                        {s.trim()}
                      </span>
                    ))}
                  </div>
                ) : <span style={{ fontSize:14, color:"var(--text-muted)" }}>No skills specified</span>}
              </div>
              <div>
                <div style={{ fontSize:11, color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:6 }}>Status</div>
                <span style={{ padding:"6px 16px", borderRadius:20, fontSize:12, fontWeight:700, background:"linear-gradient(135deg,#2563eb,#3b82f6)", color:"white" }}>
                  {project.status}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ✅ AI RANK ALL BUTTON */}
        {proposals.length > 1 && (
          <div style={{ backgroundColor:"var(--card)" /* TODO-DARK */, borderRadius:12, padding:"20px 24px", marginBottom:24, boxShadow:"0 1px 3px rgba(0,0,0,0.06)", border:"1px solid var(--border)", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div>
              <div style={{ fontWeight:700, fontSize:15, color:"var(--text-primary)" }}>📋 AI Proposal Ranking</div>
              <div style={{ fontSize:13, color:"var(--text-muted)", marginTop:2 }}>Let AI rank all proposals by best fit for your project</div>
            </div>
            <button onClick={rankAllProposals} disabled={rankLoading}
              style={{ padding:"10px 24px", background:"linear-gradient(135deg,#7c3aed,#a855f7)", color:"white", border:"none", borderRadius:10, cursor:"pointer", fontWeight:700, fontSize:14, boxShadow:"0 2px 8px rgba(124,58,237,0.3)", opacity: rankLoading ? 0.7 : 1 }}>
              {rankLoading ? "⏳ Ranking..." : "🤖 Rank All Proposals"}
            </button>
          </div>
        )}

        {/* ✅ RANKED RESULTS */}
        {showRanked && rankings.length > 0 && (
          <div style={{ backgroundColor:"var(--nav-active-bg)", borderRadius:16, padding:24, marginBottom:24, border:"1px solid #ddd6fe" }}>
            <div style={{ fontSize:15, fontWeight:700, color:"#7c3aed", marginBottom:16 }}>🏆 AI Proposal Rankings</div>
            {rankings.map((r, i) => (
              <div key={r.id} style={{ display:"flex", alignItems:"center", gap:16, padding:"14px 16px", backgroundColor:"var(--card)" /* TODO-DARK */, borderRadius:12, border:`2px solid ${i === 0 ? "#f59e0b" : i === 1 ? "#94a3b8" : i === 2 ? "#b45309" : "#e2e8f0"}`, marginBottom:10 }}>
                <div style={{ width:40, height:40, borderRadius:12, background: i === 0 ? "linear-gradient(135deg,#f59e0b,#fbbf24)" : i === 1 ? "linear-gradient(135deg,#94a3b8,#cbd5e1)" : i === 2 ? "linear-gradient(135deg,#b45309,#d97706)" : "linear-gradient(135deg,#e2e8f0,#f1f5f9)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:18, color:"white" }}>
                  {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${r.rank}`}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700, fontSize:14, color:"var(--text-primary)" }}>{r.freelancer_name}</div>
                  <div style={{ fontSize:12, color:"var(--text-muted)", marginTop:2 }}>{r.reason}</div>
                  <div style={{ display:"flex", gap:12, marginTop:6 }}>
                    <span style={{ fontSize:11, color: r.budget_fit === "good" ? "#16a34a" : r.budget_fit === "fair" ? "#d97706" : "#dc2626", fontWeight:600 }}>
                      💰 Budget: {r.budget_fit}
                    </span>
                    <span style={{ fontSize:11, color: r.delivery_fit === "good" ? "#16a34a" : r.delivery_fit === "fair" ? "#d97706" : "#dc2626", fontWeight:600 }}>
                      🕐 Delivery: {r.delivery_fit}
                    </span>
                  </div>
                </div>
                <div style={{ fontSize:24, fontWeight:800, color:"#7c3aed" }}>{r.score}%</div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div style={{ backgroundColor:"#fef2f2", border:"1.5px solid #fca5a5", borderRadius:10, padding:"12px 16px", fontSize:13, color:"#b91c1c", marginBottom:16 }}>
            ⚠️ {error}
          </div>
        )}

        {loading && <p style={{ color:"var(--text-muted)" }}>Loading proposals...</p>}

        {!loading && proposals.length === 0 && (
          <div style={{ backgroundColor:"var(--card)" /* TODO-DARK */, borderRadius:16, padding:"60px 32px", textAlign:"center", boxShadow:"0 1px 3px rgba(0,0,0,0.06)", border:"1px solid var(--border)" }}>
            <div style={{ fontSize:56, marginBottom:16 }}>📭</div>
            <h3 style={{ fontSize:18, fontWeight:700, color:"var(--text-primary)", marginBottom:8 }}>No proposals yet</h3>
            <p style={{ color:"var(--text-muted)", fontSize:14 }}>Freelancers haven't applied to this project yet.</p>
          </div>
        )}

        {proposals.map(p => {
          const freelancerName = p.freelancer_name || `Freelancer #${p.freelancer_id}`;
          const rankInfo = getRankInfo(p.id);
          return (
            <div key={p.id} style={{ backgroundColor:"var(--card)" /* TODO-DARK */, borderRadius:16, padding:24, marginBottom:16, boxShadow:"0 1px 3px rgba(0,0,0,0.06)", border: rankInfo?.rank === 1 ? "2px solid #f59e0b" : "1px solid #e2e8f0" }}
              onMouseEnter={e => e.currentTarget.style.boxShadow="0 4px 16px rgba(0,0,0,0.1)"}
              onMouseLeave={e => e.currentTarget.style.boxShadow="0 1px 3px rgba(0,0,0,0.06)"}>

              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16 }}>
                <div style={{ display:"flex", alignItems:"center", gap:14 }}>
                  <div style={{ width:52, height:52, borderRadius:16, background:"linear-gradient(135deg,#2563eb,#3b82f6)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:20, color:"white", boxShadow:"0 4px 12px rgba(37,99,235,0.3)" }}>
                    {freelancerName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight:700, fontSize:16, color:"var(--text-primary)" }}>{freelancerName}</div>
                    <div style={{ fontSize:12, color:"var(--text-muted)", marginTop:3 }}>Freelancer</div>
                  </div>
                </div>
                <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                  {rankInfo && (
                    <span style={{ padding:"4px 12px", borderRadius:20, fontSize:12, fontWeight:700, backgroundColor:"var(--nav-active-bg)", color:"#7c3aed", border:"1px solid #ddd6fe" }}>
                      #{rankInfo.rank} — {rankInfo.score}%
                    </span>
                  )}
                  <span style={{
                    padding:"6px 16px", borderRadius:20, fontSize:12, fontWeight:700,
                    background: p.status==="pending" ? "linear-gradient(135deg,#f8fafc,#f1f5f9)" : p.status==="accepted" ? "linear-gradient(135deg,#f0fdf4,#dcfce7)" : "linear-gradient(135deg,#fef2f2,#fee2e2)",
                    color: p.status==="pending" ? "#374151" : p.status==="accepted" ? "#166534" : "#dc2626",
                    border:`1px solid ${p.status==="pending" ? "#e2e8f0" : p.status==="accepted" ? "#86efac" : "#fca5a5"}`
                  }}>
                    {p.status}
                  </span>
                </div>
              </div>

              {p.cover_letter && (
                <div style={{ marginBottom:16 }}>
                  <div style={{ fontSize:12, fontWeight:700, color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:8 }}>Cover Letter</div>
                  <div style={{ fontSize:14, color:"var(--text-secondary)", lineHeight:1.8, backgroundColor:"var(--page-bg)", padding:"16px", borderRadius:10, border:"1px solid var(--border)" }}>
                    {p.cover_letter}
                  </div>
                </div>
              )}

              <div style={{ display:"flex", gap:24, paddingTop:16, borderTop:"1px solid var(--border-light)" }}>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <div style={{ width:36, height:36, borderRadius:10, backgroundColor:"var(--nav-active-bg)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>💰</div>
                  <div>
                    <div style={{ fontSize:11, color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:"0.5px" }}>Proposed Budget</div>
                    <strong style={{ color:"var(--text-primary)", fontSize:15 }}>${p.proposed_budget}</strong>
                  </div>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <div style={{ width:36, height:36, borderRadius:10, backgroundColor:"var(--nav-active-bg)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>🕐</div>
                  <div>
                    <div style={{ fontSize:11, color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:"0.5px" }}>Delivery Time</div>
                    <strong style={{ color:"var(--text-primary)", fontSize:15 }}>{p.delivery_time}</strong>
                  </div>
                </div>
                {p.created_at && (
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <div style={{ width:36, height:36, borderRadius:10, backgroundColor:"var(--nav-active-bg)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>📅</div>
                    <div>
                      <div style={{ fontSize:11, color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:"0.5px" }}>Submitted</div>
                      <strong style={{ color:"var(--text-primary)", fontSize:15 }}>{new Date(p.created_at).toLocaleDateString()}</strong>
                    </div>
                  </div>
                )}
              </div>

              {p.status === "pending" && (
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginTop:20 }}>
                  <button onClick={() => accept(p.id)}
                    style={{ padding:"12px", background:"linear-gradient(135deg,#16a34a,#22c55e)", color:"white", border:"none", borderRadius:10, cursor:"pointer", fontWeight:700, fontSize:14, boxShadow:"0 4px 12px rgba(22,163,74,0.3)" }}>
                    ✓ Accept Proposal
                  </button>
                  <button onClick={() => reject(p.id)}
                    style={{ padding:"12px", background:"linear-gradient(135deg,#ef4444,#dc2626)", color:"white", border:"none", borderRadius:10, cursor:"pointer", fontWeight:700, fontSize:14, boxShadow:"0 4px 12px rgba(239,68,68,0.3)" }}>
                    ✕ Reject
                  </button>
                </div>
              )}

              {/* ✅ AI MATCH SCORE BUTTON */}
              <button onClick={() => checkMatchScore(p.freelancer_id)}
                disabled={matchLoading[p.freelancer_id]}
                style={{ width:"100%", padding:"12px", marginTop:12, backgroundColor:"var(--card)" /* TODO-DARK */, color:"#2563eb", border:"1.5px solid #2563eb", borderRadius:10, cursor:"pointer", fontWeight:600, fontSize:14, opacity: matchLoading[p.freelancer_id] ? 0.7 : 1 }}>
                {matchLoading[p.freelancer_id] ? "⏳ Analyzing..." : "🤖 Check AI Match Score"}
              </button>

              {/* ✅ AI MATCH SCORE RESULT */}
              {matchScores[p.freelancer_id] && (
                <div style={{ marginTop:12, padding:16, backgroundColor:"var(--nav-active-bg)", borderRadius:12, border:"1px solid #bfdbfe" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:10 }}>
                    <div style={{ fontSize:32, fontWeight:800, color:"#2563eb" }}>{matchScores[p.freelancer_id].score}%</div>
                    <div>
                      <div style={{ fontSize:13, fontWeight:700, color:"var(--text-primary)" }}>AI Match Score</div>
                      <div style={{ fontSize:12, color:"var(--text-muted)" }}>{matchScores[p.freelancer_id].summary}</div>
                    </div>
                  </div>
                  {matchScores[p.freelancer_id].matching_skills?.length > 0 && (
                    <div style={{ marginBottom:6 }}>
                      <span style={{ fontSize:12, fontWeight:600, color:"#16a34a" }}>✅ Matching: </span>
                      <span style={{ fontSize:12, color:"var(--text-secondary)" }}>{matchScores[p.freelancer_id].matching_skills.join(", ")}</span>
                    </div>
                  )}
                  {matchScores[p.freelancer_id].missing_skills?.length > 0 && (
                    <div>
                      <span style={{ fontSize:12, fontWeight:600, color:"#dc2626" }}>❌ Missing: </span>
                      <span style={{ fontSize:12, color:"var(--text-secondary)" }}>{matchScores[p.freelancer_id].missing_skills.join(", ")}</span>
                    </div>
                  )}
                </div>
              )}

            </div>
          );
        })}
      </div>
    </div>
  );
}