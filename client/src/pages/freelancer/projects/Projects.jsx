import React, { useEffect, useMemo, useState } from "react";
import { Clock3, Send } from "lucide-react";

import { fetchFreelancerProjects } from "../../../services/freelancer";
import "./Projects.css";

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProjects = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await fetchFreelancerProjects();
        setProjects(Array.isArray(data?.projects) ? data.projects : []);
      } catch (err) {
        setError(err.message || "Failed to load projects.");
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, []);

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const haystack = `${project.title || ""} ${project.client_name || ""} ${project.description || ""}`.toLowerCase();
      return haystack.includes(search.toLowerCase());
    });
  }, [projects, search]);

  return (
    <div className="freelancer-section-page">
      <div className="section-hero">
        <div>
          <h2>Find Projects</h2>
          <p>Open opportunities from real client records in your database.</p>
        </div>
        <input
          className="section-search"
          type="text"
          placeholder="Search by title, client, or description"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      {loading && <div className="freelancer-state">Loading projects...</div>}
      {!loading && error && <div className="freelancer-state error">{error}</div>}

      {!loading && !error && (
        <div className="project-grid-list">
          {filteredProjects.length === 0 && (
            <div className="empty-card">No open projects match your search.</div>
          )}
          {filteredProjects.map((project) => (
            <article key={project.id} className="project-market-card">
              <div className="project-market-top">
                <div>
                  <h3>{project.title}</h3>
                  <p>{project.client_name}</p>
                </div>
                <span className={`project-badge ${project.already_applied ? "applied" : "open"}`}>
                  {project.already_applied ? "Proposal Sent" : project.status}
                </span>
              </div>
              <p className="project-description">{project.description}</p>
              <div className="project-market-meta">
                <span>${Number(project.budget || 0).toLocaleString()}</span>
                <span>
                  <Clock3 size={15} />
                  {project.days_left ?? 0} days left
                </span>
                <span>
                  <Send size={15} />
                  {project.time_ago}
                </span>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default Projects;
