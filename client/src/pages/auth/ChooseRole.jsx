import { useNavigate } from "react-router-dom";

export default function ChooseRole() {
  const navigate = useNavigate();

  const page   = { minHeight:"100vh", backgroundColor:"#eef2ff", fontFamily:"'Segoe UI',sans-serif" };
  const navbar = { display:"flex", justifyContent:"space-between", alignItems:"center", padding:"16px 40px", backgroundColor:"white", borderBottom:"1px solid #e5e7eb" };
  const logoWrap = { display:"flex", alignItems:"center", gap:10 };
  const logoIcon = { width:36, height:36, backgroundColor:"#2563eb", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontSize:18 };
  const hero   = { textAlign:"center", padding:"60px 20px 40px" };
  const cards  = { display:"flex", justifyContent:"center", gap:28, padding:"0 40px 60px", flexWrap:"wrap" };
  const card   = { backgroundColor:"white", borderRadius:16, padding:"36px 32px", width:340, boxShadow:"0 4px 20px rgba(0,0,0,0.07)", position:"relative" };
  const list   = { listStyle:"none", padding:0, margin:"0 0 28px", display:"flex", flexDirection:"column", gap:10 };
  const item   = { display:"flex", alignItems:"center", gap:10, fontSize:14, color:"#374151" };
  const btnBlue   = { width:"100%", padding:14, background:"linear-gradient(135deg,#2563eb,#3b82f6)", color:"white", border:"none", borderRadius:8, fontWeight:600, fontSize:15, cursor:"pointer" };
  const btnPurple = { width:"100%", padding:14, background:"linear-gradient(135deg,#7c3aed,#a855f7)", color:"white", border:"none", borderRadius:8, fontWeight:600, fontSize:15, cursor:"pointer" };
  const badgeBlue   = { position:"absolute", top:20, right:20, backgroundColor:"#eff6ff", color:"#2563eb", fontSize:12, fontWeight:600, padding:"4px 12px", borderRadius:20 };
  const badgePurple = { position:"absolute", top:20, right:20, backgroundColor:"#f5f3ff", color:"#7c3aed", fontSize:12, fontWeight:600, padding:"4px 12px", borderRadius:20 };
  const iconBlue   = { width:52, height:52, borderRadius:"50%", backgroundColor:"#eff6ff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:26, marginBottom:20 };
  const iconPurple = { width:52, height:52, borderRadius:"50%", backgroundColor:"#f5f3ff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:26, marginBottom:20 };

  return (
    <div style={page}>
      {/* Navbar */}
      <div style={navbar}>
        <div style={logoWrap}>
          <div style={logoIcon}>💼</div>
          <span style={{ fontWeight:700, fontSize:18, color:"#2563eb" }}>TalentLink</span>
        </div>
      </div>

      {/* Hero */}
      <div style={hero}>
        <h1 style={{ fontSize:44, fontWeight:800, color:"#111827", marginBottom:16 }}>Connect, Collaborate, Create</h1>
        <p style={{ fontSize:16, color:"#6b7280", maxWidth:520, margin:"0 auto 48px", lineHeight:1.7 }}>
          The premier platform connecting talented freelancers with visionary clients. Choose your path to get started.
        </p>
      </div>

      {/* Cards */}
      <div style={cards}>
        {/* Client Card */}
        <div style={card}>
          <span style={badgeBlue}>For Businesses</span>
          <div style={iconBlue}>💼</div>
          <h2 style={{ fontSize:22, fontWeight:700, color:"#111827", marginBottom:8 }}>I'm a Client</h2>
          <p style={{ fontSize:14, color:"#6b7280", marginBottom:20, lineHeight:1.6 }}>Post projects and hire talented freelancers to bring your vision to life.</p>
          <ul style={list}>
            {["Post unlimited projects","Review freelancer proposals","Manage contracts & progress","Secure payment tracking"].map(f => (
              <li key={f} style={item}><span>✅</span>{f}</li>
            ))}
          </ul>
          <button style={btnBlue} onClick={() => navigate("/client/login")}>Continue as Client →</button>
        </div>

        {/* Freelancer Card */}
        <div style={card}>
          <span style={badgePurple}>For Professionals</span>
          <div style={iconPurple}>👤</div>
          <h2 style={{ fontSize:22, fontWeight:700, color:"#111827", marginBottom:8 }}>I'm a Freelancer</h2>
          <p style={{ fontSize:14, color:"#6b7280", marginBottom:20, lineHeight:1.6 }}>Find exciting projects and work with clients from around the world.</p>
          <ul style={list}>
            {["Browse thousands of projects","Submit competitive proposals","Build your portfolio","Get paid for your expertise"].map(f => (
              <li key={f} style={item}><span>✅</span>{f}</li>
            ))}
          </ul>
          <button style={btnPurple} onClick={() => navigate("/freelancer/login")}>Continue as Freelancer →</button>
        </div>
      </div>
    </div>
  );
}
