import React, { useState } from 'react';
import axios from 'axios'; // Ensure this is at the very top!
import Dropdown from './Buttons/Dropdown';
const Projects = () => {
  // 1. Define your "States" to hold the search results and input
  const [projects, setProjects] = useState([]);
  const [minPrice, setMinPrice] = useState(0);

  // 2. PASTE THE CODE HERE (The Logic)
  const handleSearch = async () => {
    try {
      const res = await axios.get(`http://127.0.0.1:8000/projects/?min_budget=${minPrice}`);
      setProjects(res.data);
    } catch (error) {
      console.error("Search failed:", error);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Browse Projects</h1>
      
      {/* 1. The Dropdown Plugin */}
      <Dropdown setMinPrice={setMinPrice} />

      {/* 2. The Search Button */}
      <button 
        onClick={handleSearch} 
        style={{ backgroundColor: 'orange', padding: '10px', marginLeft: '10px' }}
      >
        Search
      </button>

      {/* 3. The Results List */}
      <div style={{ marginTop: '20px' }}>
        {projects.map((project) => (
          <div key={project.id} style={{ border: '1px solid #ccc', margin: '10px 0', padding: '10px' }}>
            <h3>{project.title}</h3>
            <p>Budget: ${project.budget}</p>
          </div>
        ))}
      </div>
    </div>
  );