import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../utils/api";

export default function ClientDashboard() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [projects, setProjects]   = useState([]);
  const [proposals, setProposals] = useState({});
  const [loading, setLoading]     = useState(true);
  const [recommendations, setRecommendations]   = useState({});
  const [recommendLoading, setRecommendLoading] = useState({});

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      try {
        const projRes = await api.get(`/projects/client/${user.id}`);
        const projs = projRes.data;
        setProjects(projs);
        const counts = {};
        await Promise.all(projs.map(async p => {
          try {
            const r = await api.get(`/proposals/project/${p.id}`);
            counts[p.id] = r.data;
          } catch { counts[p.id] = []; }
        }));
        setProposals(counts);
      } catch (err) {
        console.error("Dashboard error:", err.message);
      } finally { setLoading(false); }
    };
    fetchData();
  }, [user]);

  const open        = projects.filter(p => p.status === "open");
  const inProgress  = projects.filter(p => p.status === "in-progress");
  const completed   = projects.filter(p => p.status === "completed");
  const closed      = projects.filter(p => p.status === "closed");
  const totalProposals   = Object.values(proposals).reduce((a, b) => a + b.length, 0);
  const pendingProposals = Object.values(proposals).flat().filter(p => p.status === "pending").length;

  if (loading) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:"100vh" }}>
      <p style={{ color:"var(--text-muted)" }}>Loading dashboard...</p>
    </div>
  );

  return (
    <div style={{ fontFamily:"'Segoe UI',sans-serif", backgroundColor:"var(--page-bg)", minHeight:"100vh" }}>

      {/* Hero */}
      <div style={{ background:"linear-gradient(135deg,#1e3a5f 0%,#2563eb 50%,#3b82f6 100%)", padding:"24px 16px", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:-40, right:-40, width:200, height:200, borderRadius:"50%", background:"rgba(255,255,255,0.05)" }} />
        <div style={{ position:"absolute", bottom:-30, left:300, width:150, height:150, borderRadius:"50%", background:"rgba(255,255,255,0.05)" }} />
        <div style={{ display:"inline-flex", alignItems:"center", gap:8, backgroundColor:"rgba(255,255,255,0.15)", borderRadius:20, padding:"4px 14px", fontSize:12, color:"white", fontWeight:600, marginBottom:10 }}>
          👋 Welcome back
        </div>
        <h1 style={{ fontSize:28, fontWeight:800, color:"white", margin:"0 0 6px", letterSpacing:"-0.5px" }}>
          Hello, {user?.name || "Client"} 👋
        </h1>
        <p style={{ fontSize:14, color:"rgba(255,255,255,0.75)", margin:0 }}>
          Here's an overview of your projects and activities
        </p>
      </div>

      <div style={{ padding:"20px 16px" }}>

        {/* Stats Cards */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(140px, 1fr))", gap:16, marginBottom:32 }}>
          {[
            { label:"Total Projects",    val:projects.length,  icon:"📁", color:"#2563eb", bg:"var(--tint-blue)" },
            { label:"Open Projects",     val:open.length,      icon:"🟢", color:"#16a34a", bg:"var(--tint-green)" },
            { label:"Total Proposals",   val:totalProposals,   icon:"📋", color:"#7c3aed", bg:"var(--tint-purple)" },
            { label:"Pending Proposals", val:pendingProposals, icon:"⏳", color:"#d97706", bg:"var(--tint-orange)" },
          ].map(s => (
            <div key={s.label} style={{ backgroundColor:"var(--card)", borderRadius:16, padding:"22px 24px", boxShadow:"0 1px 3px rgba(0,0,0,0.06)", border:"1px solid var(--border)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div>
                <div style={{ fontSize:12, color:"var(--text-muted)", marginBottom:6, textTransform:"uppercase", letterSpacing:"0.5px" }}>{s.label}</div>
                <div style={{ fontSize:32, fontWeight:800, color:s.color }}>{s.val}</div>
              </div>
              <div style={{ width:48, height:48, borderRadius:14, backgroundColor:s.bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:24 }}>{s.icon}</div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div style={{ backgroundColor:"var(--card)", borderRadius:16, padding:"20px 24px", marginBottom:28, boxShadow:"0 1px 3px rgba(0,0,0,0.06)", border:"1px solid var(--border)", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div>
            <div style={{ fontWeight:700, fontSize:15, color:"var(--text-primary)" }}>Ready to find talent?</div>
            <div style={{ fontSize:13, color:"var(--text-muted)", marginTop:2 }}>Post a new project and start receiving proposals</div>
          </div>
          <div style={{ display:"flex", gap:12 }}>
            <button onClick={() => navigate("/projects")}
              style={{ padding:"10px 20px", backgroundColor:"var(--card)", color:"var(--text-secondary)", border:"1.5px solid var(--border)", borderRadius:8, cursor:"pointer", fontWeight:600, fontSize:13 }}>
              View All Projects
            </button>
            <button onClick={() => navigate("/post-project")}
              style={{ padding:"10px 20px", background:"linear-gradient(135deg,#2563eb,#3b82f6)", color:"white", border:"none", borderRadius:8, cursor:"pointer", fontWeight:600, fontSize:13, boxShadow:"0 2px 8px rgba(37,99,235,0.3)" }}>
              + Post New Project
            </button>
          </div>
        </div>

        {/* Open Projects */}
        {open.length > 0 && (
          <Section title="Open Projects" count={open.length} dotColor="#16a34a" badgeBg="var(--tint-green)" badgeColor="#16a34a">
            {open.map(p => (
              <ProjectCard key={p.id} p={p} proposals={proposals[p.id] || []} navigate={navigate}
                recommendations={recommendations} setRecommendations={setRecommendations}
                recommendLoading={recommendLoading} setRecommendLoading={setRecommendLoading} />
            ))}
          </Section>
        )}

        {/* In Progress */}
        {inProgress.length > 0 && (
          <Section title="In Progress" count={inProgress.length} dotColor="#f59e0b" badgeBg="var(--tint-orange)" badgeColor="#d97706">
            {inProgress.map(p => (
              <ProjectCard key={p.id} p={p} proposals={proposals[p.id] || []} navigate={navigate}
                recommendations={recommendations} setRecommendations={setRecommendations}
                recommendLoading={recommendLoading} setRecommendLoading={setRecommendLoading} />
            ))}
          </Section>
        )}

        {/* Completed */}
        {completed.length > 0 && (
          <Section title="Completed" count={completed.length} dotColor="#7c3aed" badgeBg="#f5f3ff" badgeColor="#7c3aed">
            {completed.map(p => (
              <ProjectCard key={p.id} p={p} proposals={proposals[p.id] || []} navigate={navigate}
                recommendations={recommendations} setRecommendations={setRecommendations}
                recommendLoading={recommendLoading} setRecommendLoading={setRecommendLoading} />
            ))}
          </Section>
        )}

        {/* Closed */}
        {closed.length > 0 && (
          <Section title="Closed" count={closed.length} dotColor="#94a3b8" badgeBg="var(--muted)" badgeColor="var(--text-muted)">
            {closed.map(p => (
              <ProjectCard key={p.id} p={p} proposals={proposals[p.id] || []} navigate={navigate}
                recommendations={recommendations} setRecommendations={setRecommendations}
                recommendLoading={recommendLoading} setRecommendLoading={setRecommendLoading} />
            ))}
          </Section>
        )}

        {/* Empty State */}
        {projects.length === 0 && (
          <div style={{ backgroundColor:"var(--card)", borderRadius:16, padding:"60px 32px", textAlign:"center", boxShadow:"0 1px 3px rgba(0,0,0,0.06)", border:"1px solid var(--border)" }}>
            <div style={{ fontSize:56, marginBottom:16 }}>📁</div>
            <h3 style={{ fontSize:18, fontWeight:700, color:"var(--text-primary)", marginBottom:8 }}>No projects yet</h3>
            <p style={{ color:"var(--text-muted)", fontSize:14, marginBottom:20 }}>Post your first project and start receiving proposals from top freelancers.</p>
            <button onClick={() => navigate("/post-project")}
              style={{ padding:"12px 28px", background:"linear-gradient(135deg,#2563eb,#3b82f6)", color:"white", border:"none", borderRadius:10, cursor:"pointer", fontWeight:600, fontSize:14, boxShadow:"0 4px 12px rgba(37,99,235,0.3)" }}>
              Post Your First Project →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Section({ title, count, dotColor, badgeBg, badgeColor, children }) {
  return (
    <div style={{ marginBottom:28 }}>
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
        <div style={{ width:10, height:10, borderRadius:"50%", backgroundColor:dotColor }} />
        <h2 style={{ fontSize:18, fontWeight:700, color:"var(--text-primary)", margin:0 }}>{title}</h2>
        <span style={{ backgroundColor:badgeBg, color:badgeColor, borderRadius:20, padding:"2px 10px", fontSize:12, fontWeight:600 }}>{count}</span>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(300px, 1fr))", gap:16 }}>
        {children}
      </div>
    </div>
  );
}

function ProjectCard({ p, proposals, navigate, recommendations, setRecommendations, recommendLoading, setRecommendLoading }) {
  const pending  = proposals.filter(pr => pr.status === "pending").length;
  const accepted = proposals.filter(pr => pr.status === "accepted").length;

  const statusStyle = {
    "open":        { bg:"linear-gradient(135deg,#2563eb,#3b82f6)", color:"white" },
    "in-progress": { bg:"linear-gradient(135deg,#f59e0b,#f97316)", color:"white" },
    "completed":   { bg:"linear-gradient(135deg,#16a34a,#22c55e)", color:"white" },
    "closed":      { bg:"linear-gradient(135deg,#64748b,#94a3b8)", color:"white" },
  };
  const s = statusStyle[p.status] || statusStyle["closed"];

  const getRecommendations = async () => {
    setRecommendLoading(prev => ({ ...prev, [p.id]: true }));
    try {
      const token = localStorage.getItem("token");
      const res = await api.get(`/ai/recommend-freelancers/${p.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRecommendations(prev => ({ ...prev, [p.id]: res.data }));
    } catch (err) {
      console.error("Recommendation error:", err.message);
    } finally {
      setRecommendLoading(prev => ({ ...prev, [p.id]: false }));
    }
  };

  return (
    <div style={{ backgroundColor:"var(--card)", borderRadius:16, padding:24, boxShadow:"0 1px 3px rgba(0,0,0,0.06)", border:"1px solid var(--border)", display:"flex", flexDirection:"column", gap:12 }}
      onMouseEnter={e => e.currentTarget.style.boxShadow="0 4px 16px rgba(0,0,0,0.1)"}
      onMouseLeave={e => e.currentTarget.style.boxShadow="0 1px 3px rgba(0,0,0,0.06)"}>

      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <h3 style={{ fontSize:16, fontWeight:700, color:"var(--text-primary)", margin:0, flex:1, marginRight:8 }}>{p.title}</h3>
        <span style={{ padding:"4px 12px", borderRadius:20, fontSize:11, fontWeight:700, background:s.bg, color:s.color, whiteSpace:"nowrap" }}>
          {p.status}
        </span>
      </div>

      <p style={{ fontSize:13, color:"var(--text-muted)", margin:0, lineHeight:1.6 }}>
        {p.description?.length > 100 ? p.description.slice(0,100) + "..." : p.description}
      </p>

      {p.skills && (
        <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
          {p.skills.split(",").slice(0,3).map(sk => (
            <span key={sk} style={{ padding:"3px 10px", background:"linear-gradient(135deg,#eff6ff,#dbeafe)", color:"#1d4ed8", borderRadius:20, fontSize:11, fontWeight:600, border:"1px solid #bfdbfe" }}>
              {sk.trim()}
            </span>
          ))}
        </div>
      )}

      <div style={{ display:"flex", gap:16, paddingTop:12, borderTop:"1px solid var(--border-light)" }}>
        <div>
          <div style={{ fontSize:11, color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:"0.5px" }}>Budget</div>
          <div style={{ fontWeight:700, color:"var(--text-primary)", fontSize:14 }}>${p.budget}</div>
        </div>
        <div>
          <div style={{ fontSize:11, color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:"0.5px" }}>Deadline</div>
          <div style={{ fontWeight:700, color:"var(--text-primary)", fontSize:14 }}>{p.deadline || "—"}</div>
        </div>
        <div>
          <div style={{ fontSize:11, color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:"0.5px" }}>Proposals</div>
          <div style={{ fontWeight:700, color: proposals.length > 0 ? "#7c3aed" : "var(--text-primary)", fontSize:14 }}>{proposals.length}</div>
        </div>
      </div>

      {proposals.length > 0 && (
        <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
          {pending > 0 && (
            <span style={{ padding:"3px 10px", backgroundColor:"var(--tint-orange)", color:"#d97706", borderRadius:20, fontSize:11, fontWeight:600, border:"1px solid var(--tint-orange-border)" }}>
              ⏳ {pending} pending
            </span>
          )}
          {accepted > 0 && (
            <span style={{ padding:"3px 10px", backgroundColor:"var(--tint-green)", color:"#16a34a", borderRadius:20, fontSize:11, fontWeight:600, border:"1px solid var(--tint-green-border)" }}>
              ✅ {accepted} accepted
            </span>
          )}
        </div>
      )}

      <button onClick={() => navigate(`/view-proposals/${p.id}`)}
        style={{ width:"100%", padding:"10px", background:"linear-gradient(135deg,#2563eb,#3b82f6)", color:"white", border:"none", borderRadius:8, cursor:"pointer", fontWeight:600, fontSize:13, boxShadow:"0 2px 8px rgba(37,99,235,0.3)", marginTop:4 }}>
        👁 View Proposals {proposals.length > 0 && `(${proposals.length})`}
      </button>

      {/* ✅ AI RECOMMEND BUTTON */}
      <button onClick={getRecommendations}
        disabled={recommendLoading[p.id]}
        style={{ width:"100%", padding:"10px", background:"var(--card)", color:"#7c3aed", border:"1.5px solid #7c3aed", borderRadius:8, cursor:"pointer", fontWeight:600, fontSize:13, opacity: recommendLoading[p.id] ? 0.7 : 1 }}>
        {recommendLoading[p.id] ? "⏳ Finding..." : "⭐ AI Recommend Freelancers"}
      </button>

      {/* ✅ AI RECOMMENDATIONS RESULT */}
      {recommendations[p.id] && (
        <div style={{ padding:16, backgroundColor:"var(--tint-purple)", borderRadius:12, border:"1px solid var(--tint-purple-border)" }}>
          <div style={{ fontSize:13, fontWeight:700, color:"#7c3aed", marginBottom:12 }}>⭐ Top Recommended Freelancers</div>
          {recommendations[p.id].map((r, i) => (
            <div key={r.id} style={{ padding:12, backgroundColor:"var(--card)", borderRadius:10, border:"1px solid #ede9fe", marginBottom:8 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <div style={{ width:32, height:32, borderRadius:10, background:"linear-gradient(135deg,#7c3aed,#a855f7)", display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontWeight:800, fontSize:14 }}>
                    {i + 1}
                  </div>
                  <div>
                    <div style={{ fontWeight:700, fontSize:13, color:"var(--text-primary)" }}>{r.name}</div>
                    <div style={{ fontSize:11, color:"var(--text-muted)" }}>{r.experience || "N/A"}</div>
                  </div>
                </div>
                <div style={{ fontSize:20, fontWeight:800, color:"#7c3aed" }}>{r.score}%</div>
              </div>
              <div style={{ fontSize:12, color:"var(--text-muted)", marginBottom:6 }}>{r.summary}</div>
              {r.matching_skills?.length > 0 && (
                <div style={{ fontSize:11 }}>
                  <span style={{ color:"#16a34a", fontWeight:600 }}>✅ </span>
                  <span style={{ color:"var(--text-secondary)" }}>{r.matching_skills.join(", ")}</span>
                </div>
              )}
              {r.missing_skills?.length > 0 && (
                <div style={{ fontSize:11, marginTop:2 }}>
                  <span style={{ color:"#dc2626", fontWeight:600 }}>❌ </span>
                  <span style={{ color:"var(--text-secondary)" }}>{r.missing_skills.join(", ")}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

    </div>
  );
}