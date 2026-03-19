import React, { useEffect, useMemo, useState } from 'react';
import './Projects.css';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All Categories');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const apiBase = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api';
    const controller = new AbortController();

    const fetchProjects = async () => {
      setIsLoading(true);
      setError('');

      try {
        const response = await fetch(`${apiBase}/freelancer/projects`, {
          signal: controller.signal
        });

        if (!response.ok) {
          throw new Error('Failed to load projects');
        }

        const data = await response.json();
        setProjects(Array.isArray(data?.projects) ? data.projects : []);
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err.message || 'Failed to load projects');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();

    return () => controller.abort();
  }, []);

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesSearch = project.title?.toLowerCase().includes(search.toLowerCase());
      const matchesCategory =
        category === 'All Categories' || project.category === category;
      return matchesSearch && matchesCategory;
    });
  }, [projects, search, category]);

  return (
    <div className="projects-page">
      <div className="page-header">
        <h1>Find Projects</h1>
        <p>Browse and apply for projects matching your skills</p>
      </div>

      <div className="filters-section">
        <input
          type="text"
          placeholder="Search projects..."
          className="search-box"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <select
          className="filter-select"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
        >
          <option>All Categories</option>
          <option>Web Development</option>
          <option>UI/UX Design</option>
          <option>Mobile Development</option>
        </select>
      </div>

      <div className="projects-list">
        {isLoading && <p className="placeholder">Loading projects...</p>}
        {!isLoading && error && <p className="placeholder">{error}</p>}
        {!isLoading && !error && filteredProjects.length === 0 && (
          <p className="placeholder">No projects found.</p>
        )}
        {!isLoading && !error && filteredProjects.length > 0 && (
          <ul className="project-grid">
            {filteredProjects.map((project) => (
              <li key={project.id || project._id} className="project-card">
                <div className="project-top">
                  <h3 className="project-title">{project.title || 'Untitled Project'}</h3>
                  <span className="project-budget">${project.budget ?? 0}</span>
                </div>
                <p className="project-meta">
                  {project.client || 'Client'} • {project.postedDaysAgo || '—'} days ago
                </p>
                <div className="project-tags">
                  {(project.tags || []).map((tag) => (
                    <span key={tag} className="project-tag">{tag}</span>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Projects;
