import ProjectCard from "../components/ProjectCard";
import ProjectFilters from "../components/ProjectFilters";
import "./findProjects.css";

const FindProjects = () => {
  const projects = [
  {
    id: 1,
    title: "React Dashboard Development",
    description: "Build a responsive dashboard using React and REST APIs.",
    budget: "₹15,000 – ₹25,000",
    duration: "2 weeks",
    skills: ["React", "API", "CSS"],
  },
  {
    id: 2,
    title: "Django REST API for Freelance Platform",
    description: "Create secure REST APIs using Django and JWT.",
    budget: "₹20,000 – ₹30,000",
    duration: "3 weeks",
    skills: ["Django", "JWT", "PostgreSQL"],
  },
  {
    id: 3,
    title: "UI Design for Startup Website",
    description: "Design clean UI screens using Figma.",
    budget: "₹8,000 – ₹12,000",
    duration: "1 week",
    skills: ["Figma", "UI/UX"],
  },
];

  return (
    <div className="find-projects-container">

      {/* Header */}
      <div className="find-projects-header">
        <h1>Browse Projects</h1>
        <p>Find your next opportunity</p>
      </div>

      {/* Filters */}
      <ProjectFilters />

      {/* Project List */}
      <div className="projects-list">
  {projects.map((project) => (
    <ProjectCard key={project.id} project={project} />
  ))}
</div>


    </div>
  );
};

export default FindProjects;
