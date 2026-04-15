import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../services/axios";

const BrowseProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    axiosInstance.get("/projects/")
      .then(res => setProjects(res.data?.items ?? res.data ?? []))
      .catch(err => console.error("Error fetching projects:", err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = projects.filter(p =>
    !search.trim() || p.title?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <div style={{ padding: "40px" }}>Loading projects from database...</div>;
  }

  return (
    <div style={{ padding: "40px", backgroundColor: "#F8F9FA", minHeight: "100vh" }}>
      <h1 style={{ marginBottom: "5px" }}>Browse Projects</h1>
      <p style={{ color: "#6C757D", marginBottom: "30px" }}>Find your next opportunity</p>

      <div style={{ display: "flex", gap: "15px", marginBottom: "40px" }}>
        <input
          type="text"
          placeholder="Search projects..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: 2, padding: "12px", borderRadius: "8px", border: "1px solid #E9ECEF" }}
        />
        <select style={{ flex: 1, padding: "12px", borderRadius: "8px", border: "1px solid #E9ECEF", color: "#6C757D" }}>
          <option>All Categories</option>
        </select>
        <select style={{ flex: 1, padding: "12px", borderRadius: "8px", border: "1px solid #E9ECEF", color: "#6C757D" }}>
          <option>Budget Range</option>
        </select>
        <button
          onClick={() => {}}
          className="btn-primary"
          style={{ flex: 1 }}
        >
          Search
        </button>
      </div>

      {filtered.length === 0 && (
        <p style={{ color: "#6C757D" }}>No projects found.</p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
        {filtered.map(project => {
          const budget = project.budget_min && project.budget_max
            ? `$${project.budget_min.toLocaleString()} – $${project.budget_max.toLocaleString()}`
            : project.budget || "TBD";

          const skillsArray = project.skills
            ? project.skills.split(",").map(s => s.trim())
            : [];

          return (
            <div key={project.id} style={{ backgroundColor: "white", padding: "25px", borderRadius: "15px", border: "1px solid #E9ECEF" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                <h3 style={{ margin: 0 }}>{project.title}</h3>
                <span style={{ backgroundColor: "#E8F5E9", color: "#28A745", padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "bold" }}>
                  New
                </span>
              </div>

              <p style={{ color: "#6C757D", margin: "0 0 12px 0", fontSize: "14px", lineHeight: "1.5" }}>
                {project.description}
              </p>

              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "20px" }}>
                {skillsArray.map((tag, i) => (
                  <span key={i} style={{ backgroundColor: "#F1F3F5", padding: "4px 10px", borderRadius: "4px", fontSize: "12px", color: "#495057" }}>
                    {tag}
                  </span>
                ))}
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #EEE", paddingTop: "20px" }}>
                <div>
                  <span style={{ fontSize: "18px", fontWeight: "bold" }}>{budget}</span>
                  {project.duration && (
                    <span style={{ fontSize: "14px", color: "#6C757D", marginLeft: "10px" }}>
                      {project.duration}
                    </span>
                  )}
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button style={{ padding: "10px 20px", backgroundColor: "white", border: "1px solid #E9ECEF", borderRadius: "8px", cursor: "pointer" }}>
                    Save
                  </button>
                  <button
                    className="btn-primary"
                    onClick={() => navigate(`/projects/${project.id}/apply`)}
                  >
                    Apply Now
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BrowseProjects;