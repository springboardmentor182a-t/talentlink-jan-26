import { useEffect, useState } from "react";
import ProjectCard from "../components/ProjectCard";
import ProjectFilters from "../components/ProjectFilters";
import "./findProjects.css";

const FindProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/projects/")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch projects");
        }
        return response.json();
      })
      .then((data) => {
        setProjects(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching projects:", err);
        setError("Unable to load projects.");
        setLoading(false);
      });
  }, []);

  return (
    <div className="find-projects-container">

      {/* Header */}
      <div className="find-projects-header">
        <h1>Browse Projects</h1>
        <p>Find your next opportunity</p>
      </div>

      {/* Filters */}
      <ProjectFilters />

      {/* Loading */}
      {loading && <p>Loading projects...</p>}

      {/* Error */}
      {error && <p className="error-text">{error}</p>}

      {/* Project List */}
      {!loading && !error && (
        <div className="projects-list">
          {projects.length === 0 ? (
            <p>No projects available.</p>
          ) : (
            projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default FindProjects;
