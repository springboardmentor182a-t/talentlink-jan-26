import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import api from "../../utils/api";

export default function Profile({ onNavigate }) {
  const { user, role } = useContext(AuthContext);
  const isFreelancer   = role === "freelancer";

  const theme = isFreelancer
    ? { headerBg:"linear-gradient(135deg,#3b0764 0%,#7c3aed 40%,#a855f7 100%)", accent:"#7c3aed", accentLight:"#f5f3ff", btn:"linear-gradient(135deg,#7c3aed,#a855f7)", shadow:"rgba(124,58,237,0.3)" }
    : { headerBg:"linear-gradient(135deg,#1e3a5f 0%,#2563eb 50%,#3b82f6 100%)", accent:"#2563eb", accentLight:"#eff6ff", btn:"linear-gradient(135deg,#2563eb,#3b82f6)", shadow:"rgba(37,99,235,0.3)" };

  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [success, setSuccess] = useState(false);
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    name:"", bio:"", location:"", phone:"",
    title:"", skills:"", experience:"", portfolio:"",
    linkedin:"", github:"", education:"", certifications:"",
    languages:"", expected_salary:"", availability:"",
    industry:"", website:"", company_size:"",
  });

  const loadProfile = async () => {
    try {
      const res = await api.get(`/profile/${user.id}`);
      const p   = res.data;
      setProfile(p);
      setForm({
        name:            p.name            || "",
        bio:             p.bio             || "",
        location:        p.location        || "",
        phone:           p.phone           || "",
        title:           p.title           || "",
        skills:          p.skills          || "",
        experience:      p.experience      || "",
        portfolio:       p.portfolio       || "",
        linkedin:        p.linkedin        || "",
        github:          p.github          || "",
        education:       p.education       || "",
        certifications:  p.certifications  || "",
        languages:       p.languages       || "",
        expected_salary: p.expected_salary || "",
        availability:    p.availability    || "",
        industry:        p.industry        || "",
        website:         p.website         || "",
        company_size:    p.company_size    || "",
      });
    } catch (err) {
      console.error("Load error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (user) loadProfile(); }, [user]);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");
      const res = await api.put(`/profile/${user.id}`, form);
      const p   = res.data;
      setProfile(p);
      setForm({
        name:            p.name            || "",
        bio:             p.bio             || "",
        location:        p.location        || "",
        phone:           p.phone           || "",
        title:           p.title           || "",
        skills:          p.skills          || "",
        experience:      p.experience      || "",
        portfolio:       p.portfolio       || "",
        linkedin:        p.linkedin        || "",
        github:          p.github          || "",
        education:       p.education       || "",
        certifications:  p.certifications  || "",
        languages:       p.languages       || "",
        expected_salary: p.expected_salary || "",
        availability:    p.availability    || "",
        industry:        p.industry        || "",
        website:         p.website         || "",
        company_size:    p.company_size    || "",
      });
      setEditing(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || `Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) loadProfile();
    setEditing(false);
    setError("");
  };

  const set = (field, val) => setForm(f => ({ ...f, [field]: val }));

  if (loading) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:"60vh" }}>
      <p style={{ color:"#64748b" }}>Loading profile...</p>
    </div>
  );

  const initials       = (profile?.name || "U").charAt(0).toUpperCase();
  const skillList      = (profile?.skills || "").split(",").map(s => s.trim()).filter(Boolean);
  const certList       = (profile?.certifications || "").split(",").map(s => s.trim()).filter(Boolean);
  const editSkillList  = (form.skills || "").split(",").map(s => s.trim()).filter(Boolean);

  return (
    <div style={{ fontFamily:"'Segoe UI',sans-serif", backgroundColor:"#f8fafc", minHeight:"100vh" }}>

      {/* Hero */}
      <div style={{ background:theme.headerBg, padding:"32px 32px", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:-40, right:-40, width:200, height:200, borderRadius:"50%", background:"rgba(255,255,255,0.05)" }} />
        <div style={{ display:"inline-flex", alignItems:"center", gap:8, backgroundColor:"rgba(255,255,255,0.15)", borderRadius:20, padding:"4px 14px", fontSize:12, color:"white", fontWeight:600, marginBottom:10 }}>
          👤 {isFreelancer ? "Freelancer Profile" : "Company Profile"}
        </div>
        <h1 style={{ fontSize:28, fontWeight:800, color:"white", margin:"0 0 6px", letterSpacing:"-0.5px" }}>
          {isFreelancer ? "My Profile" : "Company Profile"}
        </h1>
        <p style={{ fontSize:14, color:"rgba(255,255,255,0.75)", margin:0 }}>
          {isFreelancer ? "Build a strong profile to attract more clients" : "Manage your company information"}
        </p>
      </div>

      <div style={{ padding:32, maxWidth:960, margin:"0 auto" }}>

        {/* Banners */}
        {success && (
          <div style={{ backgroundColor:"#f0fdf4", border:"1px solid #86efac", borderRadius:10, padding:"12px 16px", marginBottom:20, display:"flex", alignItems:"center", gap:10 }}>
            <span>✅</span><span style={{ fontSize:14, fontWeight:600, color:"#16a34a" }}>Profile updated successfully!</span>
          </div>
        )}
        {error && (
          <div style={{ backgroundColor:"#fef2f2", border:"1px solid #fca5a5", borderRadius:10, padding:"12px 16px", marginBottom:20, display:"flex", alignItems:"center", gap:10 }}>
            <span>⚠️</span><span style={{ fontSize:14, color:"#dc2626" }}>{error}</span>
          </div>
        )}

        {/* ── FREELANCER PROFILE ── */}
        {isFreelancer && (
          <>
            {/* Header card */}
            <div style={{ backgroundColor:"#fff", borderRadius:16, padding:28, boxShadow:"0 1px 3px rgba(0,0,0,0.06)", border:"1px solid #e2e8f0", marginBottom:20 }}>
              <div style={{ display:"flex", alignItems:"center", gap:20, marginBottom: editing ? 24 : 0 }}>
                <div style={{ width:80, height:80, borderRadius:"50%", background:theme.btn, display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontWeight:800, fontSize:32, boxShadow:`0 4px 16px ${theme.shadow}`, flexShrink:0 }}>
                  {initials}
                </div>
                <div style={{ flex:1 }}>
                  {!editing ? (
                    <>
                      <div style={{ fontSize:22, fontWeight:800, color:"#111827" }}>{profile?.name}</div>
                      {profile?.title && <div style={{ fontSize:15, color:theme.accent, fontWeight:600, marginTop:2 }}>{profile.title}</div>}
                      <div style={{ fontSize:13, color:"#64748b", marginTop:4 }}>{profile?.email}</div>
                      <div style={{ display:"flex", gap:12, flexWrap:"wrap", marginTop:8 }}>
                        {profile?.location   && <Chip icon="📍" label={profile.location} />}
                        {profile?.experience && <Chip icon="💼" label={profile.experience} />}
                        {profile?.availability && <Chip icon="🟢" label={profile.availability} />}
                        {profile?.expected_salary && <Chip icon="💰" label={profile.expected_salary} />}
                      </div>
                    </>
                  ) : (
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
                      <EF label="Full Name"   icon="👤" value={form.name}     onChange={v => set("name", v)}     placeholder="Your full name" theme={theme} />
                      <EF label="Job Title"   icon="🎯" value={form.title}    onChange={v => set("title", v)}    placeholder="e.g. Full Stack Developer" theme={theme} />
                    </div>
                  )}
                </div>
                {!editing && (
                  <button onClick={() => setEditing(true)}
                    style={{ padding:"10px 24px", background:theme.btn, color:"white", border:"none", borderRadius:10, cursor:"pointer", fontWeight:600, fontSize:14, boxShadow:`0 2px 8px ${theme.shadow}`, flexShrink:0 }}>
                    ✏️ Edit Profile
                  </button>
                )}
              </div>

              {/* Social links - view */}
              {!editing && (profile?.linkedin || profile?.github || profile?.portfolio) && (
                <div style={{ display:"flex", gap:12, flexWrap:"wrap", marginTop:16, paddingTop:16, borderTop:"1px solid #f1f5f9" }}>
                  {profile.linkedin  && <a href={profile.linkedin}  target="_blank" rel="noreferrer" style={{ display:"flex", alignItems:"center", gap:6, fontSize:13, color:"#0077b5", fontWeight:600, textDecoration:"none" }}>🔗 LinkedIn</a>}
                  {profile.github    && <a href={profile.github}    target="_blank" rel="noreferrer" style={{ display:"flex", alignItems:"center", gap:6, fontSize:13, color:"#24292e", fontWeight:600, textDecoration:"none" }}>⚡ GitHub</a>}
                  {profile.portfolio && <a href={profile.portfolio} target="_blank" rel="noreferrer" style={{ display:"flex", alignItems:"center", gap:6, fontSize:13, color:theme.accent, fontWeight:600, textDecoration:"none" }}>🌐 Portfolio</a>}
                </div>
              )}
            </div>

            {/* Edit form sections */}
            {editing && (
              <>
                <Section title="Basic Information">
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
                    <EF label="Location"         icon="📍" value={form.location}        onChange={v => set("location", v)}        placeholder="City, Country" theme={theme} />
                    <EF label="Phone"            icon="📞" value={form.phone}           onChange={v => set("phone", v)}           placeholder="+1 234 567 8900" theme={theme} />
                    <EF label="Total Experience" icon="💼" value={form.experience}      onChange={v => set("experience", v)}      placeholder="e.g. 3 years, 5+ years" theme={theme} />
                    <EF label="Availability"     icon="🟢" value={form.availability}    onChange={v => set("availability", v)}    placeholder="e.g. Immediate, 2 weeks notice" theme={theme} />
                    <EF label="Expected Rate"    icon="💰" value={form.expected_salary} onChange={v => set("expected_salary", v)} placeholder="e.g. $50/hr or $60,000/yr" theme={theme} />
                    <EF label="Languages"        icon="🗣️" value={form.languages}       onChange={v => set("languages", v)}       placeholder="e.g. English, Hindi, Tamil" theme={theme} />
                  </div>
                </Section>

                <Section title="Professional Summary">
                  <EF label="Bio / Summary" icon="📝" value={form.bio} onChange={v => set("bio", v)} placeholder="Write a professional summary about your experience, expertise and what you bring to clients..." multiline theme={theme} />
                </Section>

                <Section title="Skills">
                  <div style={{ marginBottom:4 }}>
                    <FieldLabel icon="🛠️" label="Skills (comma separated)" />
                    <input value={form.skills} onChange={e => set("skills", e.target.value)}
                      placeholder="e.g. React, Node.js, Python, PostgreSQL, Docker"
                      style={{ ...inp, borderColor:theme.accent }} />
                    {editSkillList.length > 0 && (
                      <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginTop:8 }}>
                        {editSkillList.map(s => <Tag key={s} label={s} theme={theme} />)}
                      </div>
                    )}
                  </div>
                </Section>

                <Section title="Education & Certifications">
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
                    <EF label="Education"       icon="🎓" value={form.education}      onChange={v => set("education", v)}      placeholder="e.g. B.Tech CSE, Anna University, 2020" theme={theme} />
                    <EF label="Certifications"  icon="📜" value={form.certifications} onChange={v => set("certifications", v)} placeholder="e.g. AWS Certified, Google Cloud" theme={theme} />
                  </div>
                </Section>

                <Section title="Online Presence">
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:16 }}>
                    <EF label="Portfolio URL" icon="🌐" value={form.portfolio} onChange={v => set("portfolio", v)} placeholder="https://yourportfolio.com" theme={theme} />
                    <EF label="LinkedIn URL"  icon="🔗" value={form.linkedin}  onChange={v => set("linkedin", v)}  placeholder="https://linkedin.com/in/..." theme={theme} />
                    <EF label="GitHub URL"    icon="⚡" value={form.github}    onChange={v => set("github", v)}    placeholder="https://github.com/..." theme={theme} />
                  </div>
                </Section>
              </>
            )}

            {/* View mode sections */}
            {!editing && (
              <>
                {profile?.bio && (
                  <div style={{ backgroundColor:"#fff", borderRadius:16, padding:24, boxShadow:"0 1px 3px rgba(0,0,0,0.06)", border:"1px solid #e2e8f0", marginBottom:16 }}>
                    <SectionHead icon="📝" title="Professional Summary" />
                    <p style={{ fontSize:14, color:"#374151", lineHeight:1.8, margin:0 }}>{profile.bio}</p>
                  </div>
                )}

                {skillList.length > 0 && (
                  <div style={{ backgroundColor:"#fff", borderRadius:16, padding:24, boxShadow:"0 1px 3px rgba(0,0,0,0.06)", border:"1px solid #e2e8f0", marginBottom:16 }}>
                    <SectionHead icon="🛠️" title="Skills" />
                    <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                      {skillList.map(s => <Tag key={s} label={s} theme={theme} />)}
                    </div>
                  </div>
                )}

                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:16 }}>
                  {(profile?.education || profile?.certifications) && (
                    <div style={{ backgroundColor:"#fff", borderRadius:16, padding:24, boxShadow:"0 1px 3px rgba(0,0,0,0.06)", border:"1px solid #e2e8f0" }}>
                      <SectionHead icon="🎓" title="Education & Certifications" />
                      {profile.education     && <InfoRow icon="🎓" label="Education"      value={profile.education} />}
                      {profile.certifications && (
                        <div style={{ marginTop:10 }}>
                          <div style={{ fontSize:12, color:"#64748b", marginBottom:6 }}>📜 Certifications</div>
                          <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                            {certList.map(c => <Tag key={c} label={c} theme={theme} />)}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  {(profile?.languages || profile?.phone) && (
                    <div style={{ backgroundColor:"#fff", borderRadius:16, padding:24, boxShadow:"0 1px 3px rgba(0,0,0,0.06)", border:"1px solid #e2e8f0" }}>
                      <SectionHead icon="ℹ️" title="Additional Information" />
                      {profile.languages && <InfoRow icon="🗣️" label="Languages"   value={profile.languages} />}
                      {profile.phone     && <InfoRow icon="📞" label="Phone"       value={profile.phone} />}
                    </div>
                  )}
                </div>
              </>
            )}
          </>
        )}

        {/* ── CLIENT PROFILE ── */}
        {!isFreelancer && (
          <div style={{ backgroundColor:"#fff", borderRadius:16, padding:32, boxShadow:"0 1px 3px rgba(0,0,0,0.06)", border:"1px solid #e2e8f0" }}>
            <div style={{ display:"flex", alignItems:"center", gap:20, marginBottom:28, paddingBottom:24, borderBottom:"1px solid #f1f5f9" }}>
              <div style={{ width:80, height:80, borderRadius:"50%", background:theme.btn, display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontWeight:800, fontSize:32, boxShadow:`0 4px 16px ${theme.shadow}`, flexShrink:0 }}>
                {initials}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:22, fontWeight:800, color:"#111827" }}>{profile?.name}</div>
                {profile?.industry && <div style={{ fontSize:14, color:theme.accent, fontWeight:600, marginTop:2 }}>{profile.industry}</div>}
                <div style={{ fontSize:13, color:"#64748b", marginTop:4 }}>{profile?.email}</div>
              </div>
              {!editing && (
                <button onClick={() => setEditing(true)}
                  style={{ padding:"10px 24px", background:theme.btn, color:"white", border:"none", borderRadius:10, cursor:"pointer", fontWeight:600, fontSize:14, boxShadow:`0 2px 8px ${theme.shadow}` }}>
                  ✏️ Edit Profile
                </button>
              )}
            </div>

            {!editing ? (
              <div style={{ display:"grid", gap:20 }}>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
                  <VF label="Company Name"  icon="🏢" value={profile?.name} />
                  <VF label="Industry"      icon="🏭" value={profile?.industry} />
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
                  <VF label="Company Size"  icon="👥" value={profile?.company_size} />
                  <VF label="Website"       icon="🌐" value={profile?.website} />
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
                  <VF label="Location"      icon="📍" value={profile?.location} />
                  <VF label="Phone"         icon="📞" value={profile?.phone} />
                </div>
                <VF label="About Company"   icon="📝" value={profile?.bio} />
              </div>
            ) : (
              <div style={{ display:"grid", gap:20 }}>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
                  <EF label="Company Name" icon="🏢" value={form.name}         onChange={v => set("name", v)}         placeholder="Your company name" theme={theme} />
                  <EF label="Industry"     icon="🏭" value={form.industry}     onChange={v => set("industry", v)}     placeholder="e.g. Technology, Finance" theme={theme} />
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
                  <EF label="Company Size" icon="👥" value={form.company_size} onChange={v => set("company_size", v)} placeholder="e.g. 1-10, 10-50, 50-200" theme={theme} />
                  <EF label="Website"      icon="🌐" value={form.website}      onChange={v => set("website", v)}      placeholder="https://yourcompany.com" theme={theme} />
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
                  <EF label="Location"     icon="📍" value={form.location}     onChange={v => set("location", v)}     placeholder="City, Country" theme={theme} />
                  <EF label="Phone"        icon="📞" value={form.phone}        onChange={v => set("phone", v)}        placeholder="+1 (555) 123-4567" theme={theme} />
                </div>
                <VF label="Email" icon="📧" value={profile?.email} />
                <EF label="About Company" icon="📝" value={form.bio} onChange={v => set("bio", v)} placeholder="Describe your company, mission and what you're looking for..." multiline theme={theme} />
              </div>
            )}
          </div>
        )}

        {/* Save / Cancel */}
        {editing && (
          <div style={{ display:"flex", gap:12, marginTop:24 }}>
            <button onClick={handleSave} disabled={saving}
              style={{ display:"flex", alignItems:"center", gap:8, padding:"12px 32px", background:saving ? "#cbd5e1" : theme.btn, color:"white", border:"none", borderRadius:10, cursor:saving ? "not-allowed" : "pointer", fontWeight:700, fontSize:14, boxShadow:saving ? "none" : `0 4px 12px ${theme.shadow}` }}>
              💾 {saving ? "Saving..." : "Save Changes"}
            </button>
            <button onClick={handleCancel}
              style={{ padding:"12px 24px", backgroundColor:"white", color:"#374151", border:"1.5px solid #e2e8f0", borderRadius:10, cursor:"pointer", fontWeight:600, fontSize:14 }}>
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Helper components ─────────────────────────────────────────

function Section({ title, children }) {
  return (
    <div style={{ backgroundColor:"#fff", borderRadius:16, padding:24, boxShadow:"0 1px 3px rgba(0,0,0,0.06)", border:"1px solid #e2e8f0", marginBottom:16 }}>
      <h3 style={{ fontSize:14, fontWeight:700, color:"#111827", margin:"0 0 16px", display:"flex", alignItems:"center", gap:8 }}>{title}</h3>
      {children}
    </div>
  );
}

function SectionHead({ icon, title }) {
  return <h3 style={{ fontSize:14, fontWeight:700, color:"#111827", margin:"0 0 14px", display:"flex", alignItems:"center", gap:8 }}><span>{icon}</span>{title}</h3>;
}

function InfoRow({ icon, label, value }) {
  if (!value) return null;
  return (
    <div style={{ display:"flex", gap:8, marginBottom:8, fontSize:13 }}>
      <span>{icon}</span>
      <span style={{ color:"#64748b" }}>{label}:</span>
      <span style={{ color:"#111827", fontWeight:500 }}>{value}</span>
    </div>
  );
}

function Chip({ icon, label }) {
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:4, fontSize:12, color:"#374151", backgroundColor:"#f8fafc", padding:"4px 10px", borderRadius:20, border:"1px solid #e2e8f0" }}>
      {icon} {label}
    </span>
  );
}

function FieldLabel({ icon, label }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:13, fontWeight:600, color:"#374151", marginBottom:8 }}>
      <span>{icon}</span>{label}
    </div>
  );
}

function VF({ label, icon, value }) {
  return (
    <div>
      <FieldLabel icon={icon} label={label} />
      <div style={{ fontSize:14, color:value ? "#111827" : "#94a3b8", padding:"10px 14px", backgroundColor:"#f8fafc", borderRadius:8, border:"1px solid #e2e8f0", minHeight:42 }}>
        {value || "—"}
      </div>
    </div>
  );
}

// EF = EditField
function EF({ label, icon, value, onChange, placeholder, multiline, theme }) {
  return (
    <div>
      <FieldLabel icon={icon} label={label} />
      {multiline ? (
        <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={4}
          style={{ ...inp, resize:"vertical", lineHeight:1.7, borderColor:theme.accent }} />
      ) : (
        <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          style={{ ...inp, borderColor:theme.accent }} />
      )}
    </div>
  );
}

function Tag({ label, theme }) {
  return (
    <span style={{ padding:"4px 14px", background:theme.accentLight, color:theme.accent, borderRadius:20, fontSize:12, fontWeight:600, border:`1px solid ${theme.accent}33` }}>
      {label}
    </span>
  );
}

const inp = {
  width:"100%", padding:"10px 14px", border:"1.5px solid #e2e8f0",
  borderRadius:10, fontSize:14, outline:"none", fontFamily:"inherit",
  backgroundColor:"#fff", boxSizing:"border-box", transition:"border-color 0.2s",
};