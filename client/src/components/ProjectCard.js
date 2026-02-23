import React from "react";

function ProjectCard({
  title,
  description,
  skills,
  budget,
  duration,
  client,
  time,
  proposals,
}) {
  return (
    <div
      style={{
        background: "white",
        padding: "22px",
        borderRadius: "16px",
        marginBottom: "22px",
        boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
      }}
    >
      <h3 style={{ fontSize: "18px", fontWeight: "700" }}>{title}</h3>

      <p style={{ color: "#6b7280", fontSize: "13px", marginBottom: "10px" }}>
        ⏱ {time} • Remote •{" "}
        <span style={{ color: "#4f46e5" }}>{proposals} proposals</span>
      </p>

      <p style={{ marginBottom: "12px" }}>{description}</p>

      <div style={{ marginBottom: "12px" }}>
        {skills.map((s, i) => (
          <span
            key={i}
            style={{
              background: "#eef2ff",
              color: "#4f46e5",
              padding: "6px 10px",
              borderRadius: "8px",
              marginRight: "6px",
              fontSize: "12px",
              fontWeight: "600",
            }}
          >
            {s}
          </span>
        ))}
      </div>

      <hr />

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "12px" }}>
        <div style={{ display: "flex", gap: "40px" }}>
          <div>
            <div style={{ color: "#6b7280", fontSize: "13px" }}>Budget</div>
            <b>{budget}</b>
          </div>
          <div>
            <div style={{ color: "#6b7280", fontSize: "13px" }}>Duration</div>
            <b>{duration}</b>
          </div>
          <div>
            <div style={{ color: "#6b7280", fontSize: "13px" }}>Client</div>
            <b>{client}</b>
          </div>
        </div>

        <button
          style={{
            background: "linear-gradient(90deg,#4f46e5,#7c3aed)",
            color: "white",
            padding: "10px 20px",
            borderRadius: "10px",
            border: "none",
            fontWeight: "600",
          }}
        >
          Apply Now
        </button>
      </div>
    </div>
  );
}

export default ProjectCard;
