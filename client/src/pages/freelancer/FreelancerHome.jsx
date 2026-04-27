import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import api from "../../utils/api";

export default function FreelancerHome({ onNavigate }) {
  const { user } = useContext(AuthContext);
  const [proposals, setProposals]   = useState([]);
  const [openProjects, setOpenProjects] = useState([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchAll = async () => {
      try {
        const [propRes, projRes] = await Promise.all([
          api.get(`/proposals/freelancer/${user.id}`),
          api.get("/projects/open/"),
        ]);
        setProposals(propRes.data);
        setOpenProjects(projRes.data.slice(0, 5));
      } catch (err) {
        console.error("Dashboard error:", err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [user]);

  const counts = {
    pending:   proposals.filter(p => p.status === "pending").length,
    accepted:  proposals.filter(p => p.status === "accepted").length,
    rejected:  proposals.filter(p => p.status === "rejected").length,
    total:     proposals.length,
  };

  const totalEarnings = proposals
    .filter(p => p.status === "accepted")
    .reduce((sum, p) => sum + Number(p.proposed_budget || 0), 0);

  const recentProposals = [...proposals]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 4);

  const statusStyle = {
    pending:  { bg:"var(--tint-orange)", color:"#ea580c", border:"var(--tint-orange-border)" },
    accepted: { bg:"var(--tint-green)",  color:"#16a34a", border:"var(--tint-green-border)"  },
    rejected: { bg:"var(--tint-red)",    color:"var(--text-error)", border:"var(--tint-red-border)" },
  };

  if (loading) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:"60vh" }}>
      <p style={{ color:"var(--text-muted)" }}>Loading dashboard...</p>
    </div>
  );

  return (
    <div style={{ fontFamily:"'Segoe UI',sans-serif", backgroundColor:"var(--page-bg)", minHeight:"100vh" }}>

      {/* Hero */}
      <div style={{ background:"linear-gradient(135deg,#3b0764 0%,#7c3aed 40%,#a855f7 100%)", padding:"24px 16px", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:-40, right:-40, width:200, height:200, borderRadius:"50%", background:"rgba(255,255,255,0.05)" }} />
        <div style={{ position:"absolute", bottom:-30, left:300, width:150, height:150, borderRadius:"50%", background:"rgba(255,255,255,0.05)" }} />
        <div style={{ display:"inline-flex", alignItems:"center", gap:8, backgroundColor:"rgba(255,255,255,0.15)", borderRadius:20, padding:"4px 14px", fontSize:12, color:"white", fontWeight:600, marginBottom:10 }}>
          👋 Welcome back
        </div>
        <h1 style={{ fontSize:28, fontWeight:800, color:"white", margin:"0 0 6px", letterSpacing:"-0.5px" }}>
          Hello, {user?.name || user?.full_name || "Freelancer"} 👋
        </h1>
        <p style={{ fontSize:14, color:"rgba(255,255,255,0.75)", margin:0 }}>
          Here's an overview of your freelance activity
        </p>
      </div>

      <div style={{ padding:"20px 16px" }}>

        {/* Stats Cards */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(140px, 1fr))", gap:16, marginBottom:32 }}>
          {[
            { label:"Total Proposals",   val:counts.total,                          icon:"📋", color:"#7c3aed", bg:"var(--tint-purple)" },
            { label:"Pending",           val:counts.pending,                         icon:"⏳", color:"#d97706", bg:"var(--tint-orange)" },
            { label:"Accepted",          val:counts.accepted,                        icon:"✅", color:"#16a34a", bg:"var(--tint-green)"  },
            { label:"Total Earnings",    val:`$${totalEarnings.toLocaleString()}`,   icon:"💰", color:"#2563eb", bg:"var(--tint-blue)"   },
          ].map(s => (
            <div key={s.label} style={{ backgroundColor:"var(--card)", borderRadius:16, padding:"22px 24px", boxShadow:"0 1px 3px rgba(0,0,0,0.06)", border:"1px solid var(--border)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div>
                <div style={{ fontSize:12, color:"var(--text-muted)", marginBottom:6, textTransform:"uppercase", letterSpacing:"0.5px" }}>{s.label}</div>
                <div style={{ fontSize:28, fontWeight:800, color:s.color }}>{s.val}</div>
              </div>
              <div style={{ width:48, height:48, borderRadius:14, backgroundColor:s.bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:24 }}>{s.icon}</div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div style={{ backgroundColor:"var(--card)", borderRadius:16, padding:"20px 24px", marginBottom:28, boxShadow:"0 1px 3px rgba(0,0,0,0.06)", border:"1px solid var(--border)", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
          <div>
            <div style={{ fontWeight:700, fontSize:15, color:"var(--text-primary)" }}>Ready to find work?</div>
            <div style={{ fontSize:13, color:"var(--text-muted)", marginTop:2 }}>Browse open projects and submit your proposals</div>
          </div>
          <div style={{ display:"flex", gap:12 }}>
            <button onClick={() => onNavigate("proposals")}
              style={{ padding:"10px 20px", backgroundColor:"var(--card)", color:"var(--text-secondary)", border:"1.5px solid var(--border)", borderRadius:8, cursor:"pointer", fontWeight:600, fontSize:13 }}>
              My Proposals
            </button>
            <button onClick={() => onNavigate("browse")}
              style={{ padding:"10px 20px", background:"linear-gradient(135deg,#7c3aed,#a855f7)", color:"white", border:"none", borderRadius:8, cursor:"pointer", fontWeight:600, fontSize:13, boxShadow:"0 2px 8px rgba(124,58,237,0.3)" }}>
              + Browse Projects
            </button>
          </div>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(200px, 1fr))", gap:24 }}>

          {/* Recent Proposals */}
          <div style={{ backgroundColor:"var(--card)", borderRadius:16, padding:24, boxShadow:"0 1px 3px rgba(0,0,0,0.06)", border:"1px solid var(--border)" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
              <div>
                <h3 style={{ fontSize:16, fontWeight:700, color:"var(--text-primary)", margin:"0 0 4px" }}>Recent Proposals</h3>
                <p style={{ fontSize:12, color:"var(--text-muted)", margin:0 }}>Your latest proposal submissions</p>
              </div>
              <button onClick={() => onNavigate("proposals")}
                style={{ fontSize:12, color:"#7c3aed", background:"none", border:"none", cursor:"pointer", fontWeight:600, fontFamily:"inherit" }}>
                View all →
              </button>
            </div>

            {recentProposals.length === 0 ? (
              <div style={{ textAlign:"center", padding:"32px 0" }}>
                <div style={{ fontSize:40, marginBottom:12 }}>📄</div>
                <p style={{ fontSize:14, color:"var(--text-muted)", margin:"0 0 16px" }}>No proposals yet. Browse projects to get started!</p>
                <button onClick={() => onNavigate("browse")}
                  style={{ padding:"10px 20px", background:"linear-gradient(135deg,#7c3aed,#a855f7)", color:"white", border:"none", borderRadius:8, cursor:"pointer", fontWeight:600, fontSize:13 }}>
                  Browse Projects →
                </button>
              </div>
            ) : (
              recentProposals.map(p => {
                const sc = statusStyle[p.status] || statusStyle.pending;
                const projectTitle = p.project_title || `Project #${p.project_id}`;
                return (
                  <div key={p.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"14px 0", borderBottom:"1px solid var(--border-light)" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                      <div style={{ width:40, height:40, borderRadius:12, background:"linear-gradient(135deg,#7c3aed,#a855f7)", display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontWeight:700, fontSize:15, flexShrink:0 }}>
                        {projectTitle.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight:600, fontSize:14, color:"var(--text-primary)" }}>{projectTitle}</div>
                        <div style={{ fontSize:12, color:"var(--text-muted)", marginTop:2 }}>
                          ${p.proposed_budget} · {p.delivery_time}
                        </div>
                      </div>
                    </div>
                    <span style={{ padding:"4px 12px", borderRadius:20, fontSize:11, fontWeight:700, backgroundColor:sc.bg, color:sc.color, border:`1px solid ${sc.border}`, textTransform:"capitalize", flexShrink:0 }}>
                      {p.status}
                    </span>
                  </div>
                );
              })
            )}
          </div>

          {/* New Projects */}
          <div style={{ backgroundColor:"var(--card)", borderRadius:16, padding:24, boxShadow:"0 1px 3px rgba(0,0,0,0.06)", border:"1px solid var(--border)" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
              <div>
                <h3 style={{ fontSize:16, fontWeight:700, color:"var(--text-primary)", margin:"0 0 4px" }}>New Projects</h3>
                <p style={{ fontSize:12, color:"var(--text-muted)", margin:0 }}>Recently posted opportunities</p>
              </div>
              <button onClick={() => onNavigate("browse")}
                style={{ fontSize:12, color:"#7c3aed", background:"none", border:"none", cursor:"pointer", fontWeight:600, fontFamily:"inherit" }}>
                Browse all →
              </button>
            </div>

            {openProjects.length === 0 ? (
              <div style={{ textAlign:"center", padding:"32px 0" }}>
                <div style={{ fontSize:40, marginBottom:12 }}>🔍</div>
                <p style={{ fontSize:14, color:"var(--text-muted)", margin:0 }}>No open projects right now</p>
              </div>
            ) : (
              openProjects.map(p => (
                <div key={p.id} style={{ padding:"14px 0", borderBottom:"1px solid var(--border-light)" }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor="var(--nav-active-bg)"}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor="transparent"}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                    <div style={{ flex:1, marginRight:12 }}>
                      <div style={{ fontWeight:600, fontSize:14, color:"var(--text-primary)", marginBottom:4 }}>{p.title}</div>
                      <div style={{ fontSize:12, color:"var(--text-muted)", lineHeight:1.5 }}>
                        {p.description?.length > 80 ? p.description.slice(0,80) + "..." : p.description}
                      </div>
                      {p.skills && (
                        <div style={{ display:"flex", gap:4, flexWrap:"wrap", marginTop:6 }}>
                          {p.skills.split(",").slice(0,3).map(sk => (
                            <span key={sk} style={{ padding:"2px 8px", background:"linear-gradient(135deg,#f5f3ff,#ede9fe)", color:"#7c3aed", borderRadius:20, fontSize:11, fontWeight:600, border:"1px solid #ddd6fe" }}>
                              {sk.trim()}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div style={{ textAlign:"right", flexShrink:0 }}>
                      <div style={{ fontWeight:700, color:"var(--text-primary)", fontSize:14 }}>${Number(p.budget).toLocaleString()}</div>
                      <div style={{ fontSize:11, color:"var(--text-muted)", marginTop:2 }}>{p.deadline || "—"}</div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>

        {/* Proposal Progress Bar */}
        {counts.total > 0 && (
          <div style={{ backgroundColor:"var(--card)", borderRadius:16, padding:24, marginTop:24, boxShadow:"0 1px 3px rgba(0,0,0,0.06)", border:"1px solid var(--border)" }}>
            <h3 style={{ fontSize:15, fontWeight:700, color:"var(--text-primary)", margin:"0 0 16px" }}>📊 Proposal Overview</h3>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(150px, 1fr))", gap:16, marginBottom:20 }}>
              {[
                { label:"Acceptance Rate", val: counts.total > 0 ? Math.round((counts.accepted / counts.total) * 100) + "%" : "0%", color:"#16a34a" },
                { label:"Pending Rate",    val: counts.total > 0 ? Math.round((counts.pending  / counts.total) * 100) + "%" : "0%", color:"#d97706" },
                { label:"Rejection Rate",  val: counts.total > 0 ? Math.round((counts.rejected / counts.total) * 100) + "%" : "0%", color:"#dc2626" },
              ].map(s => (
                <div key={s.label} style={{ textAlign:"center", padding:"16px", backgroundColor:"var(--page-bg)", borderRadius:12, border:"1px solid var(--border)" }}>
                  <div style={{ fontSize:24, fontWeight:800, color:s.color }}>{s.val}</div>
                  <div style={{ fontSize:12, color:"var(--text-muted)", marginTop:4 }}>{s.label}</div>
                </div>
              ))}
            </div>
            {/* Stacked bar */}
            <div style={{ height:10, borderRadius:20, overflow:"hidden", backgroundColor:"var(--input-background)", display:"flex" }}>
              {counts.accepted > 0 && (
                <div style={{ width:`${(counts.accepted / counts.total) * 100}%`, background:"linear-gradient(135deg,#16a34a,#22c55e)", transition:"width 0.5s ease" }} />
              )}
              {counts.pending > 0 && (
                <div style={{ width:`${(counts.pending / counts.total) * 100}%`, background:"linear-gradient(135deg,#f59e0b,#fbbf24)", transition:"width 0.5s ease" }} />
              )}
              {counts.rejected > 0 && (
                <div style={{ width:`${(counts.rejected / counts.total) * 100}%`, background:"linear-gradient(135deg,#ef4444,#dc2626)", transition:"width 0.5s ease" }} />
              )}
            </div>
            <div style={{ display:"flex", gap:16, marginTop:10 }}>
              {[
                { label:"Accepted", color:"#16a34a", bg:"var(--tint-green)"  },
                { label:"Pending",  color:"#d97706", bg:"var(--tint-orange)" },
                { label:"Rejected", color:"#dc2626", bg:"var(--tint-red)"    },
              ].map(l => (
                <div key={l.label} style={{ display:"flex", alignItems:"center", gap:6 }}>
                  <div style={{ width:10, height:10, borderRadius:"50%", backgroundColor:l.color }} />
                  <span style={{ fontSize:12, color:"var(--text-muted)" }}>{l.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}