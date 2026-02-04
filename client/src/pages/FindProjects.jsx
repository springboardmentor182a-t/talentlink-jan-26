import ProjectCard from "../components/ProjectCard";
import ProjectFilters from "../components/ProjectFilters";
import projects from "../data/projects";
import "../styles/browseProjects.css";

const BrowseProjects = () => {
  return (
    <div className="browse-projects">

      <div className="page-header">
        <h1>Browse Projects</h1>
        <p>Find your next opportunity</p>
      </div>

      <ProjectFilters />

      <div className="projects-list">
        {projects.map(project => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>

    </div>
  );
};

export default BrowseProjects;
