import { useEffect, useState, useContext, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../utils/api";

export default function Contracts() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [projects, setProjects]   = useState([]);
  const [proposals, setProposals] = useState({});
  const [loading, setLoading]     = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const projRes = await api.get(`/projects/client/${user.id}`);
      const projs = projRes.data.filter(p => p.status === "in-progress" || p.status === "completed");
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
      console.error("Contracts error:", err.message);
    } finally { setLoading(false); }
  }, [user]);

  useEffect(() => { if (!user) return; fetchData(); }, [user, fetchData]);

  const markCompleted = async (projectId) => {
    try {
      await api.put(`/projects/${projectId}`, { status: "completed" });
      await fetchData();
    } catch (err) {
      console.error("Error completing:", err.message);
      await fetchData();
    }
  };

  const active      = projects.filter(p => p.status === "in-progress");
  const completed   = projects.filter(p => p.status === "completed");
  const totalBudget = projects.reduce((a, p) => a + Number(p.budget || 0), 0);

  if (loading) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:"100vh" }}>
      <p style={{ color:"var(--text-muted)" }}>Loading contracts...</p>
    </div>
  );

  return (
    <div style={{ fontFamily:"'Segoe UI',sans-serif", backgroundColor:"var(--page-bg)", minHeight:"100vh" }}>
      <div style={{ background:"linear-gradient(135deg,#1e3a5f 0%,#2563eb 50%,#3b82f6 100%)", padding:"24px 16px", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:-40, right:-40, width:200, height:200, borderRadius:"50%", background:"rgba(255,255,255,0.05)" }} />
        <div style={{ display:"inline-flex", alignItems:"center", gap:8, backgroundColor:"rgba(255,255,255,0.15)", borderRadius:20, padding:"4px 14px", fontSize:12, color:"white", fontWeight:600, marginBottom:10 }}>📄 Contracts</div>
        <h1 style={{ fontSize:28, fontWeight:800, color:"white", margin:"0 0 6px", letterSpacing:"-0.5px" }}>Contract Management</h1>
        <p style={{ fontSize:14, color:"rgba(255,255,255,0.75)", margin:0 }}>Track and manage your active and completed contracts</p>
      </div>

      <div style={{ padding:"20px 16px" }}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(160px, 1fr))", gap:16, marginBottom:32 }}>
          {[
            { label:"Active Contracts",    val:active.length,                     icon:"⚡", color:"#2563eb", bg:"var(--tint-blue)" },
            { label:"Completed Contracts", val:completed.length,                  icon:"✅", color:"#16a34a", bg:"var(--tint-green)" },
            { label:"Total Investment",    val:`$${totalBudget.toLocaleString()}`, icon:"💰", color:"#7c3aed", bg:"var(--tint-purple)" },
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

        {projects.length === 0 && (
          <div style={{ backgroundColor:"var(--card)", borderRadius:16, padding:"60px 32px", textAlign:"center", boxShadow:"0 1px 3px rgba(0,0,0,0.06)", border:"1px solid var(--border)" }}>
            <div style={{ fontSize:56, marginBottom:16 }}>📄</div>
            <h3 style={{ fontSize:18, fontWeight:700, color:"var(--text-primary)", marginBottom:8 }}>No contracts yet</h3>
            <p style={{ color:"var(--text-muted)", fontSize:14, marginBottom:20 }}>Contracts are created when you accept a freelancer proposal.</p>
            <button onClick={() => navigate("/projects")}
              style={{ padding:"12px 28px", background:"linear-gradient(135deg,#2563eb,#3b82f6)", color:"white", border:"none", borderRadius:10, cursor:"pointer", fontWeight:600, fontSize:14 }}>
              View Projects →
            </button>
          </div>
        )}

        {active.length > 0 && (
          <div style={{ marginBottom:32 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
              <div style={{ width:10, height:10, borderRadius:"50%", backgroundColor:"#f59e0b" }} />
              <h2 style={{ fontSize:18, fontWeight:700, color:"var(--text-primary)", margin:0 }}>Active Contracts</h2>
              <span style={{ backgroundColor:"var(--tint-orange)", color:"#d97706", borderRadius:20, padding:"2px 10px", fontSize:12, fontWeight:600 }}>{active.length}</span>
            </div>
            {active.map(p => (
              <ContractCard key={p.id} p={p} proposals={proposals[p.id] || []} navigate={navigate} onComplete={() => markCompleted(p.id)} />
            ))}
          </div>
        )}

        {completed.length > 0 && (
          <div style={{ marginBottom:32 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
              <div style={{ width:10, height:10, borderRadius:"50%", backgroundColor:"#16a34a" }} />
              <h2 style={{ fontSize:18, fontWeight:700, color:"var(--text-primary)", margin:0 }}>Completed Contracts</h2>
              <span style={{ backgroundColor:"var(--tint-green)", color:"#16a34a", borderRadius:20, padding:"2px 10px", fontSize:12, fontWeight:600 }}>{completed.length}</span>
            </div>
            {completed.map(p => (
              <ContractCard key={p.id} p={p} proposals={proposals[p.id] || []} navigate={navigate} onComplete={null} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ContractCard({ p, proposals, navigate, onComplete }) {
  const [completing, setCompleting]   = useState(false);
  const [risk, setRisk]               = useState(null);
  const [riskLoading, setRiskLoading] = useState(false);
  const [summary, setSummary]         = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [showRisk, setShowRisk]       = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  const accepted       = proposals.find(pr => pr.status === "accepted");
  const freelancerName = accepted?.freelancer_name || null;
  const statusStyle    = {
    "in-progress": { bg:"linear-gradient(135deg,#f59e0b,#f97316)", color:"white", label:"In Progress" },
    "completed":   { bg:"linear-gradient(135deg,#16a34a,#22c55e)", color:"white", label:"Completed" },
  };
  const s           = statusStyle[p.status] || statusStyle["in-progress"];
  const progressPct = p.status === "completed" ? 100 : 50;

  const handleComplete = async () => {
    setCompleting(true);
    await onComplete();
    setCompleting(false);
  };

  const fetchRisk = async () => {
    if (risk) { setShowRisk(v => !v); return; }
    setRiskLoading(true);
    setShowRisk(true);
    try {
      const token = localStorage.getItem("token");
      const res = await api.post("/ai/contract-risk", {
        title:                p.title,
        description:          p.description || "",
        skills:               p.skills || "",
        budget:               p.budget,
        deadline:             p.deadline || "",
        proposed_budget:      accepted?.proposed_budget || "",
        delivery_time:        accepted?.delivery_time || "",
        freelancer_experience:"N/A",
        freelancer_skills:    p.skills || "",
        role:                 "client",
      }, { headers: { Authorization: `Bearer ${token}` } });
      setRisk(res.data);
    } catch (err) {
      console.error("Risk error:", err.message);
    } finally {
      setRiskLoading(false);
    }
  };

  const fetchSummary = async () => {
    if (summary) { setShowSummary(v => !v); return; }
    setSummaryLoading(true);
    setShowSummary(true);
    try {
      const token = localStorage.getItem("token");
      const res = await api.post("/ai/contract-summary", {
        title:           p.title,
        description:     p.description || "",
        skills:          p.skills || "",
        budget:          p.budget,
        deadline:        p.deadline || "",
        status:          p.status,
        freelancer_name: freelancerName || "N/A",
        proposed_budget: accepted?.proposed_budget || "",
        delivery_time:   accepted?.delivery_time || "",
        role:            "client",
      }, { headers: { Authorization: `Bearer ${token}` } });
      setSummary(res.data);
    } catch (err) {
      console.error("Summary error:", err.message);
    } finally {
      setSummaryLoading(false);
    }
  };

  const riskColor = {
    "Low":    { bg:"var(--tint-green)",  border:"var(--tint-green-border)",  text:"#16a34a", badge:"var(--tint-green)",  badgeText:"#16a34a" },
    "Medium": { bg:"var(--tint-orange)", border:"var(--tint-orange-border)", text:"#d97706", badge:"var(--tint-orange)", badgeText:"#d97706" },
    "High":   { bg:"var(--tint-red)",    border:"var(--tint-red-border)",    text:"#dc2626", badge:"var(--tint-red)",    badgeText:"#dc2626" },
  };
  const rc = riskColor[risk?.risk_level] || riskColor["Medium"];

  return (
    <div style={{ backgroundColor:"var(--card)", borderRadius:16, padding:24, marginBottom:16, boxShadow:"0 1px 3px rgba(0,0,0,0.06)", border:"1px solid var(--border)" }}
      onMouseEnter={e => e.currentTarget.style.boxShadow="0 4px 16px rgba(0,0,0,0.1)"}
      onMouseLeave={e => e.currentTarget.style.boxShadow="0 1px 3px rgba(0,0,0,0.06)"}>

      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20 }}>
        <div>
          <h3 style={{ fontSize:18, fontWeight:700, color:"var(--text-primary)", margin:"0 0 6px" }}>{p.title}</h3>
          <p style={{ fontSize:13, color:"var(--text-muted)", margin:0, display:"flex", alignItems:"center", gap:6 }}>
            <span>👤</span>
            {freelancerName
              ? <span style={{ fontWeight:600, color:"var(--text-secondary)" }}>{freelancerName}</span>
              : <span>No freelancer assigned</span>}
          </p>
        </div>
        <span style={{ padding:"6px 16px", borderRadius:20, fontSize:12, fontWeight:700, background:s.bg, color:s.color, whiteSpace:"nowrap" }}>{s.label}</span>
      </div>

      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(100px, 1fr))", gap:16, marginBottom:20 }}>
        {[
          { label:"Budget",    val:`$${p.budget}` },
          { label:"Deadline",  val:p.deadline || "—" },
          { label:"Proposals", val:proposals.length },
          { label:"Progress",  val:`${progressPct}%` },
        ].map(item => (
          <div key={item.label}>
            <div style={{ fontSize:11, color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:4 }}>{item.label}</div>
            <div style={{ fontWeight:700, color:"var(--text-primary)", fontSize:16 }}>{item.val}</div>
          </div>
        ))}
      </div>

      {/* Skills */}
      {p.skills && (
        <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:16 }}>
          {p.skills.split(",").map(sk => (
            <span key={sk} style={{ padding:"3px 10px", background:"var(--tint-blue)", color:"var(--text-info)", borderRadius:20, fontSize:11, fontWeight:600, border:"1px solid var(--border)" }}>
              {sk.trim()}
            </span>
          ))}
        </div>
      )}

      {/* Progress Bar */}
      <div style={{ marginBottom:20 }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
          <span style={{ fontSize:12, color:"var(--text-muted)", fontWeight:600 }}>Project Progress</span>
          <span style={{ fontSize:12, color: p.status === "completed" ? "#16a34a" : "#2563eb", fontWeight:700 }}>{progressPct}%</span>
        </div>
        <div style={{ height:8, backgroundColor:"var(--input-background)", borderRadius:20, overflow:"hidden" }}>
          <div style={{ width:`${progressPct}%`, height:"100%", background: p.status === "completed" ? "linear-gradient(135deg,#16a34a,#22c55e)" : "linear-gradient(135deg,#2563eb,#3b82f6)", borderRadius:20, transition:"width 0.5s ease" }} />
        </div>
      </div>

      {/* Accepted Proposal Info */}
      {accepted && (
        <div style={{ backgroundColor:"var(--page-bg)", borderRadius:10, padding:"14px 16px", marginBottom:16, border:"1px solid var(--border)" }}>
          <div style={{ fontSize:12, fontWeight:700, color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:8 }}>Accepted Proposal</div>
          <div style={{ display:"flex", gap:24, flexWrap:"wrap" }}>
            <div><div style={{ fontSize:11, color:"var(--text-muted)" }}>Freelancer</div><div style={{ fontWeight:700, color:"var(--text-primary)", fontSize:14 }}>{freelancerName || "—"}</div></div>
            <div><div style={{ fontSize:11, color:"var(--text-muted)" }}>Proposed Budget</div><div style={{ fontWeight:700, color:"var(--text-primary)", fontSize:14 }}>${accepted.proposed_budget}</div></div>
            <div><div style={{ fontSize:11, color:"var(--text-muted)" }}>Delivery Time</div><div style={{ fontWeight:700, color:"var(--text-primary)", fontSize:14 }}>{accepted.delivery_time}</div></div>
            {accepted.cover_letter && (
              <div style={{ flex:1 }}>
                <div style={{ fontSize:11, color:"var(--text-muted)" }}>Cover Letter</div>
                <div style={{ fontSize:13, color:"var(--text-secondary)", lineHeight:1.5 }}>{accepted.cover_letter.length > 100 ? accepted.cover_letter.slice(0,100)+"..." : accepted.cover_letter}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Completion Banner */}
      {p.status === "completed" && (
        <div style={{ backgroundColor:"var(--tint-green)", border:"1px solid var(--tint-green-border)", borderRadius:10, padding:"12px 16px", marginBottom:16, display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ fontSize:20 }}>🎉</span>
          <div>
            <div style={{ fontWeight:700, color:"#16a34a", fontSize:14 }}>Contract Completed!</div>
            <div style={{ fontSize:12, color:"#4ade80" }}>This project has been successfully delivered.</div>
          </div>
        </div>
      )}

      {/* AI RISK PREDICTION PANEL */}
      {showRisk && (
        <div style={{ backgroundColor: riskLoading ? "var(--input-background)" : rc.bg, border:`1px solid ${riskLoading ? "var(--border)" : rc.border}`, borderRadius:12, padding:16, marginBottom:16 }}>
          {riskLoading ? (
            <div style={{ display:"flex", alignItems:"center", gap:8, color:"var(--text-muted)", fontSize:13 }}>
              <span>⏳</span> Analyzing contract risk...
            </div>
          ) : risk && (
            <>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
                <span style={{ fontSize:20 }}>🔮</span>
                <span style={{ fontWeight:700, color:"var(--text-primary)", fontSize:14 }}>Contract Risk Analysis</span>
                <span style={{ padding:"3px 12px", borderRadius:20, fontSize:12, fontWeight:700, backgroundColor:rc.badge, color:rc.badgeText }}>
                  {risk.risk_level} Risk
                </span>
                <span style={{ marginLeft:"auto", fontSize:13, fontWeight:700, color:rc.text }}>Score: {risk.risk_score}/100</span>
              </div>
              {risk.risk_factors?.length > 0 && (
                <div style={{ marginBottom:10 }}>
                  <div style={{ fontSize:12, fontWeight:600, color:"var(--text-secondary)", marginBottom:4 }}>⚠️ Risk Factors</div>
                  {risk.risk_factors.map((f, i) => (
                    <div key={i} style={{ fontSize:12, color:"var(--text-muted)", padding:"3px 0", display:"flex", gap:6 }}>
                      <span style={{ color:rc.text }}>•</span> {f}
                    </div>
                  ))}
                </div>
              )}
              {risk.positive_factors?.length > 0 && (
                <div style={{ marginBottom:10 }}>
                  <div style={{ fontSize:12, fontWeight:600, color:"var(--text-secondary)", marginBottom:4 }}>✅ Positive Factors</div>
                  {risk.positive_factors.map((f, i) => (
                    <div key={i} style={{ fontSize:12, color:"var(--text-muted)", padding:"3px 0", display:"flex", gap:6 }}>
                      <span style={{ color:"#16a34a" }}>•</span> {f}
                    </div>
                  ))}
                </div>
              )}
              {risk.recommendation && (
                <div style={{ backgroundColor:"rgba(255,255,255,0.6)", borderRadius:8, padding:"10px 12px", fontSize:12, color:"var(--text-secondary)", fontStyle:"italic" }}>
                  💡 {risk.recommendation}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* AI SUMMARY PANEL */}
      {showSummary && (
        <div style={{ backgroundColor: summaryLoading ? "var(--input-background)" : "var(--card)", border:"1px solid var(--border)", borderRadius:12, padding:16, marginBottom:16 }}>
          {summaryLoading ? (
            <div style={{ display:"flex", alignItems:"center", gap:8, color:"var(--text-muted)", fontSize:13 }}>
              <span>⏳</span> Generating AI summary...
            </div>
          ) : summary && (
            <>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
                <span style={{ fontSize:20 }}>🤖</span>
                <span style={{ fontWeight:700, color:"var(--text-primary)", fontSize:14 }}>AI Project Summary</span>
              </div>
              <p style={{ fontSize:13, color:"var(--text-secondary)", lineHeight:1.6, margin:"0 0 12px" }}>{summary.summary}</p>
              {summary.next_steps?.length > 0 && (
                <div style={{ marginBottom:10 }}>
                  <div style={{ fontSize:12, fontWeight:600, color:"var(--text-info)", marginBottom:4 }}>📋 Next Steps</div>
                  {summary.next_steps.map((s, i) => (
                    <div key={i} style={{ fontSize:12, color:"var(--text-secondary)", padding:"3px 0", display:"flex", gap:6 }}>
                      <span style={{ color:"var(--text-info)", fontWeight:700 }}>{i+1}.</span> {s}
                    </div>
                  ))}
                </div>
              )}
              {summary.tips?.length > 0 && (
                <div>
                  <div style={{ fontSize:12, fontWeight:600, color:"var(--text-info)", marginBottom:4 }}>💡 Tips</div>
                  {summary.tips.map((t, i) => (
                    <div key={i} style={{ fontSize:12, color:"var(--text-muted)", padding:"3px 0", display:"flex", gap:6 }}>
                      <span style={{ color:"var(--text-info)" }}>•</span> {t}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Actions */}
      <div style={{ display:"flex", gap:10, paddingTop:16, borderTop:"1px solid var(--border-light)", flexWrap:"wrap" }}>
        {onComplete && (
          <button onClick={handleComplete} disabled={completing}
            style={{ padding:"10px 20px", background: completing ? "var(--muted)" : "linear-gradient(135deg,#16a34a,#22c55e)", color: completing ? "var(--text-faint)" : "white", border:"none", borderRadius:8, cursor: completing ? "not-allowed" : "pointer", fontWeight:600, fontSize:13 }}>
            {completing ? "Completing..." : "✅ Mark Completed"}
          </button>
        )}
        <button onClick={() => navigate(`/view-proposals/${p.id}`)}
          style={{ padding:"10px 20px", background:"linear-gradient(135deg,#2563eb,#3b82f6)", color:"white", border:"none", borderRadius:8, cursor:"pointer", fontWeight:600, fontSize:13 }}>
          👁 View Proposals
        </button>
        {accepted && (
          <button onClick={() => navigate(`/messages?freelancer=${accepted.freelancer_id}&name=${encodeURIComponent(freelancerName || "Freelancer")}`)}
            style={{ padding:"10px 20px", background:"linear-gradient(135deg,#7c3aed,#a855f7)", color:"white", border:"none", borderRadius:8, cursor:"pointer", fontWeight:600, fontSize:13 }}>
            💬 Message {freelancerName ? freelancerName.split(" ")[0] : "Freelancer"}
          </button>
        )}
        <button onClick={fetchRisk}
          style={{ padding:"10px 20px", background: showRisk ? "var(--tint-orange)" : "linear-gradient(135deg,#f59e0b,#f97316)", color: showRisk ? "#d97706" : "white", border: showRisk ? "1.5px solid var(--tint-orange-border)" : "none", borderRadius:8, cursor:"pointer", fontWeight:600, fontSize:13, display:"flex", alignItems:"center", gap:6 }}>
          🔮 {showRisk ? "Hide Risk" : "Contract Risk"}
        </button>
        <button onClick={fetchSummary}
          style={{ padding:"10px 20px", background: showSummary ? "var(--tint-blue)" : "linear-gradient(135deg,#0369a1,#0ea5e9)", color: showSummary ? "var(--text-info)" : "white", border: showSummary ? "1.5px solid var(--border)" : "none", borderRadius:8, cursor:"pointer", fontWeight:600, fontSize:13, display:"flex", alignItems:"center", gap:6 }}>
          🤖 {showSummary ? "Hide Summary" : "AI Summary"}
        </button>
        <button onClick={() => navigate("/projects")}
          style={{ padding:"10px 20px", background:"linear-gradient(135deg,#d97706,#f59e0b)", color:"white", border:"none", borderRadius:8, cursor:"pointer", fontWeight:600, fontSize:13 }}>
          📁 View Project
        </button>
      </div>
    </div>
  );
}