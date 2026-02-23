const ProjectCard = ({ project }) => {
  if (!project) return null;

  // Convert skills string → array
  const skillsArray = project.skills
    ? project.skills.split(",").map((skill) => skill.trim())
    : [];

  return (
    <div className="project-card">

      {/* Header */}
      <div className="project-header">
        <h3>{project.title}</h3>
        <span className="match-badge">New</span>
      </div>

      {/* Description */}
      <p className="project-description">
        {project.description}
      </p>

      {/* Skills */}
      <div className="skills">
        {skillsArray.length > 0 ? (
          skillsArray.map((skill, index) => (
            <span key={index}>{skill}</span>
          ))
        ) : (
          <span>No skills listed</span>
        )}
      </div>

      {/* Budget and Duration */}
      <div className="project-footer">

        <p className="budget">
          ₹{project.budget_min} - ₹{project.budget_max}
        </p>

        <p className="duration">
          Duration: {project.duration}
        </p>

        <div className="actions">
          <button className="save-btn">Save</button>
          <button className="apply-btn">Apply Now</button>
        </div>

      </div>

    </div>
  );
};

export default ProjectCard;
