import { useEffect, useState, useContext } from "react";
import { useNavigate, useParams, Navigate } from "react-router-dom";
import api from "../../utils/api";
import { AuthContext } from "../../context/AuthContext";

function Badge({ status }) {
  const map = {
    pending:  { bg:"#fff7ed", color:"#ea580c" },
    accepted: { bg:"#dcfce7", color:"#16a34a" },
    rejected: { bg:"#fee2e2", color:"#dc2626" },
  };
  const c = map[status] || map.pending;
  return (
    <span style={{ padding:"4px 14px", borderRadius:20, fontSize:12, fontWeight:600, backgroundColor:c.bg, color:c.color, textTransform:"capitalize" }}>
      {status}
    </span>
  );
}

export default function ViewProposals() {
  const { projectId } = useParams();
  const { user, logout, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [searchId, setSearchId]   = useState(projectId || "");

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get(`/proposals/project/${projectId}`);
      setProposals(res.data);
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(
        typeof detail === "string"
          ? detail
          : Array.isArray(detail)
            ? detail[0]?.msg || "Error loading proposals."
            : "Error loading proposals."
      );
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
    if (!searchId || isNaN(searchId) || Number(searchId) <= 0) {
      alert("Please enter a valid Project ID");
      return;
    }
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
    <div style={{ fontFamily:"'Segoe UI',sans-serif" }}>

      {/* Top Navbar */}
      <div style={{ backgroundColor:"#fff", padding:"16px 32px", display:"flex", justifyContent:"space-between", alignItems:"center", borderBottom:"1px solid #e5e7eb" }}>
        <span style={{ fontSize:18, fontWeight:700, color:"#111827" }}>Proposals</span>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ textAlign:"right" }}>
            <div style={{ fontWeight:600, fontSize:14, color:"#111827" }}>{user.name}</div>
            <div style={{ fontSize:12, color:"#6b7280" }}>Client</div>
          </div>
          <button onClick={() => { logout(); navigate("/"); }}
            style={{ padding:"8px 16px", border:"1px solid #e5e7eb", borderRadius:8, cursor:"pointer", fontSize:13, color:"#374151", background:"white" }}>
            Logout
          </button>
        </div>
      </div>

      <div style={{ padding:32 }}>

        {/* Project ID selector */}
        <div style={{ backgroundColor:"#fff", borderRadius:12, padding:"20px 24px", marginBottom:24, boxShadow:"0 1px 4px rgba(0,0,0,0.07)" }}>
          <div style={{ fontSize:14, fontWeight:600, color:"#374151", marginBottom:12 }}>🔍 View Proposals for a Project</div>
          <div style={{ display:"flex", gap:12 }}>
            <input
              type="number" min="1"
              placeholder="Enter Project ID (e.g. 1, 2, 3...)"
              value={searchId}
              onChange={e => setSearchId(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSearch()}
              style={{ flex:1, padding:"10px 14px", border:"1.5px solid #e5e7eb", borderRadius:8, fontSize:14, backgroundColor:"#f9fafb", outline:"none" }}
            />
            <button onClick={handleSearch}
              style={{ padding:"10px 24px", background:"linear-gradient(135deg,#2563eb,#3b82f6)", color:"white", border:"none", borderRadius:8, cursor:"pointer", fontWeight:600, fontSize:14 }}>
              View →
            </button>
          </div>
        </div>

        <h1 style={{ fontSize:26, fontWeight:700, color:"#111827", marginBottom:4 }}>Proposals for Project #{projectId}</h1>
        <p style={{ fontSize:14, color:"#6b7280", marginBottom:24 }}>{counts.total} proposal{counts.total !== 1 ? "s" : ""} received</p>

        {error && (
          <div style={{ backgroundColor:"#fef2f2", border:"1.5px solid #fecaca", borderRadius:8, padding:"10px 14px", fontSize:13, color:"#dc2626", marginBottom:16 }}>
            ⚠️ {error}
          </div>
        )}

        <div style={{ backgroundColor:"#fff", borderRadius:12, padding:"20px 28px", marginBottom:28, boxShadow:"0 1px 4px rgba(0,0,0,0.07)", display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16 }}>
          {[
            { label:"Total",    val:counts.total,    color:"#111827" },
            { label:"Pending",  val:counts.pending,  color:"#ea580c" },
            { label:"Accepted", val:counts.accepted, color:"#16a34a" },
            { label:"Rejected", val:counts.rejected, color:"#ef4444" },
          ].map(s => (
            <div key={s.label}>
              <div style={{ fontSize:13, color:"#6b7280" }}>{s.label}</div>
              <div style={{ fontSize:22, fontWeight:700, color:s.color, marginTop:4 }}>{s.val}</div>
            </div>
          ))}
        </div>

        {loading && <p style={{ color:"#6b7280" }}>Loading proposals...</p>}

        {!loading && proposals.length === 0 && (
          <div style={{ backgroundColor:"#fff", borderRadius:12, padding:"60px 32px", textAlign:"center", boxShadow:"0 1px 4px rgba(0,0,0,0.07)" }}>
            <div style={{ fontSize:48, marginBottom:12 }}>📭</div>
            <p style={{ color:"#6b7280", fontSize:15 }}>No proposals received yet for this project.</p>
          </div>
        )}

        {proposals.map(p => (
          <div key={p.id} style={{ backgroundColor:"#fff", borderRadius:12, padding:24, marginBottom:16, boxShadow:"0 1px 4px rgba(0,0,0,0.07)" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                <div style={{ width:44, height:44, borderRadius:"50%", background:"linear-gradient(135deg,#7c3aed,#a855f7)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:18, color:"white" }}>
                  {String(p.freelancer_id).charAt(0)}
                </div>
                <div>
                  <div style={{ fontWeight:700, fontSize:15, color:"#111827" }}>Freelancer #{p.freelancer_id}</div>
                  <div style={{ fontSize:13, color:"#6b7280", marginTop:2 }}>Proposal #{p.id}</div>
                </div>
              </div>
              <Badge status={p.status} />
            </div>

            {p.cover_letter && (
              <>
                <div style={{ fontWeight:600, fontSize:13, color:"#374151", marginBottom:6 }}>Cover Letter</div>
                <div style={{ fontSize:14, color:"#374151", lineHeight:1.7, backgroundColor:"#f9fafb", padding:"12px", borderRadius:8 }}>{p.cover_letter}</div>
              </>
            )}

            <div style={{ display:"flex", gap:32, marginTop:16, paddingTop:16, borderTop:"1px solid #f3f4f6" }}>
              <div style={{ fontSize:13, color:"#6b7280" }}>Budget <strong style={{ display:"block", color:"#111827", marginTop:2 }}>${p.proposed_budget}</strong></div>
              <div style={{ fontSize:13, color:"#6b7280" }}>Delivery <strong style={{ display:"block", color:"#111827", marginTop:2 }}>{p.delivery_time}</strong></div>
              {p.created_at && <div style={{ fontSize:13, color:"#6b7280" }}>Submitted <strong style={{ display:"block", color:"#111827", marginTop:2 }}>{new Date(p.created_at).toLocaleDateString()}</strong></div>}
            </div>

            {p.status === "pending" && (
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginTop:16 }}>
                <button onClick={() => accept(p.id)}
                  style={{ padding:11, background:"linear-gradient(135deg,#16a34a,#22c55e)", color:"white", border:"none", borderRadius:8, cursor:"pointer", fontWeight:600, fontSize:14 }}>
                  ✓ Accept Proposal
                </button>
                <button onClick={() => reject(p.id)}
                  style={{ padding:11, backgroundColor:"#ef4444", color:"white", border:"none", borderRadius:8, cursor:"pointer", fontWeight:600, fontSize:14 }}>
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