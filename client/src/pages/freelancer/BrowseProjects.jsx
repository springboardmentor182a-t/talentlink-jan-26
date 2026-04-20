import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";
import { AuthContext } from "../../context/AuthContext";

export default function BrowseProjects() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [projects, setProjects]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [budget, setBudget]         = useState("all");
  const [skillInput, setSkillInput] = useState("");
  const [selected, setSelected]     = useState(null);
  const [matchScores, setMatchScores]   = useState({});      // ✅ NEW
  const [matchLoading, setMatchLoading] = useState({});      // ✅ NEW

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

  // ✅ NEW FUNCTION
  const checkMatchScore = async (projectId) => {
    setMatchLoading(prev => ({ ...prev, [projectId]: true }));
    try {
      const token = localStorage.getItem("token");
      const res = await api.get(`/ai/match-score/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMatchScores(prev => ({ ...prev, [projectId]: res.data }));
    } catch (err) {
      console.error("Match score error:", err.message);
    } finally {
      setMatchLoading(prev => ({ ...prev, [projectId]: false }));
    }
  };

  return (
    <div style={{ fontFamily:"'Segoe UI',sans-serif", backgroundColor:"var(--page-bg)", minHeight:"100vh" }}>

      {/* Hero */}
      <div style={{ background:"linear-gradient(135deg,#3b0764 0%,#7c3aed 40%,#a855f7 100%)", padding:"24px 16px", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:-40, right:-40, width:180, height:180, borderRadius:"50%", background:"rgba(255,255,255,0.05)" }} />
        <div style={{ position:"absolute", bottom:-20, left:200, width:120, height:120, borderRadius:"50%", background:"rgba(255,255,255,0.05)" }} />
        <div style={{ display:"inline-flex", alignItems:"center", gap:8, backgroundColor:"rgba(255,255,255,0.15)", borderRadius:20, padding:"4px 14px", fontSize:12, color:"white", fontWeight:600, marginBottom:10 }}>
          🔍 Browse Projects
        </div>
        <h1 style={{ fontSize:28, fontWeight:800, color:"white", margin:"0 0 6px", letterSpacing:"-0.5px" }}>Browse Projects</h1>
        <p style={{ fontSize:14, color:"rgba(255,255,255,0.75)", margin:0 }}>Find and apply for projects that match your skills</p>
      </div>

      <div style={{ padding:"20px 16px" }}>

        {/* Filters */}
        <div style={{ backgroundColor:"var(--card)", borderRadius:16, padding:"20px 24px", marginBottom:24, boxShadow:"0 1px 3px rgba(0,0,0,0.06)", border:"1px solid var(--border)" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
            <span style={{ fontSize:15, fontWeight:700, color:"var(--text-primary)" }}>🔽 Filters</span>
            <button onClick={clearFilters}
              style={{ fontSize:13, color:"#7c3aed", background:"none", border:"none", cursor:"pointer", fontFamily:"inherit", fontWeight:600 }}>
              Clear all
            </button>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(180px, 1fr))", gap:16 }}>
            <div>
              <label style={lbl}>Search</label>
              <div style={{ position:"relative" }}>
                <span style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:"var(--text-faint)" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                </span>
                <input type="text" placeholder="Search projects..."
                  value={search} onChange={e => setSearch(e.target.value)}
                  style={{ ...inp, paddingLeft:30 }} />
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
              <input type="text" placeholder="e.g. React, Python..."
                value={skillInput} onChange={e => setSkillInput(e.target.value)}
                style={inp} />
            </div>
          </div>
        </div>

        {!loading && (
          <p style={{ fontSize:14, color:"var(--text-muted)", marginBottom:16 }}>
            {filtered.length} project{filtered.length !== 1 ? "s" : ""} found
          </p>
        )}
        {loading && <p style={{ color:"var(--text-muted)" }}>Loading projects...</p>}

        {!loading && filtered.length === 0 && (
          <div style={{ backgroundColor:"var(--card)", borderRadius:16, padding:"60px 32px", textAlign:"center", boxShadow:"0 1px 3px rgba(0,0,0,0.06)", border:"1px solid var(--border)" }}>
            <div style={{ fontSize:56, marginBottom:16 }}>🔍</div>
            <h3 style={{ fontSize:18, fontWeight:700, color:"var(--text-primary)", marginBottom:8 }}>No projects found</h3>
            <p style={{ color:"var(--text-muted)", fontSize:14, marginBottom:16 }}>Try adjusting your filters to find more projects.</p>
            <button onClick={clearFilters}
              style={{ padding:"10px 24px", background:"linear-gradient(135deg,#7c3aed,#a855f7)", color:"white", border:"none", borderRadius:8, cursor:"pointer", fontWeight:600, fontSize:14 }}>
              Clear Filters
            </button>
          </div>
        )}

        {filtered.map(p => (
          <div key={p.id} style={{ backgroundColor:"var(--card)", borderRadius:16, padding:24, marginBottom:16, boxShadow:"0 1px 3px rgba(0,0,0,0.06)", border:"1px solid var(--border)" }}
            onMouseEnter={e => e.currentTarget.style.boxShadow="0 4px 16px rgba(0,0,0,0.1)"}
            onMouseLeave={e => e.currentTarget.style.boxShadow="0 1px 3px rgba(0,0,0,0.06)"}>

            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
              <div style={{ flex:1 }}>
                <h3 style={{ fontSize:18, fontWeight:700, color:"var(--text-primary)", margin:"0 0 6px" }}>{p.title}</h3>
                <p style={{ fontSize:14, color:"var(--text-muted)", lineHeight:1.7, margin:0 }}>
                  {p.description?.length > 180 ? p.description.slice(0,180) + "..." : p.description}
                </p>
              </div>
              <span style={{ padding:"6px 16px", borderRadius:20, fontSize:12, fontWeight:700, background:"linear-gradient(135deg,#7c3aed,#a855f7)", color:"white", whiteSpace:"nowrap", marginLeft:16 }}>
                Open
              </span>
            </div>

            {p.skills && (
              <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:16 }}>
                {p.skills.split(",").map(s => (
                  <span key={s} style={{ padding:"4px 12px", background:"linear-gradient(135deg,#f5f3ff,#ede9fe)", color:"#a855f7", borderRadius:20, fontSize:12, fontWeight:600, border:"1px solid #ddd6fe" }}>
                    {s.trim()}
                  </span>
                ))}
              </div>
            )}

            <div style={{ display:"flex", gap:24, paddingTop:16, borderTop:"1px solid var(--border-light)", marginBottom:16 }}>
              <div>
                <span style={{ display:"block", fontSize:11, textTransform:"uppercase", letterSpacing:"0.5px", color:"var(--text-muted)", marginBottom:2 }}>Budget</span>
                <strong style={{ color:"var(--text-primary)", fontSize:15 }}>${Number(p.budget).toLocaleString()}</strong>
              </div>
              <div>
                <span style={{ display:"block", fontSize:11, textTransform:"uppercase", letterSpacing:"0.5px", color:"var(--text-muted)", marginBottom:2 }}>Deadline</span>
                <strong style={{ color:"var(--text-primary)", fontSize:15 }}>{p.deadline || "—"}</strong>
              </div>
              <div>
                <span style={{ display:"block", fontSize:11, textTransform:"uppercase", letterSpacing:"0.5px", color:"var(--text-muted)", marginBottom:2 }}>Posted</span>
                <strong style={{ color:"var(--text-primary)", fontSize:15 }}>{new Date(p.created_at).toLocaleDateString()}</strong>
              </div>
            </div>

            {/* Buttons */}
            <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
              <button onClick={() => navigate(`/submit-proposal/${p.id}`)}
                style={{ padding:"10px 24px", background:"linear-gradient(135deg,#7c3aed,#a855f7)", color:"white", border:"none", borderRadius:8, cursor:"pointer", fontWeight:600, fontSize:14, boxShadow:"0 2px 8px rgba(124,58,237,0.3)" }}>
                🚀 Submit Proposal
              </button>
              <button onClick={() => setSelected(p)}
                style={{ padding:"10px 24px", backgroundColor:"var(--card)", color:"var(--text-secondary)", border:"1.5px solid var(--border)", borderRadius:8, cursor:"pointer", fontWeight:600, fontSize:14 }}>
                View Details
              </button>

              {/* ✅ NEW BUTTON */}
              <button onClick={() => checkMatchScore(p.id)}
                disabled={matchLoading[p.id]}
                style={{ padding:"10px 24px", backgroundColor:"var(--card)", color:"#7c3aed", border:"1.5px solid #7c3aed", borderRadius:8, cursor:"pointer", fontWeight:600, fontSize:14, opacity: matchLoading[p.id] ? 0.7 : 1 }}>
                {matchLoading[p.id] ? "⏳ Checking..." : "🤖 Match Score"}
              </button>
            </div>

            {/* ✅ MATCH SCORE RESULT */}
            {matchScores[p.id] && (
              <div style={{ marginTop:16, padding:16, backgroundColor:"#f5f3ff", borderRadius:12, border:"1px solid #ddd6fe" }}>
                <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:10 }}>
                  <div style={{ fontSize:32, fontWeight:800, color:"#7c3aed" }}>{matchScores[p.id].score}%</div>
                  <div>
                    <div style={{ fontSize:13, fontWeight:700, color:"var(--text-primary)" }}>AI Match Score</div>
                    <div style={{ fontSize:12, color:"var(--text-muted)" }}>{matchScores[p.id].summary}</div>
                  </div>
                </div>
                {matchScores[p.id].matching_skills?.length > 0 && (
                  <div style={{ marginBottom:6 }}>
                    <span style={{ fontSize:12, fontWeight:600, color:"#16a34a" }}>✅ Matching: </span>
                    <span style={{ fontSize:12, color:"var(--text-secondary)" }}>{matchScores[p.id].matching_skills.join(", ")}</span>
                  </div>
                )}
                {matchScores[p.id].missing_skills?.length > 0 && (
                  <div>
                    <span style={{ fontSize:12, fontWeight:600, color:"#dc2626" }}>❌ Missing: </span>
                    <span style={{ fontSize:12, color:"var(--text-secondary)" }}>{matchScores[p.id].missing_skills.join(", ")}</span>
                  </div>
                )}
              </div>
            )}

          </div>
        ))}
      </div>

      {/* View Details Modal */}
      {selected && (
        <div onClick={() => setSelected(null)}
          style={{ position:"fixed", inset:0, backgroundColor:"rgba(15,23,42,0.6)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:24, backdropFilter:"blur(4px)" }}>
          <div onClick={e => e.stopPropagation()}
            style={{ backgroundColor:"var(--card)", borderRadius:20, padding:32, maxWidth:600, width:"100%", maxHeight:"80vh", overflowY:"auto", boxShadow:"0 20px 60px rgba(0,0,0,0.3)", border:"1px solid var(--border)" }}>

            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20 }}>
              <div>
                <h2 style={{ fontSize:22, fontWeight:800, color:"var(--text-primary)", margin:"0 0 8px", letterSpacing:"-0.5px" }}>{selected.title}</h2>
                <span style={{ padding:"6px 16px", borderRadius:20, fontSize:12, fontWeight:700, background:"linear-gradient(135deg,#7c3aed,#a855f7)", color:"white" }}>Open</span>
              </div>
              <button onClick={() => setSelected(null)}
                style={{ background:"var(--muted)", border:"none", width:32, height:32, borderRadius:"50%", cursor:"pointer", color:"var(--text-muted)", fontSize:16, display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
            </div>

            <div style={{ marginBottom:20 }}>
              <label style={{ fontSize:11, fontWeight:700, color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:"0.5px", display:"block", marginBottom:8 }}>Description</label>
              <p style={{ fontSize:14, color:"var(--text-secondary)", lineHeight:1.8, margin:0, backgroundColor:"var(--page-bg)", padding:"14px 16px", borderRadius:10, border:"1px solid var(--border)" }}>{selected.description}</p>
            </div>

            {selected.skills && (
              <div style={{ marginBottom:20 }}>
                <label style={{ fontSize:11, fontWeight:700, color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:"0.5px", display:"block", marginBottom:8 }}>Required Skills</label>
                <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                  {selected.skills.split(",").map(s => (
                    <span key={s} style={{ padding:"4px 12px", background:"linear-gradient(135deg,#f5f3ff,#ede9fe)", color:"#7c3aed", borderRadius:20, fontSize:12, fontWeight:600, border:"1px solid #ddd6fe" }}>
                      {s.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(180px, 1fr))", gap:16, marginBottom:24, backgroundColor:"var(--page-bg)", borderRadius:12, padding:16, border:"1px solid var(--border)" }}>
              <div>
                <div style={{ fontSize:11, color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:4 }}>Budget</div>
                <div style={{ fontSize:20, fontWeight:800, color:"var(--text-primary)" }}>${Number(selected.budget).toLocaleString()}</div>
              </div>
              <div>
                <div style={{ fontSize:11, color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:4 }}>Deadline</div>
                <div style={{ fontSize:16, fontWeight:700, color:"var(--text-primary)" }}>{selected.deadline || "—"}</div>
              </div>
              <div>
                <div style={{ fontSize:11, color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:4 }}>Posted</div>
                <div style={{ fontSize:14, fontWeight:600, color:"var(--text-primary)" }}>{new Date(selected.created_at).toLocaleDateString()}</div>
              </div>
            </div>

            <div style={{ display:"flex", gap:12 }}>
              <button onClick={() => { setSelected(null); navigate(`/submit-proposal/${selected.id}`); }}
                style={{ flex:1, padding:13, background:"linear-gradient(135deg,#7c3aed,#a855f7)", color:"white", border:"none", borderRadius:10, cursor:"pointer", fontWeight:700, fontSize:15, boxShadow:"0 4px 12px rgba(124,58,237,0.3)" }}>
                🚀 Submit Proposal
              </button>
              <button onClick={() => setSelected(null)}
                style={{ padding:"13px 24px", backgroundColor:"var(--card)", color:"var(--text-muted)", border:"1.5px solid var(--border)", borderRadius:10, cursor:"pointer", fontWeight:600, fontSize:14 }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const lbl = { display:"block", fontSize:13, fontWeight:500, color:"var(--text-secondary)", marginBottom:6 };
const inp = { width:"100%", padding:"10px 12px", border:"1.5px solid var(--border)", borderRadius:8, fontSize:14, outline:"none", fontFamily:"inherit", backgroundColor:"var(--page-bg)", boxSizing:"border-box" };