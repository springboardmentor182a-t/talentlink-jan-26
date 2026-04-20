import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import api from "../../utils/api";

export default function Reviews({ onNavigate }) {
  const { user, role } = useContext(AuthContext);
  const isFreelancer   = role === "freelancer";

  const theme = isFreelancer
    ? { headerBg:"linear-gradient(135deg,#3b0764 0%,#7c3aed 40%,#a855f7 100%)", accent:"#7c3aed", accentLight:"#f5f3ff", btn:"linear-gradient(135deg,#7c3aed,#a855f7)", shadow:"rgba(124,58,237,0.3)" }
    : { headerBg:"linear-gradient(135deg,#1e3a5f 0%,#2563eb 50%,#3b82f6 100%)", accent:"#2563eb", accentLight:"#eff6ff", btn:"linear-gradient(135deg,#2563eb,#3b82f6)", shadow:"rgba(37,99,235,0.3)" };

  const [received,   setReceived]   = useState([]);
  const [given,      setGiven]      = useState([]);
  const [contracts,  setContracts]  = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [showForm,   setShowForm]   = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success,    setSuccess]    = useState(false);
  const [formError,  setFormError]  = useState("");
  const [activeTab,  setActiveTab]  = useState("received");

  const [form, setForm] = useState({
    selectedContract: "",
    rating:           5,
    comment:          "",
  });

  const loadAll = async () => {
    try {
      setLoading(true);
      const [recRes, givRes] = await Promise.all([
        api.get(`/reviews/${user.id}`),
        api.get(`/reviews/given/${user.id}`),
      ]);
      setReceived(recRes.data);
      setGiven(givRes.data);

      // Load completed contracts for the review form
      if (isFreelancer) {
        // Freelancer: load accepted proposals on completed projects
        const propRes = await api.get(`/proposals/freelancer/${user.id}`);
        const accepted = propRes.data.filter(p => p.status === "accepted");
        const enriched = await Promise.all(accepted.map(async p => {
          try {
            const projRes = await api.get(`/projects/${p.project_id}`);
            return { ...p, project: projRes.data };
          } catch { return { ...p, project: null }; }
        }));
        setContracts(enriched.filter(c => c.project?.status === "completed"));
      } else {
        // Client: load their completed projects with accepted proposals
        const projRes = await api.get(`/projects/client/${user.id}`);
        const completed = projRes.data.filter(p => p.status === "completed" || p.status === "in-progress");
        const enriched = await Promise.all(completed.map(async p => {
          try {
            const propRes = await api.get(`/proposals/project/${p.id}`);
            const accepted = propRes.data.find(pr => pr.status === "accepted");
            return { project: p, acceptedProposal: accepted };
          } catch { return { project: p, acceptedProposal: null }; }
        }));
        setContracts(enriched.filter(c => c.acceptedProposal));
      }
    } catch (err) {
      console.error("Reviews load error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (user) loadAll(); }, [user]);

  const handleSubmit = async () => {
    setFormError("");
    if (!form.selectedContract) { setFormError("Please select a project."); return; }
    if (!form.comment.trim())   { setFormError("Comment is required."); return; }

    let reviewee_id, projectName;

    if (isFreelancer) {
      // Freelancer gives feedback to the client
      const contract = contracts.find(c => String(c.id) === String(form.selectedContract));
      if (!contract) { setFormError("Invalid project selected."); return; }
      reviewee_id = contract.project?.client_id;
      projectName = contract.project_title || contract.project?.title || `Project #${contract.project_id}`;
    } else {
      // Client reviews the freelancer
      const contract = contracts.find(c => String(c.project?.id) === String(form.selectedContract));
      if (!contract) { setFormError("Invalid project selected."); return; }
      reviewee_id = contract.acceptedProposal?.freelancer_id;
      projectName = contract.project?.title || `Project #${contract.project?.id}`;
    }

    if (!reviewee_id) { setFormError("Could not determine who to review."); return; }

    try {
      setSubmitting(true);
      await api.post("/reviews/", {
        reviewer_id:  user.id,
        reviewee_id:  reviewee_id,
        rating:       form.rating,
        comment:      form.comment.trim(),
        project_name: projectName,
      });
      setShowForm(false);
      setForm({ selectedContract:"", rating:5, comment:"" });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      await loadAll();
    } catch (err) {
      const detail = err.response?.data?.detail;
      setFormError(typeof detail === "string" ? detail : "Error submitting. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const avgRating   = received.length > 0
    ? (received.reduce((s, r) => s + r.rating, 0) / received.length).toFixed(1)
    : null;
  const ratingLabel = r => ["","Poor","Fair","Good","Very Good","Excellent"][r] || "";

  const Stars = ({ rating, interactive, onChange, size = 18 }) => (
    <div style={{ display:"flex", gap:2 }}>
      {[1,2,3,4,5].map(n => (
        <span key={n} onClick={() => interactive && onChange(n)}
          style={{ fontSize:size, cursor:interactive ? "pointer" : "default", color: n <= rating ? "#f59e0b" : "#d1d5db", lineHeight:1 }}>
          ★
        </span>
      ))}
    </div>
  );

  if (loading) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:"60vh" }}>
      <p style={{ color:"var(--text-muted)" }}>Loading reviews...</p>
    </div>
  );

  // Build dropdown options
  const dropdownOptions = isFreelancer
    ? contracts.map(c => ({
        value: String(c.id),
        label: c.project_title || c.project?.title || `Project #${c.project_id}`,
      }))
    : contracts.map(c => ({
        value: String(c.project?.id),
        label: c.project?.title || `Project #${c.project?.id}`,
      }));

  const listToShow = activeTab === "received" ? received : given;

  return (
    <div style={{ fontFamily:"'Segoe UI',sans-serif", backgroundColor:"var(--page-bg)", minHeight:"100vh" }}>

      {/* Hero */}
      <div style={{ background:theme.headerBg, padding:"24px 16px", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:-40, right:-40, width:200, height:200, borderRadius:"50%", background:"rgba(255,255,255,0.05)" }} />
        <div style={{ display:"inline-flex", alignItems:"center", gap:8, backgroundColor:"rgba(255,255,255,0.15)", borderRadius:20, padding:"4px 14px", fontSize:12, color:"white", fontWeight:600, marginBottom:10 }}>
          ⭐ Reviews
        </div>
        <h1 style={{ fontSize:28, fontWeight:800, color:"white", margin:"0 0 6px", letterSpacing:"-0.5px" }}>Reviews</h1>
        <p style={{ fontSize:14, color:"rgba(255,255,255,0.75)", margin:0 }}>
          {isFreelancer
            ? "See client reviews and give feedback on your projects"
            : "Review freelancers you've worked with"}
        </p>
      </div>

      <div style={{ padding:"20px 16px" }}>

        {/* Success */}
        {success && (
          <div style={{ backgroundColor:"#f0fdf4", border:"1px solid #86efac", borderRadius:10, padding:"12px 16px", marginBottom:20, display:"flex", alignItems:"center", gap:10 }}>
            <span>✅</span>
            <span style={{ fontSize:14, fontWeight:600, color:"#16a34a" }}>
              {isFreelancer ? "Feedback submitted successfully!" : "Review submitted successfully!"}
            </span>
          </div>
        )}

        {/* Stats */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(160px, 1fr))", gap:16, marginBottom:28 }}>
          {[
            { label:"Reviews Received", val:received.length,                    icon:"📥", color:theme.accent, bg:theme.accentLight },
            { label:isFreelancer ? "Feedback Given" : "Reviews Given", val:given.length, icon:"📤", color:"#16a34a", bg:"#f0fdf4" },
            { label:"Average Rating",   val:avgRating ? `${avgRating} ★` : "—", icon:"⭐", color:"#d97706", bg:"#fffbeb" },
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

        {/* Write Review / Give Feedback CTA */}
        {dropdownOptions.length > 0 && (
          <div style={{ backgroundColor:"var(--card)", borderRadius:16, padding:"20px 24px", marginBottom:24, boxShadow:"0 1px 3px rgba(0,0,0,0.06)", border:"1px solid var(--border)", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
            <div>
              <div style={{ fontWeight:700, fontSize:15, color:"var(--text-primary)" }}>
                {isFreelancer ? "Give feedback to a client" : "Review a freelancer"}
              </div>
              <div style={{ fontSize:13, color:"var(--text-muted)", marginTop:2 }}>
                {isFreelancer
                  ? `You have ${dropdownOptions.length} completed project${dropdownOptions.length !== 1 ? "s" : ""} to give feedback on`
                  : `You have ${dropdownOptions.length} freelancer${dropdownOptions.length !== 1 ? "s" : ""} to review`}
              </div>
            </div>
            <button onClick={() => { setShowForm(!showForm); setFormError(""); }}
              style={{ padding:"10px 24px", background:theme.btn, color:"white", border:"none", borderRadius:10, cursor:"pointer", fontWeight:600, fontSize:14, boxShadow:`0 2px 8px ${theme.shadow}` }}>
              {isFreelancer ? "✍️ Give Feedback" : "✍️ Write a Review"}
            </button>
          </div>
        )}

        {/* Form */}
        {showForm && (
          <div style={{ backgroundColor:"var(--card)", borderRadius:16, padding:28, marginBottom:24, boxShadow:"0 4px 16px rgba(0,0,0,0.08)", border:`1.5px solid ${theme.accent}44` }}>
            <h3 style={{ fontSize:16, fontWeight:700, color:"var(--text-primary)", margin:"0 0 20px" }}>
              {isFreelancer ? "✍️ Give Feedback to Client" : "✍️ Write a Review"}
            </h3>

            {formError && (
              <div style={{ backgroundColor:"#fef2f2", border:"1px solid #fca5a5", borderRadius:8, padding:"10px 14px", marginBottom:16, fontSize:13, color:"#dc2626" }}>
                ⚠️ {formError}
              </div>
            )}

            <div style={{ display:"grid", gap:18 }}>

              {/* Project selector */}
              <div>
                <label style={lbl}>
                  Select Project <span style={{ color:"#ef4444" }}>*</span>
                </label>
                <select value={form.selectedContract}
                  onChange={e => setForm(f => ({ ...f, selectedContract:e.target.value }))}
                  style={{ ...inp, cursor:"pointer", borderColor: form.selectedContract ? theme.accent : "#e2e8f0" }}>
                  <option value="">Choose a completed project...</option>
                  {dropdownOptions.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              {/* Star rating */}
              <div>
                <label style={lbl}>Rating <span style={{ color:"#ef4444" }}>*</span></label>
                <div style={{ display:"flex", alignItems:"center", gap:14 }}>
                  <Stars rating={form.rating} interactive size={36}
                    onChange={r => setForm(f => ({ ...f, rating:r }))} />
                  <span style={{ fontSize:15, color:theme.accent, fontWeight:700 }}>
                    {ratingLabel(form.rating)}
                  </span>
                </div>
              </div>

              {/* Comment — required */}
              <div>
                <label style={lbl}>
                  {isFreelancer ? "Feedback" : "Review"} <span style={{ color:"#ef4444" }}>*</span>
                  <span style={{ fontSize:11, color:"var(--text-faint)", fontWeight:400, marginLeft:6 }}>Required</span>
                </label>
                <textarea value={form.comment}
                  onChange={e => setForm(f => ({ ...f, comment:e.target.value }))}
                  placeholder={isFreelancer
                    ? "Share your experience working with this client. Were they clear with requirements? Did they communicate well?"
                    : "Share your experience. Did the freelancer deliver quality work on time? Would you hire them again?"}
                  rows={4}
                  style={{ ...inp, resize:"vertical", lineHeight:1.7, borderColor: form.comment ? theme.accent : "#e2e8f0" }} />
                <div style={{ fontSize:12, color: form.comment.length > 10 ? "#16a34a" : "#94a3b8", marginTop:4, textAlign:"right" }}>
                  {form.comment.length} characters
                </div>
              </div>

              <div style={{ display:"flex", gap:12 }}>
                <button onClick={handleSubmit}
                  disabled={submitting || !form.selectedContract || !form.comment.trim()}
                  style={{ padding:"12px 28px", background:(submitting || !form.selectedContract || !form.comment.trim()) ? "#cbd5e1" : theme.btn, color:"white", border:"none", borderRadius:10, cursor:(submitting || !form.selectedContract || !form.comment.trim()) ? "not-allowed" : "pointer", fontWeight:700, fontSize:14, boxShadow:(submitting || !form.selectedContract || !form.comment.trim()) ? "none" : `0 4px 12px ${theme.shadow}` }}>
                  {submitting ? "Submitting..." : isFreelancer ? "Submit Feedback →" : "Submit Review →"}
                </button>
                <button onClick={() => { setShowForm(false); setFormError(""); }}
                  style={{ padding:"12px 20px", backgroundColor:"white", color:"var(--text-secondary)", border:"1.5px solid var(--border)", borderRadius:10, cursor:"pointer", fontWeight:600, fontSize:14 }}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div style={{ display:"flex", gap:4, marginBottom:20, backgroundColor:"var(--card)", padding:4, borderRadius:12, border:"1px solid var(--border)", width:"fit-content" }}>
          {[
            { key:"received", label:`Received (${received.length})` },
            { key:"given",    label: isFreelancer ? `Feedback Given (${given.length})` : `Given (${given.length})` },
          ].map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              style={{ padding:"8px 20px", borderRadius:8, border:"none", cursor:"pointer", fontFamily:"inherit", fontSize:13, fontWeight: activeTab === t.key ? 700 : 500, backgroundColor: activeTab === t.key ? theme.accentLight : "transparent", color: activeTab === t.key ? theme.accent : "#64748b", transition:"all 0.15s" }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Review cards */}
        {listToShow.length === 0 ? (
          <div style={{ backgroundColor:"var(--card)", borderRadius:16, padding:"48px 32px", textAlign:"center", boxShadow:"0 1px 3px rgba(0,0,0,0.06)", border:"1px solid var(--border)" }}>
            <div style={{ fontSize:48, marginBottom:12 }}>⭐</div>
            <h3 style={{ fontSize:16, fontWeight:700, color:"var(--text-primary)", marginBottom:8 }}>
              {activeTab === "received" ? "No reviews received yet" : isFreelancer ? "No feedback given yet" : "No reviews given yet"}
            </h3>
            <p style={{ color:"var(--text-muted)", fontSize:14 }}>
              {activeTab === "received"
                ? "Complete projects to start receiving reviews"
                : dropdownOptions.length > 0
                  ? `Click '${isFreelancer ? "Give Feedback" : "Write a Review"}' above`
                  : "Complete a project first"}
            </p>
          </div>
        ) : (
          listToShow.map(r => (
            <div key={r.id} style={{ backgroundColor:"var(--card)", borderRadius:16, padding:24, marginBottom:16, boxShadow:"0 1px 3px rgba(0,0,0,0.06)", border:"1px solid var(--border)" }}
              onMouseEnter={e => e.currentTarget.style.boxShadow="0 4px 16px rgba(0,0,0,0.1)"}
              onMouseLeave={e => e.currentTarget.style.boxShadow="0 1px 3px rgba(0,0,0,0.06)"}>

              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
                <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                  <div style={{ width:48, height:48, borderRadius:"50%", background:theme.btn, display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontWeight:700, fontSize:18, boxShadow:`0 2px 8px ${theme.shadow}` }}>
                    {(r.reviewer_name || "?").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight:700, fontSize:15, color:"var(--text-primary)" }}>
                      {r.reviewer_name || "Anonymous"}
                    </div>
                    <div style={{ fontSize:12, color:"var(--text-faint)", marginTop:2, display:"flex", alignItems:"center", gap:8 }}>
                      {r.created_at ? new Date(r.created_at).toLocaleDateString([], { year:"numeric", month:"long", day:"numeric" }) : ""}
                      {r.project_name && (
                        <span style={{ padding:"2px 10px", backgroundColor:theme.accentLight, color:theme.accent, borderRadius:20, fontSize:11, fontWeight:600 }}>
                          {r.project_name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:4 }}>
                  <Stars rating={r.rating} size={20} />
                  <span style={{ fontSize:12, color:"var(--text-muted)", fontWeight:600 }}>{ratingLabel(r.rating)}</span>
                </div>
              </div>

              {r.comment && (
                <div style={{ fontSize:14, color:"var(--text-secondary)", lineHeight:1.8, backgroundColor:"var(--page-bg)", padding:"14px 18px", borderRadius:10, border:"1px solid var(--border)", fontStyle:"italic" }}>
                  "{r.comment}"
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const lbl = { display:"flex", alignItems:"center", gap:6, fontSize:13, fontWeight:600, color:"var(--text-secondary)", marginBottom:6 };
const inp = { width:"100%", padding:"10px 14px", border:"1.5px solid var(--border)", borderRadius:10, fontSize:14, outline:"none", fontFamily:"inherit", backgroundColor:"var(--input-background)", boxSizing:"border-box", transition:"border-color 0.2s" };