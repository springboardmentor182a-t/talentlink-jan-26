const ProjectCard = () => {
  return (
    <div className="project-card">

      <div className="project-header">
        <h3>Full Stack Web Application</h3>
        <span className="match-badge">90% Match</span>
      </div>

      <p className="company-name">TechCorp Solutions</p>

      <p className="project-description">
        Looking for a full stack developer to build a modern web
        application using React and Node.js.
      </p>

      <div className="skills">
        <span>React</span>
        <span>Node.js</span>
        <span>AWS</span>
      </div>

      <div className="project-footer">
        <p className="budget">$3,000 - $6,000</p>
        <div className="actions">
          <button className="save-btn">Save</button>
          <button className="apply-btn">Apply Now</button>
        </div>
      </div>

    </div>
  );
};

export default ProjectCard;
