import { useEffect, useState, useContext, useCallback } from "react";
import { useNavigate, useParams, Navigate } from "react-router-dom";
import api from "../../utils/api";
import { AuthContext } from "../../context/AuthContext";

export default function ViewProposals() {
  const { projectId } = useParams();
  const { user, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();

  const [proposals,    setProposals]    = useState([]);
  const [project,      setProject]      = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState("");
  const [freelancers,  setFreelancers]  = useState({});
  const [expanded,     setExpanded]     = useState({});
  const [matchScores,  setMatchScores]  = useState({});
  const [matchLoading, setMatchLoading] = useState({});
  const [rankings,     setRankings]     = useState([]);
  const [rankLoading,  setRankLoading]  = useState(false);
  const [showRanked,   setShowRanked]   = useState(false);

  // ✅ useCallback so it can be safely added to useEffect deps
  const load = useCallback(async () => {
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
      setError(typeof detail === "string" ? detail : "Error loading proposals.");
    } finally { setLoading(false); }
  }, [projectId]); // ✅ only projectId as dependency

  // ✅ No more warning — load is stable via useCallback
  useEffect(() => { if (projectId && user) load(); }, [projectId, user, load]);

  const fetchFreelancerProfile = async (freelancerId) => {
    if (freelancers[freelancerId]) return;
    try {
      const res = await api.get(`/profile/${freelancerId}/full`);
      setFreelancers(prev => ({ ...prev, [freelancerId]: res.data }));
    } catch {
      setFreelancers(prev => ({ ...prev, [freelancerId]: null }));
    }
  };

  const toggleProfile = async (freelancerId) => {
    const isOpen = expanded[freelancerId];
    setExpanded(prev => ({ ...prev, [freelancerId]: !isOpen }));
    if (!isOpen) await fetchFreelancerProfile(freelancerId);
  };

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
      const res = await api.get(`/ai/match-score-client/${projectId}/${freelancerId}`);
      setMatchScores(prev => ({ ...prev, [freelancerId]: res.data }));
    } catch (err) { console.error("Match score error:", err.message); }
    finally { setMatchLoading(prev => ({ ...prev, [freelancerId]: false })); }
  };

  const rankAllProposals = async () => {
    setRankLoading(true);
    setShowRanked(false);
    try {
      const res = await api.get(`/ai/rank-proposals/${projectId}`);
      setRankings(res.data);
      setShowRanked(true);
    } catch (err) { console.error("Ranking error:", err.message); }
    finally { setRankLoading(false); }
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
    <div style={{ fontFamily:"'Segoe UI',sans-serif", backgroundColor:"#f8fafc", minHeight:"100vh" }}>

      <div style={{ padding:"16px 32px 0" }}>
        <button onClick={() => navigate("/projects")}
          style={{ background:"none", border:"none", fontSize:14, color:"#64748b", cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}
          onMouseEnter={e => e.currentTarget.style.color="#2563eb"}
          onMouseLeave={e => e.currentTarget.style.color="#64748b"}>
          ← Back to Projects
        </button>
      </div>

      {/* Hero */}
      <div style={{ background:"linear-gradient(135deg,#1e3a5f 0%,#2563eb 50%,#3b82f6 100%)", padding:"28px 32px", margin:"16px 32px 0", borderRadius:16, position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:-40, right:-40, width:180, height:180, borderRadius:"50%", background:"rgba(255,255,255,0.05)" }} />
        <div style={{ display:"inline-flex", alignItems:"center", gap:8, backgroundColor:"rgba(255,255,255,0.15)", borderRadius:20, padding:"4px 14px", fontSize:12, color:"white", fontWeight:600, marginBottom:10 }}>📋 Proposals</div>
        <h1 style={{ fontSize:26, fontWeight:800, color:"white", margin:"0 0 4px" }}>{project?.title || `Project #${projectId}`}</h1>
        <p style={{ fontSize:14, color:"rgba(255,255,255,0.75)", margin:0 }}>{counts.total} proposal{counts.total !== 1 ? "s" : ""} received</p>
      </div>

      <div style={{ padding:32 }}>

        {/* Stats */}
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
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 2fr 1fr", gap:16 }}>
              <div><div style={sLabel}>Budget</div><div style={{ fontSize:18, fontWeight:700, color:"#111827" }}>${project.budget}</div></div>
              <div><div style={sLabel}>Deadline</div><div style={{ fontSize:18, fontWeight:700, color:"#111827" }}>{project.deadline}</div></div>
              <div>
                <div style={sLabel}>Skills</div>
                {project.skills ? (
                  <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                    {project.skills.split(",").map(s => (
                      <span key={s} style={{ padding:"4px 12px", background:"linear-gradient(135deg,#eff6ff,#dbeafe)", color:"#2563eb", borderRadius:20, fontSize:12, fontWeight:600, border:"1px solid #bfdbfe" }}>{s.trim()}</span>
                    ))}
                  </div>
                ) : <span style={{ fontSize:14, color:"#64748b" }}>No skills specified</span>}
              </div>
              <div>
                <div style={sLabel}>Status</div>
                <span style={{ padding:"6px 16px", borderRadius:20, fontSize:12, fontWeight:700, background:"linear-gradient(135deg,#2563eb,#3b82f6)", color:"white" }}>{project.status}</span>
              </div>
            </div>
          </div>
        )}

        {/* AI Rank */}
        {proposals.length > 1 && (
          <div style={{ backgroundColor:"#fff", borderRadius:12, padding:"20px 24px", marginBottom:24, boxShadow:"0 1px 3px rgba(0,0,0,0.06)", border:"1px solid #e2e8f0", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div>
              <div style={{ fontWeight:700, fontSize:15, color:"#111827" }}>🤖 AI Proposal Ranking</div>
              <div style={{ fontSize:13, color:"#64748b", marginTop:2 }}>Let AI rank all proposals by best fit</div>
            </div>
            <button onClick={rankAllProposals} disabled={rankLoading}
              style={{ padding:"10px 24px", background:"linear-gradient(135deg,#7c3aed,#a855f7)", color:"white", border:"none", borderRadius:10, cursor:"pointer", fontWeight:700, fontSize:14, opacity:rankLoading ? 0.7 : 1 }}>
              {rankLoading ? "⏳ Ranking..." : "🤖 Rank All Proposals"}
            </button>
          </div>
        )}

        {/* Rankings */}
        {showRanked && rankings.length > 0 && (
          <div style={{ backgroundColor:"#faf5ff", borderRadius:16, padding:24, marginBottom:24, border:"1px solid #ddd6fe" }}>
            <div style={{ fontSize:15, fontWeight:700, color:"#7c3aed", marginBottom:16 }}>🏆 AI Proposal Rankings</div>
            {rankings.map((r, i) => (
              <div key={r.id} style={{ display:"flex", alignItems:"center", gap:16, padding:"14px 16px", backgroundColor:"#fff", borderRadius:12, border:`2px solid ${i===0?"#f59e0b":i===1?"#94a3b8":i===2?"#b45309":"#e2e8f0"}`, marginBottom:10 }}>
                <div style={{ width:40, height:40, borderRadius:12, background:i===0?"linear-gradient(135deg,#f59e0b,#fbbf24)":i===1?"linear-gradient(135deg,#94a3b8,#cbd5e1)":i===2?"linear-gradient(135deg,#b45309,#d97706)":"linear-gradient(135deg,#e2e8f0,#f1f5f9)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:18, color:"white" }}>
                  {i===0?"🥇":i===1?"🥈":i===2?"🥉":`#${r.rank}`}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700, fontSize:14, color:"#111827" }}>{r.freelancer_name}</div>
                  <div style={{ fontSize:12, color:"#64748b", marginTop:2 }}>{r.reason}</div>
                </div>
                <div style={{ fontSize:24, fontWeight:800, color:"#7c3aed" }}>{r.score}%</div>
              </div>
            ))}
          </div>
        )}

        {error && <div style={{ backgroundColor:"#fef2f2", border:"1.5px solid #fca5a5", borderRadius:10, padding:"12px 16px", fontSize:13, color:"#b91c1c", marginBottom:16 }}>⚠️ {error}</div>}
        {loading && <p style={{ color:"#64748b" }}>Loading proposals...</p>}

        {!loading && proposals.length === 0 && (
          <div style={{ backgroundColor:"#fff", borderRadius:16, padding:"60px 32px", textAlign:"center", boxShadow:"0 1px 3px rgba(0,0,0,0.06)", border:"1px solid #e2e8f0" }}>
            <div style={{ fontSize:56, marginBottom:16 }}>📭</div>
            <h3 style={{ fontSize:18, fontWeight:700, color:"#111827", marginBottom:8 }}>No proposals yet</h3>
            <p style={{ color:"#64748b", fontSize:14 }}>Freelancers haven't applied yet.</p>
          </div>
        )}

        {proposals.map(p => {
          const freelancerName = p.freelancer_name || `Freelancer #${p.freelancer_id}`;
          const rankInfo       = getRankInfo(p.id);
          const fp             = freelancers[p.freelancer_id];
          const isExpanded     = expanded[p.freelancer_id];
          const skillList      = (fp?.skills || "").split(",").map(s => s.trim()).filter(Boolean);

          return (
            <div key={p.id} style={{ backgroundColor:"#fff", borderRadius:16, padding:24, marginBottom:16, boxShadow:"0 1px 3px rgba(0,0,0,0.06)", border: rankInfo?.rank===1 ? "2px solid #f59e0b" : "1px solid #e2e8f0" }}
              onMouseEnter={e => e.currentTarget.style.boxShadow="0 4px 16px rgba(0,0,0,0.1)"}
              onMouseLeave={e => e.currentTarget.style.boxShadow="0 1px 3px rgba(0,0,0,0.06)"}>

              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16 }}>
                <div style={{ display:"flex", alignItems:"center", gap:14 }}>
                  <div style={{ width:52, height:52, borderRadius:16, background:"linear-gradient(135deg,#2563eb,#3b82f6)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:20, color:"white", boxShadow:"0 4px 12px rgba(37,99,235,0.3)" }}>
                    {freelancerName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight:700, fontSize:16, color:"#111827" }}>{freelancerName}</div>
                    {fp?.title && <div style={{ fontSize:13, color:"#2563eb", fontWeight:600, marginTop:1 }}>{fp.title}</div>}
                    <div style={{ fontSize:12, color:"#64748b", marginTop:2, display:"flex", gap:10, flexWrap:"wrap" }}>
                      {fp?.location   && <span>📍 {fp.location}</span>}
                      {fp?.experience && <span>💼 {fp.experience}</span>}
                      {fp?.avg_rating && <span>⭐ {fp.avg_rating}/5 ({fp.total_reviews} reviews)</span>}
                    </div>
                  </div>
                </div>
                <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                  {rankInfo && (
                    <span style={{ padding:"4px 12px", borderRadius:20, fontSize:12, fontWeight:700, backgroundColor:"#faf5ff", color:"#7c3aed", border:"1px solid #ddd6fe" }}>
                      #{rankInfo.rank} — {rankInfo.score}%
                    </span>
                  )}
                  <span style={{
                    padding:"6px 16px", borderRadius:20, fontSize:12, fontWeight:700,
                    background: p.status==="pending" ? "linear-gradient(135deg,#f8fafc,#f1f5f9)" : p.status==="accepted" ? "linear-gradient(135deg,#f0fdf4,#dcfce7)" : "linear-gradient(135deg,#fef2f2,#fee2e2)",
                    color: p.status==="pending" ? "#374151" : p.status==="accepted" ? "#166534" : "#dc2626",
                    border:`1px solid ${p.status==="pending"?"#e2e8f0":p.status==="accepted"?"#86efac":"#fca5a5"}`
                  }}>{p.status}</span>
                </div>
              </div>

              {p.cover_letter && (
                <div style={{ marginBottom:16 }}>
                  <div style={{ fontSize:12, fontWeight:700, color:"#64748b", textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:8 }}>Cover Letter</div>
                  <div style={{ fontSize:14, color:"#374151", lineHeight:1.8, backgroundColor:"#f8fafc", padding:"16px", borderRadius:10, border:"1px solid #e2e8f0" }}>{p.cover_letter}</div>
                </div>
              )}

              <div style={{ display:"flex", gap:24, paddingTop:16, borderTop:"1px solid #f1f5f9", marginBottom:16 }}>
                <StatBox icon="💰" label="Proposed Budget" value={`$${p.proposed_budget}`} />
                <StatBox icon="🕐" label="Delivery Time"   value={p.delivery_time} />
                {p.created_at && <StatBox icon="📅" label="Submitted" value={new Date(p.created_at).toLocaleDateString()} />}
              </div>

              {/* Toggle Profile */}
              <button onClick={() => toggleProfile(p.freelancer_id)}
                style={{ width:"100%", padding:"10px", marginBottom: isExpanded ? 16 : 0, backgroundColor:"#f8fafc", color:"#2563eb", border:"1.5px solid #bfdbfe", borderRadius:10, cursor:"pointer", fontWeight:600, fontSize:13, display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                {isExpanded ? "▲ Hide Freelancer Profile" : "👤 View Freelancer Profile"}
              </button>

              {/* Freelancer Profile Panel */}
              {isExpanded && (
                <div style={{ backgroundColor:"#f0f9ff", borderRadius:12, padding:20, marginBottom:16, border:"1px solid #bae6fd" }}>
                  {fp === undefined ? (
                    <p style={{ color:"#64748b", fontSize:13 }}>⏳ Loading profile...</p>
                  ) : fp === null ? (
                    <p style={{ color:"#64748b", fontSize:13 }}>Profile not available.</p>
                  ) : (
                    <>
                      {/* Freelancer hero with stats */}
                      <div style={{ background:"linear-gradient(135deg,#1e3a5f,#2563eb,#3b82f6)", borderRadius:12, padding:20, marginBottom:16 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:16 }}>
                          <div style={{ width:56, height:56, borderRadius:"50%", background:"rgba(255,255,255,0.2)", display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontWeight:800, fontSize:22 }}>
                            {fp.name?.charAt(0).toUpperCase()}
                          </div>
                          <div style={{ flex:1 }}>
                            <div style={{ fontWeight:700, fontSize:16, color:"white" }}>{fp.name}</div>
                            {fp.title && <div style={{ fontSize:13, color:"rgba(255,255,255,0.8)", fontWeight:600 }}>{fp.title}</div>}
                            <div style={{ fontSize:12, color:"rgba(255,255,255,0.65)", marginTop:2, display:"flex", gap:10, flexWrap:"wrap" }}>
                              {fp.location   && <span>📍 {fp.location}</span>}
                              {fp.experience && <span>💼 {fp.experience}</span>}
                              {fp.availability && <span>🟢 {fp.availability}</span>}
                            </div>
                          </div>
                          <div style={{ display:"flex", gap:6 }}>
                            {fp.linkedin  && <a href={fp.linkedin}  target="_blank" rel="noreferrer" style={{ fontSize:11, color:"white", fontWeight:600, textDecoration:"none", padding:"4px 8px", border:"1px solid rgba(255,255,255,0.3)", borderRadius:6 }}>🔗 LinkedIn</a>}
                            {fp.github    && <a href={fp.github}    target="_blank" rel="noreferrer" style={{ fontSize:11, color:"white", fontWeight:600, textDecoration:"none", padding:"4px 8px", border:"1px solid rgba(255,255,255,0.3)", borderRadius:6 }}>⚡ GitHub</a>}
                            {fp.portfolio && <a href={fp.portfolio} target="_blank" rel="noreferrer" style={{ fontSize:11, color:"white", fontWeight:600, textDecoration:"none", padding:"4px 8px", border:"1px solid rgba(255,255,255,0.3)", borderRadius:6 }}>🌐 Portfolio</a>}
                          </div>
                        </div>

                        {/* Stats Row */}
                        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8 }}>
                          {[
                            { icon:"⭐", label:"Avg Rating",      val: fp.avg_rating ? `${fp.avg_rating}/5` : "—" },
                            { icon:"💬", label:"Reviews",          val: fp.total_reviews ?? 0 },
                            { icon:"✅", label:"Completed Jobs",   val: fp.completed_projects ?? 0 },
                            { icon:"🔄", label:"Active Proposals", val: fp.active_projects ?? 0 },
                          ].map((s,i) => (
                            <div key={i} style={{ backgroundColor:"rgba(255,255,255,0.12)", borderRadius:10, padding:"10px 8px", textAlign:"center" }}>
                              <div style={{ fontSize:18 }}>{s.icon}</div>
                              <div style={{ fontSize:15, fontWeight:800, color:"white", marginTop:2 }}>{s.val}</div>
                              <div style={{ fontSize:10, color:"rgba(255,255,255,0.65)", marginTop:1 }}>{s.label}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {fp.bio && (
                        <div style={{ marginBottom:14 }}>
                          <div style={profileSectionLabel}>Summary</div>
                          <p style={{ fontSize:13, color:"#374151", lineHeight:1.7, margin:0 }}>{fp.bio}</p>
                        </div>
                      )}

                      {skillList.length > 0 && (
                        <div style={{ marginBottom:14 }}>
                          <div style={profileSectionLabel}>Skills</div>
                          <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                            {skillList.map(s => (
                              <span key={s} style={{ padding:"3px 12px", background:"#eff6ff", color:"#2563eb", borderRadius:20, fontSize:12, fontWeight:600, border:"1px solid #bfdbfe" }}>{s}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginBottom:14 }}>
                        {fp.education       && <ProfileInfo icon="🎓" label="Education"      value={fp.education} />}
                        {fp.certifications  && <ProfileInfo icon="📜" label="Certifications" value={fp.certifications} />}
                        {fp.languages       && <ProfileInfo icon="🗣️" label="Languages"      value={fp.languages} />}
                        {fp.expected_salary && <ProfileInfo icon="💰" label="Expected Rate"  value={fp.expected_salary} />}
                        {fp.phone           && <ProfileInfo icon="📞" label="Phone"          value={fp.phone} />}
                        {fp.email           && <ProfileInfo icon="📧" label="Email"          value={fp.email} />}
                      </div>

                      {/* Reviews */}
                      {fp.reviews?.length > 0 && (
                        <div>
                          <div style={profileSectionLabel}>⭐ Reviews ({fp.total_reviews})</div>
                          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                            {fp.reviews.slice(0,3).map((r, i) => (
                              <div key={i} style={{ backgroundColor:"#fff", borderRadius:10, padding:"12px 14px", border:"1px solid #bae6fd" }}>
                                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:5 }}>
                                  <div style={{ fontWeight:600, fontSize:13, color:"#111827" }}>{r.reviewer_name}</div>
                                  <div style={{ display:"flex", gap:2 }}>
                                    {[1,2,3,4,5].map(star => (
                                      <span key={star} style={{ fontSize:13, color: star <= r.rating ? "#f59e0b" : "#e2e8f0" }}>★</span>
                                    ))}
                                  </div>
                                </div>
                                {r.project_name && <div style={{ fontSize:11, color:"#64748b", marginBottom:4 }}>📋 {r.project_name}</div>}
                                <div style={{ fontSize:13, color:"#374151", lineHeight:1.6 }}>{r.comment}</div>
                              </div>
                            ))}
                            {fp.reviews.length > 3 && (
                              <div style={{ fontSize:12, color:"#2563eb", textAlign:"center", fontWeight:600 }}>+{fp.reviews.length - 3} more reviews</div>
                            )}
                          </div>
                        </div>
                      )}

                      {fp.reviews?.length === 0 && (
                        <div style={{ textAlign:"center", padding:"12px 0", color:"#94a3b8", fontSize:13 }}>No reviews yet for this freelancer.</div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Actions */}
              {p.status === "pending" && (
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12 }}>
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

              <button onClick={() => checkMatchScore(p.freelancer_id)} disabled={matchLoading[p.freelancer_id]}
                style={{ width:"100%", padding:"10px", backgroundColor:"#fff", color:"#2563eb", border:"1.5px solid #2563eb", borderRadius:10, cursor:"pointer", fontWeight:600, fontSize:13, opacity:matchLoading[p.freelancer_id] ? 0.7 : 1 }}>
                {matchLoading[p.freelancer_id] ? "⏳ Analyzing..." : "🤖 Check AI Match Score"}
              </button>

              {matchScores[p.freelancer_id] && (
                <div style={{ marginTop:12, padding:16, backgroundColor:"#eff6ff", borderRadius:12, border:"1px solid #bfdbfe" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:10 }}>
                    <div style={{ fontSize:32, fontWeight:800, color:"#2563eb" }}>{matchScores[p.freelancer_id].score}%</div>
                    <div>
                      <div style={{ fontSize:13, fontWeight:700, color:"#111827" }}>AI Match Score</div>
                      <div style={{ fontSize:12, color:"#64748b" }}>{matchScores[p.freelancer_id].summary}</div>
                    </div>
                  </div>
                  {matchScores[p.freelancer_id].matching_skills?.length > 0 && <div style={{ marginBottom:6 }}><span style={{ fontSize:12, fontWeight:600, color:"#16a34a" }}>✅ Matching: </span><span style={{ fontSize:12, color:"#374151" }}>{matchScores[p.freelancer_id].matching_skills.join(", ")}</span></div>}
                  {matchScores[p.freelancer_id].missing_skills?.length > 0 && <div><span style={{ fontSize:12, fontWeight:600, color:"#dc2626" }}>❌ Missing: </span><span style={{ fontSize:12, color:"#374151" }}>{matchScores[p.freelancer_id].missing_skills.join(", ")}</span></div>}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatBox({ icon, label, value }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
      <div style={{ width:36, height:36, borderRadius:10, backgroundColor:"#eff6ff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>{icon}</div>
      <div>
        <div style={{ fontSize:11, color:"#64748b", textTransform:"uppercase", letterSpacing:"0.5px" }}>{label}</div>
        <strong style={{ color:"#111827", fontSize:14 }}>{value}</strong>
      </div>
    </div>
  );
}

function ProfileInfo({ icon, label, value }) {
  return (
    <div style={{ backgroundColor:"#fff", borderRadius:8, padding:"10px 12px", border:"1px solid #bae6fd" }}>
      <div style={{ fontSize:11, color:"#64748b", marginBottom:3 }}>{icon} {label}</div>
      <div style={{ fontSize:12, fontWeight:600, color:"#111827" }}>{value}</div>
    </div>
  );
}

const sLabel = { fontSize:11, color:"#64748b", textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:4 };
const profileSectionLabel = { fontSize:12, fontWeight:700, color:"#64748b", textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:8 };