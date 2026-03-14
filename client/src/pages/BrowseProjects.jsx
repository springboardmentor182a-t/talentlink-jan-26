import React, { useState, useEffect } from 'react';

const BrowseProjects = () => {
  // 1. Setup State for our Database Data
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // 2. Fetch from Backend on Component Load
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/projects/`);
        const data = await response.json();
        setProjects(data);
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  if (loading) {
    return <div style={{ padding: '40px', backgroundColor: '#F8F9FA', minHeight: '100vh' }}>Loading projects from database...</div>;
  }

  return (
    <div style={{ padding: '40px', backgroundColor: '#F8F9FA', minHeight: '100vh' }}>
      <h1 style={{ marginBottom: '5px' }}>Browse Projects</h1>
      <p style={{ color: '#6C757D', marginBottom: '30px' }}>Find your next opportunity</p>

      {/* Search and Filter Bar */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '40px' }}>
        <input type="text" placeholder="Search projects..." style={{ flex: 2, padding: '12px', borderRadius: '8px', border: '1px solid #E9ECEF' }} />
        <select style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #E9ECEF', color: '#6C757D' }}>
          <option>All Categories</option>
        </select>
        <select style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #E9ECEF', color: '#6C757D' }}>
          <option>Budget Range</option>
        </select>
        <button className="btn-primary" style={{ flex: 1 }}>Search</button>
      </div>

      {/* Project Listings Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
        {projects.map((project) => (
          <div key={project.id} className="card-white">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <h3 style={{ margin: 0 }}>{project.title}</h3>
              <span style={{ color: '#28A745', backgroundColor: '#E8F5E9', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>
                {project.match} Match
              </span>
            </div>
            
            {/* Safe fallback: If DB sends 'client', use it. If dummy sends 'company', use it. */}
            <p style={{ color: '#FF7A1A', fontWeight: 'bold', margin: '0 0 10px 0' }}>
              {project.company || project.client || 'Unknown Client'}
            </p>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              {/* Safe fallback: Use an empty array if project.tags doesn't exist in DB yet */}
              {(project.tags || []).map((tag, index) => (
                <span key={index} style={{ backgroundColor: '#F1F3F5', padding: '4px 10px', borderRadius: '4px', fontSize: '12px', color: '#495057' }}>
                  {tag}
                </span>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #EEE', paddingTop: '20px' }}>
              <div>
                <span style={{ fontSize: '18px', fontWeight: 'bold' }}>{project.budget}</span>
                <span style={{ fontSize: '14px', color: '#6C757D', marginLeft: '10px' }}>
                  {project.type || 'Fixed Price'}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button style={{ padding: '10px 20px', backgroundColor: 'white', border: '1px solid #E9ECEF', borderRadius: '8px', cursor: 'pointer' }}>Save</button>
                <button className="btn-primary">Apply Now</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BrowseProjects;