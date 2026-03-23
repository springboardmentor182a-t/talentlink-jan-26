import { useEffect, useState, useContext } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import api from "../utils/api";
import { AuthContext } from "../context/AuthContext";

export default function Projects() {
  const { user, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [projects, setProjects]             = useState([]);
  const [filtered, setFiltered]             = useState([]);
  const [loading, setLoading]               = useState(true);
  const [filter, setFilter]                 = useState("all");
  const [editProject, setEditProject]       = useState(null);
  const [editForm, setEditForm]             = useState({});
  const [saving, setSaving]                 = useState(false);
  const [proposalCounts, setProposalCounts] = useState({});

  useEffect(() => { if (!user) return; fetchProjects(); }, [user]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/projects/client/${user.id}`);
      setProjects(res.data);
      setFiltered(res.data);
      const counts = {};
      await Promise.all(res.data.map(async p => {
        try {
          const r = await api.get(`/proposals/project/${p.id}`);
          counts[p.id] = r.data.length;
        } catch { counts[p.id] = 0; }
      }));
      setProposalCounts(counts);
    } catch (err) { console.error("Error:", err.message); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (filter === "all") setFiltered(projects);
    else setFiltered(projects.filter(p => p.status === filter));
  }, [filter, projects]);

  const closeProject = async (id) => {
    try {
      await api.put(`/projects/${id}/close`);
      setProjects(prev => prev.map(p => p.id === id ? { ...p, status:"closed" } : p));
    } catch (err) { console.error("Error closing:", err.message); }
  };

  const openEdit = (p) => {
    setEditProject(p);
    setEditForm({ title:p.title, description:p.description, budget:p.budget, deadline:p.deadline });
  };

  const saveEdit = async () => {
    try {
      setSaving(true);
      await api.put(`/projects/${editProject.id}`, editForm);
      setProjects(prev => prev.map(p => p.id === editProject.id ? { ...p, ...editForm } : p));
      setEditProject(null);
    } catch (err) { console.error("Error saving:", err.message); }
    finally { setSaving(false); }
  };

  if (authLoading) return <div style={{ padding:32 }}>Loading...</div>;
  if (!user) return <Navigate to="/client/login" replace />;

  return (
    <div style={{ fontFamily:"'Segoe UI',sans-serif", backgroundColor:"#f8fafc", minHeight:"100vh" }}>

      {/* Hero */}
      <div style={{ background:"linear-gradient(135deg,#1e3a5f 0%,#2563eb 50%,#3b82f6 100%)", padding:"32px 32px", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:-40, right:-40, width:180, height:180, borderRadius:"50%", background:"rgba(255,255,255,0.05)" }} />
        <div style={{ display:"inline-flex", alignItems:"center", gap:8, backgroundColor:"rgba(255,255,255,0.15)", borderRadius:20, padding:"4px 14px", fontSize:12, color:"white", fontWeight:600, marginBottom:10 }}>
          📁 My Projects
        </div>
        <h1 style={{ fontSize:28, fontWeight:800, color:"white", margin:"0 0 6px", letterSpacing:"-0.5px" }}>Project Management</h1>
        <p style={{ fontSize:14, color:"rgba(255,255,255,0.75)", margin:0 }}>View, edit, and manage all your posted projects</p>
      </div>

      <div style={{ padding:32 }}>

        {/* Filter Bar */}
        <div style={{ backgroundColor:"#fff", borderRadius:12, padding:"16px 24px", marginBottom:24, boxShadow:"0 1px 3px rgba(0,0,0,0.06)", border:"1px solid #e2e8f0", display:"flex", alignItems:"center", gap:16 }}>
          <span style={{ fontSize:14, color:"#374151", fontWeight:600 }}>Filter by status:</span>
          <div style={{ position:"relative" }}>
            <select value={filter} onChange={e => setFilter(e.target.value)}
              style={{ padding:"8px 40px 8px 16px", border:"1.5px solid #e2e8f0", borderRadius:8, fontSize:14, outline:"none", cursor:"pointer", backgroundColor:"#fff", appearance:"none", minWidth:160 }}>
              <option value="all">All Projects</option>
              <option value="open">Open</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="closed">Closed</option>
            </select>
            <span style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", pointerEvents:"none", color:"#64748b", fontSize:11 }}>▼</span>
          </div>
          <div style={{ marginLeft:"auto", display:"flex", gap:12, alignItems:"center" }}>
            <span style={{ fontSize:13, color:"#64748b" }}>{filtered.length} project{filtered.length !== 1 ? "s" : ""}</span>
            <button onClick={() => navigate("/post-project")}
              style={{ padding:"10px 20px", background:"linear-gradient(135deg,#2563eb,#3b82f6)", color:"white", border:"none", borderRadius:8, cursor:"pointer", fontWeight:600, fontSize:14, boxShadow:"0 2px 8px rgba(37,99,235,0.3)" }}>
              + Post New Project
            </button>
          </div>
        </div>

        {loading && (
          <div style={{ backgroundColor:"#fff", borderRadius:12, padding:"40px 32px", textAlign:"center" }}>
            <p style={{ color:"#64748b" }}>Loading projects...</p>
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div style={{ backgroundColor:"#fff", borderRadius:12, padding:"60px 32px", textAlign:"center", boxShadow:"0 1px 3px rgba(0,0,0,0.06)", border:"1px solid #e2e8f0" }}>
            <div style={{ fontSize:56, marginBottom:16 }}>📁</div>
            <h3 style={{ fontSize:18, fontWeight:700, color:"#111827", marginBottom:8 }}>No projects yet</h3>
            <p style={{ color:"#64748b", fontSize:14, marginBottom:20 }}>Post your first project and start receiving proposals.</p>
            <button onClick={() => navigate("/post-project")}
              style={{ padding:"12px 28px", background:"linear-gradient(135deg,#2563eb,#3b82f6)", color:"white", border:"none", borderRadius:10, cursor:"pointer", fontWeight:600, fontSize:14 }}>
              Post Your First Project →
            </button>
          </div>
        )}

        {filtered.map(p => (
          <div key={p.id} style={{ backgroundColor:"#fff", borderRadius:16, padding:24, marginBottom:16, boxShadow:"0 1px 3px rgba(0,0,0,0.06)", border:"1px solid #e2e8f0" }}
            onMouseEnter={e => e.currentTarget.style.boxShadow="0 4px 16px rgba(0,0,0,0.1)"}
            onMouseLeave={e => e.currentTarget.style.boxShadow="0 1px 3px rgba(0,0,0,0.06)"}>

            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
              <div style={{ flex:1 }}>
                <h3 style={{ fontSize:18, fontWeight:700, color:"#111827", margin:"0 0 6px" }}>{p.title}</h3>
                <p style={{ fontSize:14, color:"#64748b", lineHeight:1.7, margin:0 }}>{p.description}</p>
              </div>
              <span style={{
                padding:"6px 16px", borderRadius:20, fontSize:12, fontWeight:700, whiteSpace:"nowrap", marginLeft:16,
                background:
                  p.status==="open"        ? "linear-gradient(135deg,#2563eb,#3b82f6)" :
                  p.status==="in-progress" ? "linear-gradient(135deg,#f59e0b,#f97316)" :
                  p.status==="completed"   ? "linear-gradient(135deg,#16a34a,#22c55e)" :
                                             "linear-gradient(135deg,#64748b,#94a3b8)",
                color:"white"
              }}>
                {p.status}
              </span>
            </div>

            {p.skills && (
              <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:16 }}>
                {p.skills.split(",").map(s => (
                  <span key={s} style={{ padding:"4px 12px", background:"linear-gradient(135deg,#eff6ff,#dbeafe)", color:"#2563eb", borderRadius:20, fontSize:12, fontWeight:600, border:"1px solid #bfdbfe" }}>
                    {s.trim()}
                  </span>
                ))}
              </div>
            )}

            <div style={{ display:"flex", gap:24, paddingTop:16, borderTop:"1px solid #f1f5f9", marginBottom:16 }}>
              <div>
                <span style={{ display:"block", fontSize:11, textTransform:"uppercase", letterSpacing:"0.5px", color:"#64748b", marginBottom:2 }}>Budget</span>
                <strong style={{ color:"#111827", fontSize:15 }}>${p.budget}</strong>
              </div>
              <div>
                <span style={{ display:"block", fontSize:11, textTransform:"uppercase", letterSpacing:"0.5px", color:"#64748b", marginBottom:2 }}>Deadline</span>
                <strong style={{ color:"#111827", fontSize:15 }}>{p.deadline}</strong>
              </div>
              <div>
                <span style={{ display:"block", fontSize:11, textTransform:"uppercase", letterSpacing:"0.5px", color:"#64748b", marginBottom:2 }}>Proposals</span>
                <strong style={{ color: proposalCounts[p.id] > 0 ? "#2563eb" : "#111827", fontSize:15 }}>
                  {proposalCounts[p.id] !== undefined ? proposalCounts[p.id] : "—"}
                </strong>
              </div>
              {p.created_at && (
                <div>
                  <span style={{ display:"block", fontSize:11, textTransform:"uppercase", letterSpacing:"0.5px", color:"#64748b", marginBottom:2 }}>Posted</span>
                  <strong style={{ color:"#111827", fontSize:15 }}>{new Date(p.created_at).toLocaleDateString()}</strong>
                </div>
              )}
            </div>

            <div style={{ display:"flex", gap:10 }}>
              <button onClick={() => navigate(`/view-proposals/${p.id}`)}
                style={{ padding:"10px 20px", background:"linear-gradient(135deg,#2563eb,#3b82f6)", color:"white", border:"none", borderRadius:8, cursor:"pointer", fontWeight:600, fontSize:13, boxShadow:"0 2px 8px rgba(37,99,235,0.3)" }}>
                👁 View Proposals {proposalCounts[p.id] > 0 && `(${proposalCounts[p.id]})`}
              </button>
              <button onClick={() => openEdit(p)}
                style={{ padding:"10px 20px", backgroundColor:"white", color:"#374151", border:"1.5px solid #e2e8f0", borderRadius:8, cursor:"pointer", fontWeight:600, fontSize:13 }}>
                ✏️ Edit
              </button>
              {p.status === "open" && (
                <button onClick={() => closeProject(p.id)}
                  style={{ padding:"10px 20px", background:"linear-gradient(135deg,#ef4444,#dc2626)", color:"white", border:"none", borderRadius:8, cursor:"pointer", fontWeight:600, fontSize:13 }}>
                  ✕ Close Project
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editProject && (
        <div style={{ position:"fixed", inset:0, backgroundColor:"rgba(15,23,42,0.6)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000, backdropFilter:"blur(4px)" }}>
          <div style={{ backgroundColor:"#fff", borderRadius:20, padding:32, width:"100%", maxWidth:560, boxShadow:"0 20px 60px rgba(0,0,0,0.3)", border:"1px solid #e2e8f0" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:24 }}>
              <div>
                <h2 style={{ fontSize:22, fontWeight:800, color:"#111827", margin:"0 0 4px" }}>Edit Project</h2>
                <p style={{ fontSize:14, color:"#64748b", margin:0 }}>Update your project details</p>
              </div>
              <button onClick={() => setEditProject(null)}
                style={{ background:"#f1f5f9", border:"none", width:32, height:32, borderRadius:"50%", cursor:"pointer", color:"#64748b", fontSize:16, display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
            </div>
            <label style={lbl}>Project Title</label>
            <input value={editForm.title} onChange={e => setEditForm({ ...editForm, title:e.target.value })} style={{ ...inp, marginBottom:16 }} />
            <label style={lbl}>Description</label>
            <textarea value={editForm.description} onChange={e => setEditForm({ ...editForm, description:e.target.value })} rows={4} style={{ ...inp, resize:"vertical", marginBottom:16 }} />
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:28 }}>
              <div>
                <label style={lbl}>Budget (USD)</label>
                <input type="number" value={editForm.budget} onChange={e => setEditForm({ ...editForm, budget:e.target.value })} style={inp} />
              </div>
              <div>
                <label style={lbl}>Deadline</label>
                <input type="text" value={editForm.deadline} onChange={e => setEditForm({ ...editForm, deadline:e.target.value })} style={inp} />
              </div>
            </div>
            <div style={{ display:"flex", gap:12 }}>
              <button onClick={saveEdit} disabled={saving}
                style={{ flex:1, padding:"12px", background:"linear-gradient(135deg,#2563eb,#3b82f6)", color:"white", border:"none", borderRadius:10, cursor:"pointer", fontWeight:700, fontSize:14, boxShadow:"0 4px 12px rgba(37,99,235,0.3)" }}>
                {saving ? "Saving..." : "💾 Save Changes"}
              </button>
              <button onClick={() => setEditProject(null)}
                style={{ padding:"12px 24px", backgroundColor:"white", color:"#374151", border:"1.5px solid #e2e8f0", borderRadius:10, cursor:"pointer", fontWeight:600, fontSize:14 }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const lbl = { display:"block", fontSize:13, fontWeight:600, color:"#374151", marginBottom:6 };
const inp = { width:"100%", padding:"10px 14px", border:"1.5px solid #e2e8f0", borderRadius:10, fontSize:14, outline:"none", fontFamily:"inherit", backgroundColor:"#fff", boxSizing:"border-box" };