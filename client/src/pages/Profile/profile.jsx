import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import api from "../../utils/api";

export default function Profile({ onNavigate }) {
  const { user, role } = useContext(AuthContext);
  const isFreelancer   = role === "freelancer";

  const theme = isFreelancer
    ? { headerBg:"linear-gradient(135deg,#3b0764 0%,#7c3aed 40%,#a855f7 100%)", accent:"#7c3aed", accentLight:"#f5f3ff", btn:"linear-gradient(135deg,#7c3aed,#a855f7)", shadow:"rgba(124,58,237,0.3)" }
    : { headerBg:"linear-gradient(135deg,#1e3a5f 0%,#2563eb 50%,#3b82f6 100%)", accent:"#2563eb", accentLight:"#eff6ff", btn:"linear-gradient(135deg,#2563eb,#3b82f6)", shadow:"rgba(37,99,235,0.3)" };

  const [profile,  setProfile]  = useState(null);
  const [editing,  setEditing]  = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [success,  setSuccess]  = useState(false);
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(true);

  const [form, setForm] = useState({
    name:"", bio:"", location:"", phone:"",
    skills:"", experience:"", portfolio:"",
    industry:"", website:"",
  });

  const loadProfile = async () => {
    try {
      const res = await api.get(`/profile/${user.id}`);
      const p = res.data;
      setProfile(p);
      setForm({
        name:       p.name       || "",
        bio:        p.bio        || "",
        location:   p.location   || "",
        phone:      p.phone      || "",
        skills:     p.skills     || "",
        experience: p.experience || "",
        portfolio:  p.portfolio  || "",
        industry:   p.industry   || "",
        website:    p.website    || "",
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
      const p = res.data;
      setProfile(p);
      setForm({
        name:       p.name       || "",
        bio:        p.bio        || "",
        location:   p.location   || "",
        phone:      p.phone      || "",
        skills:     p.skills     || "",
        experience: p.experience || "",
        portfolio:  p.portfolio  || "",
        industry:   p.industry   || "",
        website:    p.website    || "",
      });
      setEditing(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Save error:", err.response?.data, err.message);
      setError(err.response?.data?.detail || `Error ${err.response?.status || ""}: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setForm({
        name:       profile.name       || "",
        bio:        profile.bio        || "",
        location:   profile.location   || "",
        phone:      profile.phone      || "",
        skills:     profile.skills     || "",
        experience: profile.experience || "",
        portfolio:  profile.portfolio  || "",
        industry:   profile.industry   || "",
        website:    profile.website    || "",
      });
    }
    setEditing(false);
    setError("");
  };

  const set = (field, val) => setForm(f => ({ ...f, [field]: val }));

  if (loading) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:"60vh" }}>
      <p style={{ color:"var(--text-muted)" }}>Loading profile...</p>
    </div>
  );

  const initials      = (profile?.name || "U").charAt(0).toUpperCase();
  const skillList     = (profile?.skills || "").split(",").map(s => s.trim()).filter(Boolean);
  const editSkillList = (form.skills || "").split(",").map(s => s.trim()).filter(Boolean);

  return (
    <div style={{ fontFamily:"'Segoe UI',sans-serif", backgroundColor:"var(--page-bg)", minHeight:"100vh" }}>

      {/* Hero */}
      <div style={{ background:theme.headerBg, padding:"24px 16px", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:-40, right:-40, width:200, height:200, borderRadius:"50%", background:"rgba(255,255,255,0.05)" }} />
        <div style={{ display:"inline-flex", alignItems:"center", gap:8, backgroundColor:"rgba(255,255,255,0.15)", borderRadius:20, padding:"4px 14px", fontSize:12, color:"white", fontWeight:600, marginBottom:10 }}>
          👤 {isFreelancer ? "Freelancer Profile" : "Company Profile"}
        </div>
        <h1 style={{ fontSize:28, fontWeight:800, color:"white", margin:"0 0 6px", letterSpacing:"-0.5px" }}>
          {isFreelancer ? "My Profile" : "Company Profile"}
        </h1>
        <p style={{ fontSize:14, color:"rgba(255,255,255,0.75)", margin:0 }}>
          {isFreelancer ? "Manage your professional information" : "Manage your company information and contact details"}
        </p>
      </div>

      <div style={{ padding:"20px 16px", maxWidth:900, margin:"0 auto" }}>

        {/* Banners */}
        {success && (
          <div style={{ backgroundColor:"var(--tint-green)", border:"1px solid var(--tint-green-border)", borderRadius:10, padding:"12px 16px", marginBottom:20, display:"flex", alignItems:"center", gap:10 }}>
            <span>✅</span>
            <span style={{ fontSize:14, fontWeight:600, color:"#16a34a" }}>Profile updated successfully!</span>
          </div>
        )}
        {error && (
          <div style={{ backgroundColor:"#fef2f2", border:"1px solid #fca5a5", borderRadius:10, padding:"12px 16px", marginBottom:20, display:"flex", alignItems:"center", gap:10 }}>
            <span>⚠️</span>
            <span style={{ fontSize:14, color:"#dc2626" }}>{error}</span>
          </div>
        )}

        {/* Profile Card */}
        <div style={{ backgroundColor:"var(--card)", borderRadius:16, padding:32, boxShadow:"0 1px 3px rgba(0,0,0,0.06)", border:"1px solid var(--border)" }}>

          {/* Avatar row */}
          <div style={{ display:"flex", alignItems:"flex-start", gap:16, marginBottom:28, paddingBottom:24, borderBottom:"1px solid var(--border-light)", flexWrap:"wrap" }}>
            <div style={{ width:80, height:80, borderRadius:"50%", background:theme.btn, display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontWeight:800, fontSize:32, boxShadow:`0 4px 16px ${theme.shadow}`, flexShrink:0 }}>
              {initials}
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:22, fontWeight:800, color:"var(--text-primary)" }}>{profile?.name}</div>
              <div style={{ fontSize:13, color:"var(--text-muted)", marginTop:4 }}>{profile?.email}</div>
              <span style={{ display:"inline-block", marginTop:6, padding:"3px 12px", borderRadius:20, fontSize:12, fontWeight:700, background:theme.accentLight, color:theme.accent }}>
                {isFreelancer ? "Freelancer" : "Client"}
              </span>
            </div>
            {!editing && (
              <button onClick={() => setEditing(true)}
                style={{ padding:"10px 20px", background:theme.btn, color:"white", border:"none", borderRadius:10, cursor:"pointer", fontWeight:600, fontSize:13, boxShadow:`0 2px 8px ${theme.shadow}`, flexShrink:0, whiteSpace:"nowrap" }}>
                ✏️ Edit Profile
              </button>
            )}
          </div>

          {/* FREELANCER VIEW MODE */}
          {isFreelancer && !editing && (
            <div style={{ display:"grid", gap:20 }}>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(200px, 1fr))", gap:20 }}>
                <ViewField label="Full Name" icon="👤" value={profile?.name} />
                <ViewField label="Email"     icon="📧" value={profile?.email} />
              </div>
              <ViewField label="Bio" icon="📝" value={profile?.bio} />
              <div>
                <FieldLabel icon="🛠️" label="Skills" />
                {skillList.length > 0
                  ? <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>{skillList.map(s => <Tag key={s} label={s} theme={theme} />)}</div>
                  : <ViewBox value={null} />}
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(200px, 1fr))", gap:20 }}>
                <ViewField label="Experience"    icon="💼" value={profile?.experience} />
                <ViewField label="Location"      icon="📍" value={profile?.location} />
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(200px, 1fr))", gap:20 }}>
                <ViewField label="Phone"         icon="📞" value={profile?.phone} />
                <ViewField label="Portfolio URL" icon="🌐" value={profile?.portfolio} />
              </div>
            </div>
          )}

          {/* FREELANCER EDIT MODE */}
          {isFreelancer && editing && (
            <div style={{ display:"grid", gap:20 }}>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(200px, 1fr))", gap:20 }}>
                <EditField label="Full Name" icon="👤" value={form.name}  onChange={v => set("name", v)}  placeholder="Your full name" theme={theme} />
                <ViewField label="Email"     icon="📧" value={profile?.email} />
              </div>
              <EditField label="Bio" icon="📝" value={form.bio} onChange={v => set("bio", v)} placeholder="Tell clients about yourself..." multiline theme={theme} />
              <div>
                <FieldLabel icon="🛠️" label="Skills" />
                <input value={form.skills} onChange={e => set("skills", e.target.value)}
                  placeholder="e.g. React, Python, Node.js (comma separated)"
                  style={{ ...inp, borderColor:theme.accent }} />
                {editSkillList.length > 0 && (
                  <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginTop:8 }}>
                    {editSkillList.map(s => <Tag key={s} label={s} theme={theme} />)}
                  </div>
                )}
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(200px, 1fr))", gap:20 }}>
                <EditField label="Experience"    icon="💼" value={form.experience} onChange={v => set("experience", v)} placeholder="e.g. 3 years" theme={theme} />
                <EditField label="Location"      icon="📍" value={form.location}   onChange={v => set("location", v)}   placeholder="City, Country" theme={theme} />
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(200px, 1fr))", gap:20 }}>
                <EditField label="Phone"         icon="📞" value={form.phone}     onChange={v => set("phone", v)}     placeholder="+1 234 567 8900" theme={theme} />
                <EditField label="Portfolio URL" icon="🌐" value={form.portfolio} onChange={v => set("portfolio", v)} placeholder="https://yourportfolio.com" theme={theme} />
              </div>
            </div>
          )}

          {/* CLIENT VIEW MODE */}
          {!isFreelancer && !editing && (
            <div style={{ display:"grid", gap:20 }}>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(200px, 1fr))", gap:20 }}>
                <ViewField label="Company Name" icon="🏢" value={profile?.name} />
                <ViewField label="Industry"     icon="🏭" value={profile?.industry} />
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(200px, 1fr))", gap:20 }}>
                <ViewField label="Website"  icon="🌐" value={profile?.website} />
                <ViewField label="Location" icon="📍" value={profile?.location} />
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(200px, 1fr))", gap:20 }}>
                <ViewField label="Phone" icon="📞" value={profile?.phone} />
                <ViewField label="Email" icon="📧" value={profile?.email} />
              </div>
              <ViewField label="Company Description" icon="📝" value={profile?.bio} />
            </div>
          )}

          {/* CLIENT EDIT MODE */}
          {!isFreelancer && editing && (
            <div style={{ display:"grid", gap:20 }}>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(200px, 1fr))", gap:20 }}>
                <EditField label="Company Name" icon="🏢" value={form.name}     onChange={v => set("name", v)}     placeholder="Your company name" theme={theme} />
                <EditField label="Industry"     icon="🏭" value={form.industry} onChange={v => set("industry", v)} placeholder="e.g. Technology" theme={theme} />
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(200px, 1fr))", gap:20 }}>
                <EditField label="Website"  icon="🌐" value={form.website}  onChange={v => set("website", v)}  placeholder="https://yourcompany.com" theme={theme} />
                <EditField label="Location" icon="📍" value={form.location} onChange={v => set("location", v)} placeholder="City, Country" theme={theme} />
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(200px, 1fr))", gap:20 }}>
                <EditField label="Phone" icon="📞" value={form.phone} onChange={v => set("phone", v)} placeholder="+1 (555) 123-4567" theme={theme} />
                <ViewField label="Email" icon="📧" value={profile?.email} />
              </div>
              <EditField label="Company Description" icon="📝" value={form.bio} onChange={v => set("bio", v)} placeholder="Describe your company..." multiline theme={theme} />
            </div>
          )}

          {/* Save / Cancel */}
          {editing && (
            <div style={{ display:"flex", gap:12, marginTop:28, paddingTop:24, borderTop:"1px solid var(--border-light)" }}>
              <button onClick={handleSave} disabled={saving}
                style={{ display:"flex", alignItems:"center", gap:8, padding:"12px 32px", background:saving ? "var(--muted)" : theme.btn, color:"white", border:"none", borderRadius:10, cursor:saving ? "not-allowed" : "pointer", fontWeight:700, fontSize:14, boxShadow:saving ? "none" : `0 4px 12px ${theme.shadow}` }}>
                💾 {saving ? "Saving..." : "Save Changes"}
              </button>
              <button onClick={handleCancel}
                style={{ padding:"12px 24px", backgroundColor:"var(--card)", color:"var(--text-secondary)", border:"1.5px solid var(--border)", borderRadius:10, cursor:"pointer", fontWeight:600, fontSize:14 }}>
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FieldLabel({ icon, label }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:13, fontWeight:600, color:"var(--text-secondary)", marginBottom:8 }}>
      <span>{icon}</span>{label}
    </div>
  );
}

function ViewBox({ value }) {
  return (
    <div style={{ fontSize:14, color:value ? "#111827" : "#94a3b8", padding:"10px 14px", backgroundColor:"var(--page-bg)", borderRadius:8, border:"1px solid var(--border)", lineHeight:1.6, minHeight:42 }}>
      {value || "—"}
    </div>
  );
}

function ViewField({ label, icon, value }) {
  return (
    <div>
      <FieldLabel icon={icon} label={label} />
      <ViewBox value={value} />
    </div>
  );
}

function EditField({ label, icon, value, onChange, placeholder, multiline, theme }) {
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
  width:"100%", padding:"10px 14px", border:"1.5px solid var(--border)",
  borderRadius:10, fontSize:14, outline:"none", fontFamily:"inherit",
  backgroundColor:"var(--input-background)", boxSizing:"border-box", transition:"border-color 0.2s",
};