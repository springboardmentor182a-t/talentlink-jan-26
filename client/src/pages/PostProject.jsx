import { useState, useContext } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import api from "../utils/api";
import { AuthContext } from "../context/AuthContext";

export default function PostProject() {
  const { user, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();

  const [form, setForm]             = useState({ title:"", description:"", budget:"", deadline:"" });
  const [skillTags, setSkillTags]   = useState([]);
  const [skillInput, setSkillInput] = useState("");
  const [posting, setPosting]       = useState(false);
  const [error, setError]           = useState("");
  const [success, setSuccess]       = useState("");

  const [budgetEstimate, setBudgetEstimate]   = useState(null);
  const [budgetLoading, setBudgetLoading]     = useState(false);

  // ✅ NEW
  const [descLoading, setDescLoading]         = useState(false);
  const [descGenerated, setDescGenerated]     = useState(false);

  const addSkill = (e) => {
    if (e.key === "Enter" && skillInput.trim()) {
      e.preventDefault();
      const val = skillInput.trim();
      if (!skillTags.includes(val)) setSkillTags(prev => [...prev, val]);
      setSkillInput("");
    }
  };

  const removeSkill = (s) => setSkillTags(prev => prev.filter(x => x !== s));

  const estimateBudget = async () => {
    if (!form.title && skillTags.length === 0) {
      alert("Please enter a project title and skills first!");
      return;
    }
    setBudgetLoading(true);
    setBudgetEstimate(null);
    try {
      const token = localStorage.getItem("token");
      const res = await api.post("/ai/estimate-budget", {
        title:       form.title,
        description: form.description,
        skills:      skillTags.join(", "),
      }, { headers: { Authorization: `Bearer ${token}` } });
      setBudgetEstimate(res.data);
      setForm(prev => ({ ...prev, budget: res.data.recommended }));
    } catch (err) {
      console.error("Budget estimate error:", err.message);
    } finally {
      setBudgetLoading(false);
    }
  };

  // ✅ NEW FUNCTION
  const generateDescription = async () => {
    if (!form.title) {
      alert("Please enter a project title first!");
      return;
    }
    setDescLoading(true);
    setDescGenerated(false);
    try {
      const token = localStorage.getItem("token");
      const res = await api.post("/ai/generate-description", {
        title:  form.title,
        skills: skillTags.join(", "),
        budget: form.budget,
      }, { headers: { Authorization: `Bearer ${token}` } });
      setForm(prev => ({ ...prev, description: res.data.description }));
      setDescGenerated(true);
    } catch (err) {
      console.error("Description generate error:", err.message);
      alert("Failed to generate description. Try again.");
    } finally {
      setDescLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    setPosting(true);
    try {
      await api.post("/projects/", {
        ...form,
        skills:    skillTags.join(", "),
        client_id: user.id,
      });
      setSuccess("Project posted successfully!");
      setForm({ title:"", description:"", budget:"", deadline:"" });
      setSkillTags([]);
      setTimeout(() => navigate("/projects"), 2000);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to post project. Try again.");
    } finally {
      setPosting(false);
    }
  };

  if (authLoading) return <div style={{ padding:"20px 16px" }}>Loading...</div>;
  if (!user) return <Navigate to="/client/login" replace />;

  const completionScore = [
    form.title.length > 0,
    form.description.length > 50,
    skillTags.length > 0,
    form.budget > 0,
    form.deadline.length > 0,
  ].filter(Boolean).length;

  const completionPercent = (completionScore / 5) * 100;

  return (
    <div style={{ fontFamily:"'Segoe UI',sans-serif", backgroundColor:"var(--page-bg)", minHeight:"100vh" }}>

      {/* Hero Banner */}
      <div style={{ background:"linear-gradient(135deg,#1e3a5f 0%,#2563eb 50%,#3b82f6 100%)", padding:"24px 16px", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:-50, right:-50, width:200, height:200, borderRadius:"50%", background:"rgba(255,255,255,0.05)" }} />
        <div style={{ display:"inline-flex", alignItems:"center", gap:8, backgroundColor:"rgba(255,255,255,0.15)", borderRadius:20, padding:"4px 14px", fontSize:12, color:"white", fontWeight:600, marginBottom:10 }}>
          📋 New Project
        </div>
        <h1 style={{ fontSize:28, fontWeight:800, color:"white", margin:"0 0 6px", letterSpacing:"-0.5px" }}>Post Your Project</h1>
        <p style={{ fontSize:14, color:"rgba(255,255,255,0.75)", margin:0 }}>Connect with top freelancers and bring your vision to life</p>
      </div>

      <div style={{ padding:"20px 16px" }}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(min(100%, 320px), 1fr))", gap:28, alignItems:"start" }}>

          {/* Left - Form */}
          <div>

            {/* Progress Bar */}
            <div style={{ backgroundColor:"var(--card)" /* TODO-DARK */, borderRadius:12, padding:"20px 24px", marginBottom:20, boxShadow:"0 1px 3px rgba(0,0,0,0.06)", border:"1px solid var(--border)" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                <span style={{ fontSize:13, fontWeight:600, color:"var(--text-secondary)" }}>Form Completeness</span>
                <span style={{ fontSize:13, fontWeight:700, color: completionPercent === 100 ? "#16a34a" : "#2563eb" }}>{completionPercent}%</span>
              </div>
              <div style={{ backgroundColor:"var(--input-background)", borderRadius:20, height:8, overflow:"hidden" }}>
                <div style={{ height:"100%", borderRadius:20, width:`${completionPercent}%`, background: completionPercent === 100 ? "linear-gradient(135deg,#16a34a,#22c55e)" : "linear-gradient(135deg,#2563eb,#3b82f6)", transition:"width 0.4s ease" }} />
              </div>
              <div style={{ display:"flex", gap:16, marginTop:12 }}>
                {[
                  { label:"Title",       done: form.title.length > 0 },
                  { label:"Description", done: form.description.length > 50 },
                  { label:"Skills",      done: skillTags.length > 0 },
                  { label:"Budget",      done: form.budget > 0 },
                  { label:"Deadline",    done: form.deadline.length > 0 },
                ].map((item, i) => (
                  <div key={i} style={{ display:"flex", alignItems:"center", gap:4, fontSize:12 }}>
                    <span style={{ color: item.done ? "#16a34a" : "#9ca3af", fontWeight:600 }}>{item.done ? "✓" : "○"}</span>
                    <span style={{ color: item.done ? "#374151" : "#9ca3af" }}>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Form Card */}
            <div style={{ backgroundColor:"var(--card)" /* TODO-DARK */, borderRadius:16, padding:32, boxShadow:"0 1px 3px rgba(0,0,0,0.06)", border:"1px solid var(--border)" }}>

              {error && (
                <div style={{ background:"#fef2f2", border:"1px solid #fca5a5", color:"#b91c1c", borderRadius:10, padding:"12px 16px", marginBottom:20, fontSize:13 }}>
                  ⚠️ {error}
                </div>
              )}
              {success && (
                <div style={{ background:"#f0fdf4", border:"1px solid #86efac", color:"#166534", borderRadius:10, padding:"12px 16px", marginBottom:20, fontSize:13 }}>
                  ✅ {success} Redirecting...
                </div>
              )}

              <form onSubmit={handleSubmit}>

                {/* Title */}
                <div style={{ marginBottom:24 }}>
                  <label style={lbl}>Project Title <span style={{ color:"#ef4444" }}>*</span></label>
                  <input required type="text"
                    placeholder="e.g., Build a responsive e-commerce website with React"
                    value={form.title} onChange={e => setForm({ ...form, title:e.target.value })}
                    style={{ ...inp, borderColor: form.title ? "#2563eb" : "#e2e8f0" }} />
                </div>

                {/* Description with AI Generate button */}
                <div style={{ marginBottom:24 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
                    <label style={{ ...lbl, margin:0 }}>
                      Project Description <span style={{ color:"#ef4444" }}>*</span>
                      <span style={{ fontSize:11, color:"var(--text-faint)", fontWeight:400, marginLeft:8 }}>Min. 50 characters</span>
                    </label>
                    {/* ✅ AI GENERATE DESCRIPTION BUTTON */}
                    <button type="button" onClick={generateDescription} disabled={descLoading || !form.title}
                      style={{
                        display:"flex", alignItems:"center", gap:6,
                        padding:"6px 14px",
                        background: descLoading ? "#f1f5f9" : "linear-gradient(135deg,#6366f1,#8b5cf6)",
                        color: descLoading ? "#9ca3af" : "white",
                        border:"none", borderRadius:8, cursor: !form.title ? "not-allowed" : "pointer",
                        fontWeight:600, fontSize:12, opacity: !form.title ? 0.5 : 1,
                        transition:"all 0.2s"
                      }}>
                      {descLoading ? "⏳ Generating..." : "✨ AI Generate"}
                    </button>
                  </div>

                  {/* Generated badge */}
                  {descGenerated && (
                    <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:6, fontSize:12, color:"#7c3aed", fontWeight:600 }}>
                      <span>✨</span> AI generated — feel free to edit
                    </div>
                  )}

                  <textarea required rows={6}
                    placeholder="Describe your project in detail — requirements, deliverables, tech stack... or click ✨ AI Generate above!"
                    value={form.description} onChange={e => { setForm({ ...form, description:e.target.value }); setDescGenerated(false); }}
                    style={{
                      ...inp, resize:"vertical", lineHeight:1.7,
                      borderColor: descGenerated ? "#7c3aed" : form.description.length > 50 ? "#2563eb" : "#e2e8f0",
                      background: descGenerated ? "#faf5ff" : "#fff"
                    }} />
                  <div style={{ fontSize:12, color: form.description.length > 50 ? "#16a34a" : "#9ca3af", marginTop:4, textAlign:"right" }}>
                    {form.description.length} chars {form.description.length < 50 ? `(${50 - form.description.length} more needed)` : "✓"}
                  </div>
                </div>

                {/* Skills */}
                <div style={{ marginBottom:24 }}>
                  <label style={lbl}>
                    Required Skills <span style={{ color:"#ef4444" }}>*</span>
                    <span style={{ fontSize:11, color:"var(--text-faint)", fontWeight:400, marginLeft:8 }}>Press Enter to add</span>
                  </label>
                  <div onClick={() => document.getElementById("skill-inp").focus()}
                    style={{ ...inp, display:"flex", flexWrap:"wrap", gap:8, height:"auto", minHeight:48, padding:"10px 14px", cursor:"text", borderColor: skillTags.length > 0 ? "#2563eb" : "#e2e8f0" }}>
                    {skillTags.map(s => (
                      <span key={s} style={{ padding:"4px 12px", background:"linear-gradient(135deg,#eff6ff,#dbeafe)", color:"#1d4ed8", borderRadius:20, fontSize:12, fontWeight:600, display:"flex", alignItems:"center", gap:6, border:"1px solid #bfdbfe" }}>
                        {s}
                        <button type="button" onClick={() => removeSkill(s)}
                          style={{ background:"none", border:"none", color:"#1d4ed8", cursor:"pointer", fontSize:14, lineHeight:1, padding:0 }}>×</button>
                      </span>
                    ))}
                    <input id="skill-inp" type="text"
                      placeholder={skillTags.length === 0 ? "e.g. React, Node.js, Python..." : "Add more..."}
                      value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={addSkill}
                      style={{ border:"none", outline:"none", fontSize:14, background:"transparent", minWidth:140, fontFamily:"inherit" }} />
                  </div>
                  {skillTags.length > 0 && (
                    <p style={{ fontSize:12, color:"#16a34a", marginTop:4 }}>✓ {skillTags.length} skill{skillTags.length > 1 ? "s" : ""} added</p>
                  )}
                </div>

                {/* Budget + Deadline */}
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(160px, 1fr))", gap:20, marginBottom:32 }}>
                  <div>
                    <label style={lbl}>Budget (USD) <span style={{ color:"#ef4444" }}>*</span></label>
                    <div style={{ position:"relative" }}>
                      <span style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", color:"var(--text-muted)", fontWeight:600 }}>$</span>
                      <input required type="number" min="1" placeholder="5000"
                        value={form.budget} onChange={e => setForm({ ...form, budget:e.target.value })}
                        style={{ ...inp, paddingLeft:28, borderColor: form.budget ? "#2563eb" : "#e2e8f0" }} />
                    </div>
                    <button type="button" onClick={estimateBudget} disabled={budgetLoading}
                      style={{ marginTop:8, padding:"8px 16px", backgroundColor:"var(--card)" /* TODO-DARK */, color:"#2563eb", border:"1.5px solid #2563eb", borderRadius:8, cursor:"pointer", fontWeight:600, fontSize:12, opacity: budgetLoading ? 0.7 : 1 }}>
                      {budgetLoading ? "⏳ Estimating..." : "🤖 AI Estimate Budget"}
                    </button>

                    {budgetEstimate && (
                      <div style={{ marginTop:10, padding:12, backgroundColor:"#eff6ff", borderRadius:10, border:"1px solid #bfdbfe" }}>
                        <div style={{ fontSize:12, fontWeight:700, color:"#1d4ed8", marginBottom:6 }}>🤖 AI Budget Suggestion</div>
                        <div style={{ display:"flex", gap:12, marginBottom:6 }}>
                          <div style={{ fontSize:12, color:"var(--text-secondary)" }}><span style={{ color:"var(--text-muted)" }}>Min: </span><strong style={{ color:"#16a34a" }}>${budgetEstimate.min}</strong></div>
                          <div style={{ fontSize:12, color:"var(--text-secondary)" }}><span style={{ color:"var(--text-muted)" }}>Max: </span><strong style={{ color:"#dc2626" }}>${budgetEstimate.max}</strong></div>
                          <div style={{ fontSize:12, color:"var(--text-secondary)" }}><span style={{ color:"var(--text-muted)" }}>Rec: </span><strong style={{ color:"#2563eb" }}>${budgetEstimate.recommended}</strong></div>
                        </div>
                        <div style={{ fontSize:11, color:"var(--text-muted)" }}>{budgetEstimate.reason}</div>
                      </div>
                    )}
                  </div>
                  <div>
                    <label style={lbl}>Deadline <span style={{ color:"#ef4444" }}>*</span></label>
                    <input required type="date"
                      value={form.deadline} onChange={e => setForm({ ...form, deadline:e.target.value })}
                      style={{ ...inp, borderColor: form.deadline ? "#2563eb" : "#e2e8f0" }} />
                  </div>
                </div>

                <div style={{ display:"flex", gap:12, justifyContent:"flex-end", paddingTop:24, borderTop:"1px solid var(--border-light)" }}>
                  <button type="button" onClick={() => navigate("/projects")}
                    style={{ padding:"11px 24px", background:"#fff", border:"1.5px solid var(--border)", borderRadius:10, cursor:"pointer", fontWeight:600, fontSize:14, color:"var(--text-muted)", fontFamily:"inherit" }}>
                    Cancel
                  </button>
                  <button type="submit" disabled={posting || completionPercent < 100}
                    style={{ padding:"11px 32px", background: completionPercent < 100 ? "#cbd5e1" : "linear-gradient(135deg,#2563eb,#3b82f6)", color:"white", border:"none", borderRadius:10, cursor: posting || completionPercent < 100 ? "not-allowed" : "pointer", fontWeight:700, fontSize:14, fontFamily:"inherit", boxShadow: completionPercent === 100 ? "0 4px 15px rgba(37,99,235,0.4)" : "none" }}>
                    {posting ? "🚀 Posting..." : completionPercent < 100 ? `Complete form (${completionPercent}%)` : "🚀 Post Project"}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right Panel */}
          <div style={{ display:"flex", flexDirection:"column", gap:16, position:"sticky", top:80 }}>

            {/* Live Preview */}
            <div style={{ backgroundColor:"var(--card)" /* TODO-DARK */, borderRadius:16, padding:24, boxShadow:"0 1px 3px rgba(0,0,0,0.06)", border:"1px solid var(--border)" }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:16 }}>
                <div style={{ width:8, height:8, borderRadius:"50%", backgroundColor:"#16a34a" }} />
                <h3 style={{ fontSize:14, fontWeight:700, color:"var(--text-primary)", margin:0 }}>Live Preview</h3>
              </div>
              <div style={{ backgroundColor:"var(--page-bg)", borderRadius:10, padding:16, border:"1px solid var(--border)" }}>
                <h4 style={{ fontSize:14, fontWeight:700, color: form.title ? "#111827" : "#9ca3af", margin:"0 0 8px" }}>
                  {form.title || "Your project title..."}
                </h4>
                <p style={{ fontSize:12, color: form.description ? "#6b7280" : "#9ca3af", lineHeight:1.6, margin:"0 0 12px" }}>
                  {form.description ? (form.description.length > 100 ? form.description.substring(0,100) + "..." : form.description) : "Your project description..."}
                </p>
                {skillTags.length > 0 && (
                  <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:12 }}>
                    {skillTags.slice(0,4).map(s => (
                      <span key={s} style={{ padding:"2px 10px", backgroundColor:"#eff6ff", color:"#2563eb", borderRadius:20, fontSize:11, fontWeight:600 }}>{s}</span>
                    ))}
                  </div>
                )}
                <div style={{ display:"flex", gap:16, paddingTop:12, borderTop:"1px solid var(--border)" }}>
                  {form.budget && <span style={{ fontSize:12, color:"var(--text-secondary)", fontWeight:600 }}>💰 ${form.budget}</span>}
                  {form.deadline && <span style={{ fontSize:12, color:"var(--text-secondary)", fontWeight:600 }}>📅 {form.deadline}</span>}
                </div>
              </div>
            </div>

            {/* Tips */}
            <div style={{ backgroundColor:"var(--card)" /* TODO-DARK */, borderRadius:16, padding:24, boxShadow:"0 1px 3px rgba(0,0,0,0.06)", border:"1px solid var(--border)" }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:16 }}>
                <span style={{ fontSize:18 }}>💡</span>
                <h3 style={{ fontSize:14, fontWeight:700, color:"var(--text-primary)", margin:0 }}>Pro Tips</h3>
              </div>
              {[
                { icon:"✍️", text:"Be specific — detailed projects get 3x more proposals" },
                { icon:"💰", text:"Set a realistic budget to attract quality freelancers" },
                { icon:"🏷️", text:"Add relevant skills to match the right talent" },
                { icon:"📅", text:"Give a reasonable deadline for quality work" },
                { icon:"⚡", text:"Respond quickly to proposals to hire faster" },
              ].map((t, i) => (
                <div key={i} style={{ display:"flex", gap:10, marginBottom:12, fontSize:13, color:"var(--text-secondary)", lineHeight:1.5 }}>
                  <span style={{ flexShrink:0 }}>{t.icon}</span>{t.text}
                </div>
              ))}
            </div>

            {/* Budget Guide */}
            <div style={{ background:"linear-gradient(135deg,#1e3a5f,#2563eb)", borderRadius:16, padding:24, color:"white" }}>
              <h3 style={{ fontSize:14, fontWeight:700, margin:"0 0 16px" }}>💰 Budget Guide</h3>
              {[
                { range:"$100 – $500",      type:"Quick fixes / tasks",    color:"#93c5fd" },
                { range:"$500 – $2,000",    type:"Small projects",         color:"#86efac" },
                { range:"$2,000 – $10,000", type:"Medium applications",    color:"#fde68a" },
                { range:"$10,000+",         type:"Enterprise solutions",   color:"#f9a8d4" },
              ].map((b, i) => (
                <div key={i} style={{ display:"flex", justifyContent:"space-between", marginBottom:10, padding:"8px 12px", backgroundColor:"rgba(255,255,255,0.1)", borderRadius:8 }}>
                  <span style={{ fontWeight:700, fontSize:13, color:b.color }}>{b.range}</span>
                  <span style={{ fontSize:12, color:"rgba(255,255,255,0.7)" }}>{b.type}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const lbl = { display:"block", fontSize:13, fontWeight:600, color:"var(--text-secondary)", marginBottom:6 };
const inp = { width:"100%", padding:"10px 14px", border:"1.5px solid var(--border)", borderRadius:10, fontSize:14, outline:"none", fontFamily:"inherit", backgroundColor:"var(--card)" /* TODO-DARK */, boxSizing:"border-box", transition:"border-color 0.2s" };