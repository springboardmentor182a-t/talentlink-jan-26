const ProjectCard = ({ project, onApply }) => {
  if (!project) return null;

  const skillsArray = project.skills
    ? project.skills.split(",").map(s => s.trim())
    : [];

  const budget = project.budget_min && project.budget_max
    ? `$${project.budget_min.toLocaleString()} – $${project.budget_max.toLocaleString()}`
    : project.budget || "Budget TBD";

  return (
    <div className="project-card">
      <div className="project-header">
        <h3>{project.title}</h3>
        <span className="match-badge">New</span>
      </div>

      <p className="project-description">{project.description}</p>

      <div className="skills">
        {skillsArray.length > 0
          ? skillsArray.map((skill, i) => <span key={i}>{skill}</span>)
          : <span>No skills listed</span>}
      </div>

      <div className="project-footer">
        <p className="budget">{budget}</p>
        {project.duration && (
          <p className="duration">Duration: {project.duration}</p>
        )}
        <div className="actions">
          <button className="save-btn">Save</button>
          <button
            className="apply-btn"
            onClick={onApply}
            disabled={!onApply}
          >
            Apply Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;