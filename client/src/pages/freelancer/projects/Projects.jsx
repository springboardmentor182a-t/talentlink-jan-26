import React from 'react';
import './Projects.css';

const Projects = () => {
  return (
    <div className="projects-page">
      <div className="page-header">
        <h1>Find Projects</h1>
        <p>Browse and apply for projects matching your skills</p>
      </div>

      <div className="filters-section">
        <input type="text" placeholder="Search projects..." className="search-box" />
        <select className="filter-select">
          <option>All Categories</option>
          <option>Web Development</option>
          <option>UI/UX Design</option>
          <option>Mobile Development</option>
        </select>
      </div>

      <div className="projects-list">
        <p className="placeholder">Projects will appear here. Connect to your backend API to fetch real data.</p>
      </div>
    </div>
  );
};

export default Projects;
