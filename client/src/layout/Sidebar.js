import React from "react";

function Sidebar() {
  const item = (text, active = false) => (
    <div
      style={{
        padding: "12px 14px",
        borderRadius: "10px",
        marginBottom: "8px",
        background: active
          ? "linear-gradient(90deg,#4f46e5,#7c3aed)"
          : "transparent",
        color: "#fff",
        fontWeight: active ? 600 : 400,
        cursor: "pointer",
      }}
    >
      {text}
    </div>
  );

  return (
    <div
      style={{
        width: "240px",
        minHeight: "100vh",
        padding: "22px 18px",
        background: "linear-gradient(180deg,#0f172a,#1e293b)",
        color: "white",
      }}
    >
      <h2 style={{ fontSize: "20px", fontWeight: 700 }}>TalentLink</h2>
      <p style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "30px" }}>
        Freelancer
      </p>

      {item("Dashboard")}
      {item("Find Projects", true)}
      {item("My Proposals")}
      {item("Contracts")}
      {item("Messages")}
      {item("Profile")}
      {item("Reviews")}
      {item("Payments")}
      {item("Settings")}

      <div style={{ marginTop: "30px", color: "#f87171" }}>Logout</div>
    </div>
  );
}

export default Sidebar;
