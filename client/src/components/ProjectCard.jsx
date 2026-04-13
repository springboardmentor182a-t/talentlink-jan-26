import { useState } from "react";
import { saveProject, unsaveProject } from "../services/api";

const ProjectCard = ({ project, onApply, initialSaved = false }) => {
  const [saved,  setSaved]  = useState(initialSaved);
  const [saving, setSaving] = useState(false);

  if (!project) return null;

  const skillsArray = project.skills
    ? project.skills.split(",").map(s => s.trim())
    : [];

  const budget = project.budget_min && project.budget_max
    ? `$${project.budget_min.toLocaleString()} – $${project.budget_max.toLocaleString()}`
    : project.budget || "Budget TBD";

  const handleSave = async (e) => {
    e.stopPropagation();
    if (saving) return;
    setSaving(true);
    try {
      if (saved) {
        await unsaveProject(project.id);
        setSaved(false);
      } else {
        await saveProject(project.id);
        setSaved(true);
      }
    } catch (err) {
      console.error("Save toggle failed:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="project-card">
      <div className="project-header">
        <h3>{project.title}</h3>
        <span className="match-badge">New</span>
      </div>

      {/* Posted by — answers the freelancer's "who is this client?" question */}
      {project.client_display_name && (
        <p className="project-poster">
          Posted by <strong>{project.client_display_name}</strong>
        </p>
      )}

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
          <button
            className={`save-btn${saved ? " save-btn--saved" : ""}`}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "..." : saved ? "Saved ✓" : "Save"}
          </button>
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