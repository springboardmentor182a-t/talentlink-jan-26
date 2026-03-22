import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../utils/api";

export default function Contracts() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [projects, setProjects]   = useState([]);
  const [proposals, setProposals] = useState({});
  const [loading, setLoading]     = useState(true);

  const fetchData = async () => {
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
  };

  useEffect(() => { if (!user) return; fetchData(); }, [user]);

  const markCompleted = async (projectId) => {
    try {
      // Update project status to completed
      await api.put(`/projects/${projectId}`, { status: "completed" });
      // Update contract status to completed
      await api.put(`/contracts/complete/${projectId}`);
      await fetchData();
    } catch (err) {
      console.error("Error completing:", err.message);
      // Even if contract update fails, refresh to show updated project
      await fetchData();
    }
  };

  const active    = projects.filter(p => p.status === "in-progress");
  const completed = projects.filter(p => p.status === "completed");
  const totalBudget = projects.reduce((a, p) => a + Number(p.budget || 0), 0);

  if (loading) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:"100vh" }}>
      <p style={{ color:"#64748b" }}>Loading contracts...</p>
    </div>
  );

  return (
    <div style={{ fontFamily:"'Segoe UI',sans-serif", backgroundColor:"#f8fafc", minHeight:"100vh" }}>

      {/* Hero */}
      <div style={{ background:"linear-gradient(135deg,#1e3a5f 0%,#2563eb 50%,#3b82f6 100%)", padding:"32px 32px", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:-40, right:-40, width:200, height:200, borderRadius:"50%", background:"rgba(255,255,255,0.05)" }} />
        <div style={{ position:"absolute", bottom:-30, left:300, width:150, height:150, borderRadius:"50%", background:"rgba(255,255,255,0.05)" }} />
        <div style={{ display:"inline-flex", alignItems:"center", gap:8, backgroundColor:"rgba(255,255,255,0.15)", borderRadius:20, padding:"4px 14px", fontSize:12, color:"white", fontWeight:600, marginBottom:10 }}>
          📄 Contracts
        </div>
        <h1 style={{ fontSize:28, fontWeight:800, color:"white", margin:"0 0 6px", letterSpacing:"-0.5px" }}>Contract Management</h1>
        <p style={{ fontSize:14, color:"rgba(255,255,255,0.75)", margin:0 }}>Track and manage your active and completed contracts</p>
      </div>

      <div style={{ padding:32 }}>

        {/* Stats */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16, marginBottom:32 }}>
          {[
            { label:"Active Contracts",    val:active.length,                     icon:"⚡", color:"#2563eb", bg:"#eff6ff" },
            { label:"Completed Contracts", val:completed.length,                  icon:"✅", color:"#16a34a", bg:"#f0fdf4" },
            { label:"Total Investment",    val:`$${totalBudget.toLocaleString()}`, icon:"💰", color:"#7c3aed", bg:"#f5f3ff" },
          ].map(s => (
            <div key={s.label} style={{ backgroundColor:"#fff", borderRadius:16, padding:"22px 24px", boxShadow:"0 1px 3px rgba(0,0,0,0.06)", border:"1px solid #e2e8f0", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div>
                <div style={{ fontSize:12, color:"#64748b", marginBottom:6, textTransform:"uppercase", letterSpacing:"0.5px" }}>{s.label}</div>
                <div style={{ fontSize:28, fontWeight:800, color:s.color }}>{s.val}</div>
              </div>
              <div style={{ width:48, height:48, borderRadius:14, backgroundColor:s.bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:24 }}>{s.icon}</div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {projects.length === 0 && (
          <div style={{ backgroundColor:"#fff", borderRadius:16, padding:"60px 32px", textAlign:"center", boxShadow:"0 1px 3px rgba(0,0,0,0.06)", border:"1px solid #e2e8f0" }}>
            <div style={{ fontSize:56, marginBottom:16 }}>📄</div>
            <h3 style={{ fontSize:18, fontWeight:700, color:"#111827", marginBottom:8 }}>No contracts yet</h3>
            <p style={{ color:"#64748b", fontSize:14, marginBottom:20 }}>Contracts are created when you accept a freelancer proposal.</p>
            <button onClick={() => navigate("/projects")}
              style={{ padding:"12px 28px", background:"linear-gradient(135deg,#2563eb,#3b82f6)", color:"white", border:"none", borderRadius:10, cursor:"pointer", fontWeight:600, fontSize:14, boxShadow:"0 4px 12px rgba(37,99,235,0.3)" }}>
              View Projects →
            </button>
          </div>
        )}

        {/* Active Contracts */}
        {active.length > 0 && (
          <div style={{ marginBottom:32 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
              <div style={{ width:10, height:10, borderRadius:"50%", backgroundColor:"#f59e0b" }} />
              <h2 style={{ fontSize:18, fontWeight:700, color:"#111827", margin:0 }}>Active Contracts</h2>
              <span style={{ backgroundColor:"#fef3c7", color:"#d97706", borderRadius:20, padding:"2px 10px", fontSize:12, fontWeight:600 }}>{active.length}</span>
            </div>
            {active.map(p => (
              <ContractCard key={p.id} p={p} proposals={proposals[p.id] || []} navigate={navigate} onComplete={() => markCompleted(p.id)} />
            ))}
          </div>
        )}

        {/* Completed Contracts */}
        {completed.length > 0 && (
          <div style={{ marginBottom:32 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
              <div style={{ width:10, height:10, borderRadius:"50%", backgroundColor:"#16a34a" }} />
              <h2 style={{ fontSize:18, fontWeight:700, color:"#111827", margin:0 }}>Completed Contracts</h2>
              <span style={{ backgroundColor:"#dcfce7", color:"#16a34a", borderRadius:20, padding:"2px 10px", fontSize:12, fontWeight:600 }}>{completed.length}</span>
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
  const [completing, setCompleting] = useState(false);
  const accepted = proposals.find(pr => pr.status === "accepted");

  const statusStyle = {
    "in-progress": { bg:"linear-gradient(135deg,#f59e0b,#f97316)", color:"white", label:"In Progress" },
    "completed":   { bg:"linear-gradient(135deg,#16a34a,#22c55e)", color:"white", label:"Completed" },
  };
  const s = statusStyle[p.status] || statusStyle["in-progress"];
  const progressPct = p.status === "completed" ? 100 : 50;

  const handleComplete = async () => {
    setCompleting(true);
    await onComplete();
    setCompleting(false);
  };

  return (
    <div style={{ backgroundColor:"#fff", borderRadius:16, padding:24, marginBottom:16, boxShadow:"0 1px 3px rgba(0,0,0,0.06)", border:"1px solid #e2e8f0" }}
      onMouseEnter={e => e.currentTarget.style.boxShadow="0 4px 16px rgba(0,0,0,0.1)"}
      onMouseLeave={e => e.currentTarget.style.boxShadow="0 1px 3px rgba(0,0,0,0.06)"}>

      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20 }}>
        <div>
          <h3 style={{ fontSize:18, fontWeight:700, color:"#111827", margin:"0 0 6px" }}>{p.title}</h3>
          <p style={{ fontSize:13, color:"#64748b", margin:0 }}>
            {accepted ? `Freelancer #${accepted.freelancer_id}` : "No freelancer assigned"}
          </p>
        </div>
        <span style={{ padding:"6px 16px", borderRadius:20, fontSize:12, fontWeight:700, background:s.bg, color:s.color, whiteSpace:"nowrap" }}>
          {s.label}
        </span>
      </div>

      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:20 }}>
        <div>
          <div style={{ fontSize:11, color:"#64748b", textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:4 }}>Budget</div>
          <div style={{ fontWeight:700, color:"#111827", fontSize:16 }}>${p.budget}</div>
        </div>
        <div>
          <div style={{ fontSize:11, color:"#64748b", textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:4 }}>Deadline</div>
          <div style={{ fontWeight:700, color:"#111827", fontSize:16 }}>{p.deadline || "—"}</div>
        </div>
        <div>
          <div style={{ fontSize:11, color:"#64748b", textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:4 }}>Proposals</div>
          <div style={{ fontWeight:700, color:"#111827", fontSize:16 }}>{proposals.length}</div>
        </div>
        <div>
          <div style={{ fontSize:11, color:"#64748b", textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:4 }}>Progress</div>
          <div style={{ fontWeight:700, color:"#111827", fontSize:16 }}>{progressPct}%</div>
        </div>
      </div>

      {/* Skills */}
      {p.skills && (
        <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:16 }}>
          {p.skills.split(",").map(sk => (
            <span key={sk} style={{ padding:"3px 10px", background:"linear-gradient(135deg,#eff6ff,#dbeafe)", color:"#1d4ed8", borderRadius:20, fontSize:11, fontWeight:600, border:"1px solid #bfdbfe" }}>
              {sk.trim()}
            </span>
          ))}
        </div>
      )}

      {/* Progress Bar */}
      <div style={{ marginBottom:20 }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
          <span style={{ fontSize:12, color:"#64748b", fontWeight:600 }}>Project Progress</span>
          <span style={{ fontSize:12, color: p.status === "completed" ? "#16a34a" : "#2563eb", fontWeight:700 }}>{progressPct}%</span>
        </div>
        <div style={{ height:8, backgroundColor:"#f1f5f9", borderRadius:20, overflow:"hidden" }}>
          <div style={{ width:`${progressPct}%`, height:"100%", background: p.status === "completed" ? "linear-gradient(135deg,#16a34a,#22c55e)" : "linear-gradient(135deg,#2563eb,#3b82f6)", borderRadius:20, transition:"width 0.5s ease" }} />
        </div>
      </div>

      {/* Accepted proposal info */}
      {accepted && (
        <div style={{ backgroundColor:"#f8fafc", borderRadius:10, padding:"14px 16px", marginBottom:16, border:"1px solid #e2e8f0" }}>
          <div style={{ fontSize:12, fontWeight:700, color:"#64748b", textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:8 }}>Accepted Proposal</div>
          <div style={{ display:"flex", gap:24 }}>
            <div>
              <div style={{ fontSize:11, color:"#64748b" }}>Proposed Budget</div>
              <div style={{ fontWeight:700, color:"#111827", fontSize:14 }}>${accepted.proposed_budget}</div>
            </div>
            <div>
              <div style={{ fontSize:11, color:"#64748b" }}>Delivery Time</div>
              <div style={{ fontWeight:700, color:"#111827", fontSize:14 }}>{accepted.delivery_time}</div>
            </div>
            {accepted.cover_letter && (
              <div style={{ flex:1 }}>
                <div style={{ fontSize:11, color:"#64748b" }}>Cover Letter</div>
                <div style={{ fontSize:13, color:"#374151", lineHeight:1.5 }}>
                  {accepted.cover_letter.length > 100 ? accepted.cover_letter.slice(0,100) + "..." : accepted.cover_letter}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Completion Banner */}
      {p.status === "completed" && (
        <div style={{ backgroundColor:"#f0fdf4", border:"1px solid #86efac", borderRadius:10, padding:"12px 16px", marginBottom:16, display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ fontSize:20 }}>🎉</span>
          <div>
            <div style={{ fontWeight:700, color:"#16a34a", fontSize:14 }}>Contract Completed!</div>
            <div style={{ fontSize:12, color:"#4ade80" }}>This project has been successfully delivered.</div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div style={{ display:"flex", gap:10, paddingTop:16, borderTop:"1px solid #f1f5f9" }}>
        {onComplete && (
          <button onClick={handleComplete} disabled={completing}
            style={{ padding:"10px 20px", background: completing ? "#cbd5e1" : "linear-gradient(135deg,#16a34a,#22c55e)", color:"white", border:"none", borderRadius:8, cursor: completing ? "not-allowed" : "pointer", fontWeight:600, fontSize:13, boxShadow:"0 2px 8px rgba(22,163,74,0.3)", display:"flex", alignItems:"center", gap:6 }}>
            {completing ? "Completing..." : "✅ Mark Completed"}
          </button>
        )}
        <button onClick={() => navigate(`/view-proposals/${p.id}`)}
          style={{ padding:"10px 20px", background:"linear-gradient(135deg,#2563eb,#3b82f6)", color:"white", border:"none", borderRadius:8, cursor:"pointer", fontWeight:600, fontSize:13, boxShadow:"0 2px 8px rgba(37,99,235,0.3)" }}>
          👁 View Proposals
        </button>
        <button onClick={() => navigate("/projects")}
          style={{ padding:"10px 20px", backgroundColor:"white", color:"#374151", border:"1.5px solid #e2e8f0", borderRadius:8, cursor:"pointer", fontWeight:600, fontSize:13 }}>
          📁 View Project
        </button>
      </div>
    </div>
  );
}