import "./FindProjects.css";
import React, { useEffect, useState } from "react";
import PageContainer from "../layout/PageContainer";
import ProjectCard from "../components/ProjectCard";

const FindProjects = () => {

  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState("");

  const fetchProjects = () => {
    fetch(`http://127.0.0.1:8000/projects?search=${search}`)
      .then((res) => res.json())
      .then((data) => {
        setProjects(data);
      })
      .catch((error) => {
        console.error("Error fetching projects:", error);
      });
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <PageContainer>

      <div className="find-projects-page">

        <div className="page-header">
          <h1>Find Projects</h1>
          <p>Browse and apply to projects that match your skills</p>
        </div>

        <div className="search-bar">

          <input
            type="text"
            placeholder="Search projects..."
            className="search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <button className="search-button" onClick={fetchProjects}>
            Search
          </button>

        </div>

        <div className="projects-container">

          {projects.length === 0 ? (
            <p>No projects available</p>
          ) : (
            projects.map((project) => (
              <ProjectCard
                key={project.id}
                id={project.id}
                title={project.title}
                description={project.description}
                skills={project.skills_required.split(",")}
                budget={project.budget}
                duration={project.duration}
                client="TechCorp"
                time="2 hours ago"
                proposals="8"
              />
            ))
          )}

        </div>

      </div>

    </PageContainer>
  );
};

export default FindProjects;