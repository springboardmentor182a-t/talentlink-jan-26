import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";

export default function BrowseProjects() {
  const navigate = useNavigate();

  const [projects, setProjects]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState("");
  const [budget, setBudget]             = useState("all");
  const [skillInput, setSkillInput]     = useState("");
  const [selected, setSelected]         = useState(null);
  const [matchScores, setMatchScores]   = useState({});
  const [matchLoading, setMatchLoading] = useState({});
  const [clientProfile, setClientProfile]         = useState(null);
  const [clientLoading, setClientLoading]         = useState(false);
  const [showClientProfile, setShowClientProfile] = useState(false);

  useEffect(() => { fetchProjects(); }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await api.get("/projects/open/");
      setProjects(res.data);
    } catch (err) { console.error("Error fetching projects:", err.message); }
    finally { setLoading(false); }
  };

  const filtered = projects.filter(p => {
    const s = search.trim().toLowerCase();
    const matchSearch = s === "" || p.title?.toLowerCase().includes(s) || p.description?.toLowerCase().includes(s);
    const b = Number(p.budget);
    const matchBudget = budget === "all" ? true : budget === "low" ? b < 1000 : budget === "medium" ? b >= 1000 && b <= 5000 : b > 5000;
    const sk = skillInput.trim().toLowerCase();
    const matchSkill = sk === "" || p.skills?.toLowerCase().includes(sk) || p.title?.toLowerCase().includes(sk);
    return matchSearch && matchBudget && matchSkill;
  });

  const clearFilters = () => { setSearch(""); setBudget("all"); setSkillInput(""); };

  const checkMatchScore = async (projectId) => {
    setMatchLoading(prev => ({ ...prev, [projectId]: true }));
    try {
      const token = localStorage.getItem("token");
      const res = await api.get(`/ai/match-score/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMatchScores(prev => ({ ...prev, [projectId]: res.data }));
    } catch (err) { console.error("Match score error:", err.message); }
    finally { setMatchLoading(prev => ({ ...prev, [projectId]: false })); }
  };

  const fetchClientProfile = async (clientId) => {
    if (!clientId) return;
    setClientLoading(true);
    setClientProfile(null);
    setShowClientProfile(true);
    try {
      const res = await api.get(`/profile/${clientId}/full`);
      setClientProfile(res.data);
    } catch (err) {
      console.error("Client profile error:", err.message);
      setClientProfile(null);
    } finally { setClientLoading(false); }
  };

  const closeModal = () => {
    setSelected(null);
    setClientProfile(null);
    setShowClientProfile(false);
  };

  return (
    <div style={{ fontFamily:"'Segoe UI',sans-serif", backgroundColor:"#f8fafc", minHeight:"100vh" }}>

      {/* Hero */}
      <div style={{ background:"linear-gradient(135deg,#3b0764 0%,#7c3aed 40%,#a855f7 100%)", padding:"32px 32px", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:-40, right:-40, width:180, height:180, borderRadius:"50%", background:"rgba(255,255,255,0.05)" }} />
        <div style={{ position:"absolute", bottom:-20, left:200, width:120, height:120, borderRadius:"50%", background:"rgba(255,255,255,0.05)" }} />
        <div style={{ display:"inline-flex", alignItems:"center", gap:8, backgroundColor:"rgba(255,255,255,0.15)", borderRadius:20, padding:"4px 14px", fontSize:12, color:"white", fontWeight:600, marginBottom:10 }}>
          🔍 Browse Projects
        </div>
        <h1 style={{ fontSize:28, fontWeight:800, color:"white", margin:"0 0 6px", letterSpacing:"-0.5px" }}>Browse Projects</h1>
        <p style={{ fontSize:14, color:"rgba(255,255,255,0.75)", margin:0 }}>Find and apply for projects that match your skills</p>
      </div>

      <div style={{ padding:32 }}>

        {/* Filters */}
        <div style={{ backgroundColor:"#fff", borderRadius:16, padding:"20px 24px", marginBottom:24, boxShadow:"0 1px 3px rgba(0,0,0,0.06)", border:"1px solid #e2e8f0" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
            <span style={{ fontSize:15, fontWeight:700, color:"#111827" }}>🔽 Filters</span>
            <button onClick={clearFilters} style={{ fontSize:13, color:"#7c3aed", background:"none", border:"none", cursor:"pointer", fontFamily:"inherit", fontWeight:600 }}>Clear all</button>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:16 }}>
            <div>
              <label style={lbl}>Search</label>
              <div style={{ position:"relative" }}>
                <span style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:"#9ca3af" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                </span>
                <input type="text" placeholder="Search projects..." value={search} onChange={e => setSearch(e.target.value)} style={{ ...inp, paddingLeft:30 }} />
              </div>
            </div>
            <div>
              <label style={lbl}>Budget Range</label>
              <select value={budget} onChange={e => setBudget(e.target.value)} style={inp}>
                <option value="all">All Budgets</option>
                <option value="low">Under $1,000</option>
                <option value="medium">$1,000 – $5,000</option>
                <option value="high">Over $5,000</option>
              </select>
            </div>
            <div>
              <label style={lbl}>Skill</label>
              <input type="text" placeholder="e.g. React, Python..." value={skillInput} onChange={e => setSkillInput(e.target.value)} style={inp} />
            </div>
          </div>
        </div>

        {!loading && <p style={{ fontSize:14, color:"#64748b", marginBottom:16 }}>{filtered.length} project{filtered.length !== 1 ? "s" : ""} found</p>}
        {loading && <p style={{ color:"#64748b" }}>Loading projects...</p>}

        {!loading && filtered.length === 0 && (
          <div style={{ backgroundColor:"#fff", borderRadius:16, padding:"60px 32px", textAlign:"center", boxShadow:"0 1px 3px rgba(0,0,0,0.06)", border:"1px solid #e2e8f0" }}>
            <div style={{ fontSize:56, marginBottom:16 }}>🔍</div>
            <h3 style={{ fontSize:18, fontWeight:700, color:"#111827", marginBottom:8 }}>No projects found</h3>
            <p style={{ color:"#64748b", fontSize:14, marginBottom:16 }}>Try adjusting your filters.</p>
            <button onClick={clearFilters} style={{ padding:"10px 24px", background:"linear-gradient(135deg,#7c3aed,#a855f7)", color:"white", border:"none", borderRadius:8, cursor:"pointer", fontWeight:600, fontSize:14 }}>Clear Filters</button>
          </div>
        )}

        {filtered.map(p => (
          <div key={p.id} style={{ backgroundColor:"#fff", borderRadius:16, padding:24, marginBottom:16, boxShadow:"0 1px 3px rgba(0,0,0,0.06)", border:"1px solid #e2e8f0" }}
            onMouseEnter={e => e.currentTarget.style.boxShadow="0 4px 16px rgba(0,0,0,0.1)"}
            onMouseLeave={e => e.currentTarget.style.boxShadow="0 1px 3px rgba(0,0,0,0.06)"}>

            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
              <div style={{ flex:1 }}>
                <h3 style={{ fontSize:18, fontWeight:700, color:"#111827", margin:"0 0 6px" }}>{p.title}</h3>
                <p style={{ fontSize:14, color:"#64748b", lineHeight:1.7, margin:0 }}>
                  {p.description?.length > 180 ? p.description.slice(0,180) + "..." : p.description}
                </p>
              </div>
              <span style={{ padding:"6px 16px", borderRadius:20, fontSize:12, fontWeight:700, background:"linear-gradient(135deg,#7c3aed,#a855f7)", color:"white", whiteSpace:"nowrap", marginLeft:16 }}>Open</span>
            </div>

            {p.skills && (
              <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:16 }}>
                {p.skills.split(",").map(s => (
                  <span key={s} style={{ padding:"4px 12px", background:"linear-gradient(135deg,#f5f3ff,#ede9fe)", color:"#a855f7", borderRadius:20, fontSize:12, fontWeight:600, border:"1px solid #ddd6fe" }}>{s.trim()}</span>
                ))}
              </div>
            )}

            <div style={{ display:"flex", gap:24, paddingTop:16, borderTop:"1px solid #f1f5f9", marginBottom:16 }}>
              <div><span style={statLabel}>Budget</span><strong style={{ color:"#111827", fontSize:15 }}>${Number(p.budget).toLocaleString()}</strong></div>
              <div><span style={statLabel}>Deadline</span><strong style={{ color:"#111827", fontSize:15 }}>{p.deadline || "—"}</strong></div>
              <div><span style={statLabel}>Posted</span><strong style={{ color:"#111827", fontSize:15 }}>{new Date(p.created_at).toLocaleDateString()}</strong></div>
            </div>

            <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
              <button onClick={() => navigate(`/submit-proposal/${p.id}`)}
                style={{ padding:"10px 24px", background:"linear-gradient(135deg,#7c3aed,#a855f7)", color:"white", border:"none", borderRadius:8, cursor:"pointer", fontWeight:600, fontSize:14, boxShadow:"0 2px 8px rgba(124,58,237,0.3)" }}>
                🚀 Submit Proposal
              </button>
              <button onClick={() => { setSelected(p); setShowClientProfile(false); setClientProfile(null); }}
                style={{ padding:"10px 24px", backgroundColor:"#fff", color:"#374151", border:"1.5px solid #e2e8f0", borderRadius:8, cursor:"pointer", fontWeight:600, fontSize:14 }}>
                View Details
              </button>
              <button onClick={() => checkMatchScore(p.id)} disabled={matchLoading[p.id]}
                style={{ padding:"10px 24px", backgroundColor:"#fff", color:"#7c3aed", border:"1.5px solid #7c3aed", borderRadius:8, cursor:"pointer", fontWeight:600, fontSize:14, opacity: matchLoading[p.id] ? 0.7 : 1 }}>
                {matchLoading[p.id] ? "⏳ Checking..." : "🤖 Match Score"}
              </button>
            </div>

            {matchScores[p.id] && (
              <div style={{ marginTop:16, padding:16, backgroundColor:"#f5f3ff", borderRadius:12, border:"1px solid #ddd6fe" }}>
                <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:10 }}>
                  <div style={{ fontSize:32, fontWeight:800, color:"#7c3aed" }}>{matchScores[p.id].score}%</div>
                  <div>
                    <div style={{ fontSize:13, fontWeight:700, color:"#111827" }}>AI Match Score</div>
                    <div style={{ fontSize:12, color:"#64748b" }}>{matchScores[p.id].summary}</div>
                  </div>
                </div>
                {matchScores[p.id].matching_skills?.length > 0 && <div style={{ marginBottom:6 }}><span style={{ fontSize:12, fontWeight:600, color:"#16a34a" }}>✅ Matching: </span><span style={{ fontSize:12, color:"#374151" }}>{matchScores[p.id].matching_skills.join(", ")}</span></div>}
                {matchScores[p.id].missing_skills?.length > 0 && <div><span style={{ fontSize:12, fontWeight:600, color:"#dc2626" }}>❌ Missing: </span><span style={{ fontSize:12, color:"#374151" }}>{matchScores[p.id].missing_skills.join(", ")}</span></div>}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ===================== Modal ===================== */}
      {selected && (
        <div onClick={closeModal} style={{ position:"fixed", inset:0, backgroundColor:"rgba(15,23,42,0.6)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:24, backdropFilter:"blur(4px)" }}>
          <div onClick={e => e.stopPropagation()}
            style={{ backgroundColor:"#fff", borderRadius:20, padding:32, maxWidth:660, width:"100%", maxHeight:"90vh", overflowY:"auto", boxShadow:"0 20px 60px rgba(0,0,0,0.3)", border:"1px solid #e2e8f0" }}>

            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20 }}>
              <div>
                <h2 style={{ fontSize:22, fontWeight:800, color:"#111827", margin:"0 0 8px", letterSpacing:"-0.5px" }}>{selected.title}</h2>
                <span style={{ padding:"6px 16px", borderRadius:20, fontSize:12, fontWeight:700, background:"linear-gradient(135deg,#7c3aed,#a855f7)", color:"white" }}>Open</span>
              </div>
              <button onClick={closeModal} style={{ background:"#f1f5f9", border:"none", width:32, height:32, borderRadius:"50%", cursor:"pointer", color:"#64748b", fontSize:16, display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
            </div>

            {/* Tabs */}
            <div style={{ display:"flex", gap:0, marginBottom:24, backgroundColor:"#f1f5f9", borderRadius:10, padding:4 }}>
              <button onClick={() => setShowClientProfile(false)}
                style={{ flex:1, padding:"8px 0", borderRadius:8, border:"none", cursor:"pointer", fontWeight:600, fontSize:13,
                  background: !showClientProfile ? "white" : "transparent",
                  color: !showClientProfile ? "#7c3aed" : "#64748b",
                  boxShadow: !showClientProfile ? "0 1px 4px rgba(0,0,0,0.1)" : "none" }}>
                📋 Project Details
              </button>
              <button onClick={() => fetchClientProfile(selected.client_id)}
                style={{ flex:1, padding:"8px 0", borderRadius:8, border:"none", cursor:"pointer", fontWeight:600, fontSize:13,
                  background: showClientProfile ? "white" : "transparent",
                  color: showClientProfile ? "#7c3aed" : "#64748b",
                  boxShadow: showClientProfile ? "0 1px 4px rgba(0,0,0,0.1)" : "none" }}>
                👤 Client Profile
              </button>
            </div>

            {/* PROJECT DETAILS TAB */}
            {!showClientProfile && (
              <>
                <div style={{ marginBottom:20 }}>
                  <label style={modalLabel}>Description</label>
                  <p style={{ fontSize:14, color:"#374151", lineHeight:1.8, margin:0, backgroundColor:"#f8fafc", padding:"14px 16px", borderRadius:10, border:"1px solid #e2e8f0" }}>{selected.description}</p>
                </div>
                {selected.skills && (
                  <div style={{ marginBottom:20 }}>
                    <label style={modalLabel}>Required Skills</label>
                    <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                      {selected.skills.split(",").map(s => (
                        <span key={s} style={{ padding:"4px 12px", background:"linear-gradient(135deg,#f5f3ff,#ede9fe)", color:"#7c3aed", borderRadius:20, fontSize:12, fontWeight:600, border:"1px solid #ddd6fe" }}>{s.trim()}</span>
                      ))}
                    </div>
                  </div>
                )}
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:16, marginBottom:24, backgroundColor:"#f8fafc", borderRadius:12, padding:16, border:"1px solid #e2e8f0" }}>
                  <div><div style={statLabel2}>Budget</div><div style={{ fontSize:20, fontWeight:800, color:"#111827" }}>${Number(selected.budget).toLocaleString()}</div></div>
                  <div><div style={statLabel2}>Deadline</div><div style={{ fontSize:16, fontWeight:700, color:"#111827" }}>{selected.deadline || "—"}</div></div>
                  <div><div style={statLabel2}>Posted</div><div style={{ fontSize:14, fontWeight:600, color:"#111827" }}>{new Date(selected.created_at).toLocaleDateString()}</div></div>
                </div>
                <div style={{ display:"flex", gap:12 }}>
                  <button onClick={() => { closeModal(); navigate(`/submit-proposal/${selected.id}`); }}
                    style={{ flex:1, padding:13, background:"linear-gradient(135deg,#7c3aed,#a855f7)", color:"white", border:"none", borderRadius:10, cursor:"pointer", fontWeight:700, fontSize:15, boxShadow:"0 4px 12px rgba(124,58,237,0.3)" }}>
                    🚀 Submit Proposal
                  </button>
                  <button onClick={closeModal} style={{ padding:"13px 24px", backgroundColor:"#fff", color:"#64748b", border:"1.5px solid #e2e8f0", borderRadius:10, cursor:"pointer", fontWeight:600, fontSize:14 }}>Close</button>
                </div>
              </>
            )}

            {/* CLIENT PROFILE TAB */}
            {showClientProfile && (
              <div>
                {clientLoading && <div style={{ textAlign:"center", padding:"40px 0", color:"#64748b" }}>⏳ Loading client profile...</div>}
                {!clientLoading && !clientProfile && <div style={{ textAlign:"center", padding:"40px 0", color:"#94a3b8" }}>⚠️ Client profile not available.</div>}

                {!clientLoading && clientProfile && (
                  <>
                    <div style={{ background:"linear-gradient(135deg,#1e3a5f,#2563eb)", borderRadius:14, padding:24, marginBottom:20 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:16 }}>
                        <div style={{ width:60, height:60, borderRadius:"50%", background:"rgba(255,255,255,0.2)", display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontWeight:800, fontSize:24, flexShrink:0 }}>
                          {(clientProfile.name || "C").charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontSize:18, fontWeight:800, color:"white" }}>{clientProfile.name || "—"}</div>
                          <div style={{ fontSize:13, color:"rgba(255,255,255,0.7)", marginTop:2 }}>{clientProfile.industry || clientProfile.email}</div>
                          <span style={{ display:"inline-block", marginTop:6, padding:"2px 10px", borderRadius:20, fontSize:11, fontWeight:700, backgroundColor:"rgba(255,255,255,0.15)", color:"white" }}>Client</span>
                        </div>
                      </div>
                      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8 }}>
                        {[
                          { icon:"⭐", label:"Avg Rating",    val: clientProfile.avg_rating ? `${clientProfile.avg_rating}/5` : "—" },
                          { icon:"💬", label:"Reviews",        val: clientProfile.total_reviews ?? 0 },
                          { icon:"📋", label:"Total Projects", val: clientProfile.total_posted ?? 0 },
                          { icon:"🟢", label:"Open Projects",  val: clientProfile.open_projects ?? 0 },
                        ].map((s,i) => (
                          <div key={i} style={{ backgroundColor:"rgba(255,255,255,0.12)", borderRadius:10, padding:"10px 8px", textAlign:"center" }}>
                            <div style={{ fontSize:18 }}>{s.icon}</div>
                            <div style={{ fontSize:15, fontWeight:800, color:"white", marginTop:2 }}>{s.val}</div>
                            <div style={{ fontSize:10, color:"rgba(255,255,255,0.65)", marginTop:1 }}>{s.label}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {clientProfile.bio && (
                      <div style={{ marginBottom:16 }}>
                        <label style={modalLabel}>📝 About Company</label>
                        <div style={{ fontSize:14, color:"#374151", lineHeight:1.8, padding:"12px 14px", backgroundColor:"#f8fafc", borderRadius:10, border:"1px solid #e2e8f0" }}>{clientProfile.bio}</div>
                      </div>
                    )}

                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:16 }}>
                      <ClientField icon="🏢" label="Company"      value={clientProfile.name} />
                      <ClientField icon="🏭" label="Industry"     value={clientProfile.industry} />
                      <ClientField icon="👥" label="Company Size" value={clientProfile.company_size} />
                      <ClientField icon="🌐" label="Website"      value={clientProfile.website} />
                      <ClientField icon="📍" label="Location"     value={clientProfile.location} />
                      <ClientField icon="📞" label="Phone"        value={clientProfile.phone} />
                    </div>

                    {clientProfile.reviews?.length > 0 && (
                      <div style={{ marginBottom:16 }}>
                        <label style={modalLabel}>⭐ Reviews ({clientProfile.total_reviews})</label>
                        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                          {clientProfile.reviews.slice(0,3).map((r, i) => (
                            <div key={i} style={{ backgroundColor:"#f8fafc", borderRadius:10, padding:"12px 14px", border:"1px solid #e2e8f0" }}>
                              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
                                <div style={{ fontWeight:600, fontSize:13, color:"#111827" }}>{r.reviewer_name}</div>
                                <div style={{ display:"flex", gap:2 }}>
                                  {[1,2,3,4,5].map(star => (
                                    <span key={star} style={{ fontSize:14, color: star <= r.rating ? "#f59e0b" : "#e2e8f0" }}>★</span>
                                  ))}
                                </div>
                              </div>
                              {r.project_name && <div style={{ fontSize:11, color:"#64748b", marginBottom:4 }}>📋 {r.project_name}</div>}
                              <div style={{ fontSize:13, color:"#374151", lineHeight:1.6 }}>{r.comment}</div>
                            </div>
                          ))}
                          {clientProfile.reviews.length > 3 && (
                            <div style={{ fontSize:12, color:"#7c3aed", textAlign:"center", fontWeight:600 }}>+{clientProfile.reviews.length - 3} more reviews</div>
                          )}
                        </div>
                      </div>
                    )}

                    {clientProfile.reviews?.length === 0 && (
                      <div style={{ textAlign:"center", padding:"16px 0", color:"#94a3b8", fontSize:13 }}>No reviews yet for this client.</div>
                    )}

                    <button onClick={() => { closeModal(); navigate(`/submit-proposal/${selected.id}`); }}
                      style={{ width:"100%", marginTop:8, padding:13, background:"linear-gradient(135deg,#7c3aed,#a855f7)", color:"white", border:"none", borderRadius:10, cursor:"pointer", fontWeight:700, fontSize:15, boxShadow:"0 4px 12px rgba(124,58,237,0.3)" }}>
                      🚀 Submit Proposal to this Client
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ClientField({ icon, label, value }) {
  return (
    <div>
      <div style={{ fontSize:11, fontWeight:700, color:"#64748b", textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:5 }}>{icon} {label}</div>
      <div style={{ fontSize:14, color: value ? "#111827" : "#94a3b8", padding:"8px 12px", backgroundColor:"#f8fafc", borderRadius:8, border:"1px solid #e2e8f0" }}>{value || "—"}</div>
    </div>
  );
}

const modalLabel = { fontSize:11, fontWeight:700, color:"#64748b", textTransform:"uppercase", letterSpacing:"0.5px", display:"block", marginBottom:8 };
const statLabel  = { display:"block", fontSize:11, textTransform:"uppercase", letterSpacing:"0.5px", color:"#64748b", marginBottom:2 };
const statLabel2 = { fontSize:11, color:"#64748b", textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:4 };
const lbl = { display:"block", fontSize:13, fontWeight:500, color:"#374151", marginBottom:6 };
const inp = { width:"100%", padding:"10px 12px", border:"1.5px solid #e2e8f0", borderRadius:8, fontSize:14, outline:"none", fontFamily:"inherit", backgroundColor:"#f9fafb", boxSizing:"border-box" };