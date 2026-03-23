import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import api from "../../utils/api";

export default function FreelancerContracts({ onNavigate }) {
  const { user } = useContext(AuthContext);
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchContracts = async () => {
      try {
        const res = await api.get(`/proposals/freelancer/${user.id}`);
        const accepted = res.data.filter(p => p.status === "accepted");
        const enriched = await Promise.all(
          accepted.map(async (p) => {
            try {
              const projRes = await api.get(`/projects/${p.project_id}`);
              return { ...p, project: projRes.data };
            } catch {
              return { ...p, project: null };
            }
          })
        );
        setContracts(enriched);
      } catch (err) {
        console.error("Contracts error:", err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchContracts();
  }, [user]);

  const active        = contracts.filter(c => c.project?.status === "in-progress");
  const completed     = contracts.filter(c => c.project?.status === "completed");
  const totalEarnings = completed.reduce((sum, c) => sum + Number(c.proposed_budget || 0), 0);

  if (loading) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:"60vh" }}>
      <p style={{ color:"#64748b" }}>Loading contracts...</p>
    </div>
  );

  return (
    <div style={{ fontFamily:"'Segoe UI',sans-serif", backgroundColor:"#f8fafc", minHeight:"100vh" }}>

      {/* Hero */}
      <div style={{ background:"linear-gradient(135deg,#3b0764 0%,#7c3aed 40%,#a855f7 100%)", padding:"32px 32px", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:-40, right:-40, width:200, height:200, borderRadius:"50%", background:"rgba(255,255,255,0.05)" }} />
        <div style={{ position:"absolute", bottom:-30, left:300, width:150, height:150, borderRadius:"50%", background:"rgba(255,255,255,0.05)" }} />
        <div style={{ display:"inline-flex", alignItems:"center", gap:8, backgroundColor:"rgba(255,255,255,0.15)", borderRadius:20, padding:"4px 14px", fontSize:12, color:"white", fontWeight:600, marginBottom:10 }}>
          📄 My Contracts
        </div>
        <h1 style={{ fontSize:28, fontWeight:800, color:"white", margin:"0 0 6px", letterSpacing:"-0.5px" }}>Contracts</h1>
        <p style={{ fontSize:14, color:"rgba(255,255,255,0.75)", margin:0 }}>Track your active and completed work</p>
      </div>

      <div style={{ padding:32 }}>

        {/* Stats */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16, marginBottom:32 }}>
          {[
            { label:"Active Contracts",    val:active.length,                        icon:"⚡", color:"#7c3aed", bg:"#f5f3ff" },
            { label:"Completed Contracts", val:completed.length,                     icon:"✅", color:"#16a34a", bg:"#f0fdf4" },
            { label:"Total Earnings",      val:`$${totalEarnings.toLocaleString()}`, icon:"💰", color:"#2563eb", bg:"#eff6ff" },
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

        {/* Empty state */}
        {contracts.length === 0 && (
          <div style={{ backgroundColor:"#fff", borderRadius:16, padding:"60px 32px", textAlign:"center", boxShadow:"0 1px 3px rgba(0,0,0,0.06)", border:"1px solid #e2e8f0" }}>
            <div style={{ fontSize:56, marginBottom:16 }}>📄</div>
            <h3 style={{ fontSize:18, fontWeight:700, color:"#111827", marginBottom:8 }}>No contracts yet</h3>
            <p style={{ color:"#64748b", fontSize:14, marginBottom:20 }}>Contracts appear here when a client accepts your proposal.</p>
            <button onClick={() => onNavigate && onNavigate("browse")}
              style={{ padding:"12px 28px", background:"linear-gradient(135deg,#7c3aed,#a855f7)", color:"white", border:"none", borderRadius:10, cursor:"pointer", fontWeight:600, fontSize:14, boxShadow:"0 4px 12px rgba(124,58,237,0.3)" }}>
              Browse Projects →
            </button>
          </div>
        )}

        {/* Active Contracts */}
        {active.length > 0 && (
          <div style={{ marginBottom:32 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
              <div style={{ width:10, height:10, borderRadius:"50%", backgroundColor:"#a855f7" }} />
              <h2 style={{ fontSize:18, fontWeight:700, color:"#111827", margin:0 }}>Active Contracts</h2>
              <span style={{ backgroundColor:"#f3e8ff", color:"#7c3aed", borderRadius:20, padding:"2px 10px", fontSize:12, fontWeight:600 }}>{active.length}</span>
            </div>
            {active.map(c => <ContractCard key={c.id} contract={c} onNavigate={onNavigate} />)}
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
            {completed.map(c => <ContractCard key={c.id} contract={c} onNavigate={onNavigate} completed />)}
          </div>
        )}
      </div>
    </div>
  );
}

function ContractCard({ contract, onNavigate, completed }) {
  const p           = contract.project;
  const status      = p?.status || "in-progress";
  const progressPct = status === "completed" ? 100 : 50;

  const statusStyle = {
    "in-progress": { bg:"linear-gradient(135deg,#7c3aed,#a855f7)", color:"white", label:"In Progress" },
    "completed":   { bg:"linear-gradient(135deg,#16a34a,#22c55e)", color:"white", label:"Completed"   },
  };
  const s = statusStyle[status] || statusStyle["in-progress"];

  return (
    <div style={{ backgroundColor:"#fff", borderRadius:16, padding:24, marginBottom:16, boxShadow:"0 1px 3px rgba(0,0,0,0.06)", border:"1px solid #e2e8f0" }}
      onMouseEnter={e => e.currentTarget.style.boxShadow="0 4px 16px rgba(0,0,0,0.1)"}
      onMouseLeave={e => e.currentTarget.style.boxShadow="0 1px 3px rgba(0,0,0,0.06)"}>

      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20 }}>
        <div>
          <h3 style={{ fontSize:18, fontWeight:700, color:"#111827", margin:"0 0 6px" }}>
            {p?.title || contract.project_title || `Project #${contract.project_id}`}
          </h3>
          <p style={{ fontSize:13, color:"#64748b", margin:0 }}>
            Proposal accepted · You are the assigned freelancer
          </p>
        </div>
        <span style={{ padding:"6px 16px", borderRadius:20, fontSize:12, fontWeight:700, background:s.bg, color:s.color, whiteSpace:"nowrap" }}>
          {s.label}
        </span>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:20 }}>
        <div>
          <div style={{ fontSize:11, color:"#64748b", textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:4 }}>Your Bid</div>
          <div style={{ fontWeight:700, color:"#111827", fontSize:16 }}>${contract.proposed_budget}</div>
        </div>
        <div>
          <div style={{ fontSize:11, color:"#64748b", textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:4 }}>Delivery Time</div>
          <div style={{ fontWeight:700, color:"#111827", fontSize:16 }}>{contract.delivery_time || "—"}</div>
        </div>
        <div>
          <div style={{ fontSize:11, color:"#64748b", textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:4 }}>Project Budget</div>
          <div style={{ fontWeight:700, color:"#111827", fontSize:16 }}>${p?.budget || "—"}</div>
        </div>
        <div>
          <div style={{ fontSize:11, color:"#64748b", textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:4 }}>Progress</div>
          <div style={{ fontWeight:700, color:"#111827", fontSize:16 }}>{progressPct}%</div>
        </div>
      </div>

      {p?.skills && (
        <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:16 }}>
          {p.skills.split(",").map(sk => (
            <span key={sk} style={{ padding:"3px 10px", background:"linear-gradient(135deg,#f5f3ff,#ede9fe)", color:"#7c3aed", borderRadius:20, fontSize:11, fontWeight:600, border:"1px solid #ddd6fe" }}>
              {sk.trim()}
            </span>
          ))}
        </div>
      )}

      <div style={{ marginBottom:20 }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
          <span style={{ fontSize:12, color:"#64748b", fontWeight:600 }}>Project Progress</span>
          <span style={{ fontSize:12, color: status === "completed" ? "#16a34a" : "#7c3aed", fontWeight:700 }}>{progressPct}%</span>
        </div>
        <div style={{ height:8, backgroundColor:"#f1f5f9", borderRadius:20, overflow:"hidden" }}>
          <div style={{ width:`${progressPct}%`, height:"100%", background: status === "completed" ? "linear-gradient(135deg,#16a34a,#22c55e)" : "linear-gradient(135deg,#7c3aed,#a855f7)", borderRadius:20, transition:"width 0.5s ease" }} />
        </div>
      </div>

      {contract.cover_letter && (
        <div style={{ backgroundColor:"#f8fafc", borderRadius:10, padding:"14px 16px", marginBottom:16, border:"1px solid #e2e8f0" }}>
          <div style={{ fontSize:12, fontWeight:700, color:"#64748b", textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:6 }}>Your Cover Letter</div>
          <div style={{ fontSize:13, color:"#374151", lineHeight:1.6 }}>
            {contract.cover_letter.length > 120 ? contract.cover_letter.slice(0,120) + "..." : contract.cover_letter}
          </div>
        </div>
      )}

      {completed && (
        <div style={{ backgroundColor:"#f0fdf4", border:"1px solid #86efac", borderRadius:10, padding:"12px 16px", marginBottom:16, display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ fontSize:20 }}>🎉</span>
          <div>
            <div style={{ fontWeight:700, color:"#16a34a", fontSize:14 }}>Contract Completed!</div>
            <div style={{ fontSize:12, color:"#4ade80" }}>This project has been successfully delivered.</div>
          </div>
        </div>
      )}

      <div style={{ display:"flex", gap:10, paddingTop:16, borderTop:"1px solid #f1f5f9", flexWrap:"wrap" }}>
        <button onClick={() => onNavigate && onNavigate("messages")}
          style={{ padding:"10px 20px", background:"linear-gradient(135deg,#7c3aed,#a855f7)", color:"white", border:"none", borderRadius:8, cursor:"pointer", fontWeight:600, fontSize:13, boxShadow:"0 2px 8px rgba(124,58,237,0.3)", display:"flex", alignItems:"center", gap:6 }}>
          💬 Message Client
        </button>
        <button onClick={() => onNavigate && onNavigate("proposals")}
          style={{ padding:"10px 20px", backgroundColor:"white", color:"#374151", border:"1.5px solid #e2e8f0", borderRadius:8, cursor:"pointer", fontWeight:600, fontSize:13 }}>
          📋 View My Proposals
        </button>
      </div>
    </div>
  );
}