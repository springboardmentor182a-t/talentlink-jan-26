import React, { useEffect, useState } from 'react';
import axios from 'axios';

const FreelancerDashboard = () => {
  const [data, setData] = useState(null);

  // --- 1. DEFINE THE API URL ---
  // Checks for the environment variable first. If missing, uses localhost.
  const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

  // --- 2. FETCH DATA (Using the Variable) ---
  useEffect(() => {
    console.log(`Connecting to backend at: ${API_URL}`);
    axios.get(`${API_URL}/dashboard/`)
      .then(res => setData(res.data))
      .catch(err => console.error("Connection Error:", err));
  }, []);

  // --- 3. APPLY FUNCTION (Using the Variable) ---
  const handleApplyNow = async (projectId) => {
    try {
      const response = await axios.post(`${API_URL}/proposals/`, {
        project_id: projectId,
        cover_letter: "I am interested in this project!",
        bid_amount: 500.0
      });

      if (response.status === 200 || response.status === 201) {
        alert("Success! Proposal sent to backend.");
      }
    } catch (error) {
      console.error(error);
      alert(`Error: Could not reach ${API_URL}/proposals/`);
    }
  };

  if (!data) return <div style={{ padding: '40px' }}>Connecting to {API_URL}...</div>;

  return (
    <div style={{ padding: '40px', backgroundColor: '#F8F9FA', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <h1>{data.welcome_msg}</h1>
      <p style={{ color: '#6C757D', marginBottom: '30px' }}>Ready to find your next project?</p>

      {/* Stats Cards Section */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '40px' }}>
        {Object.entries(data.stats).map(([key, val], i) => (
          <div key={i} style={{ flex: 1, padding: '20px', backgroundColor: 'white', borderRadius: '15px', border: '1px solid #E9ECEF' }}>
            <h2 style={{ margin: 0 }}>{val}</h2>
            <p style={{ margin: 0, color: '#6C757D', fontSize: '14px' }}>{key.replace('_', ' ')}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '30px' }}>
        {/* Recommended Projects List */}
        <div style={{ flex: 2 }}>
          <h3>🎯 Recommended Projects</h3>
          {data.recommended_projects.map((project) => (
            <div key={project.id} style={{ backgroundColor: 'white', padding: '25px', borderRadius: '15px', border: '1px solid #E9ECEF', marginBottom: '15px' }}>
              <h4>{project.title}</h4>
              <p style={{ color: '#6C757D' }}>{project.client} • {project.budget}</p>
              <button
                onClick={() => handleApplyNow(project.id)}
                style={{ backgroundColor: '#FF7A1A', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}
              >
                Apply Now
              </button>
            </div>
          ))}
        </div>

        {/* Active Contracts Column */}
        <div style={{ flex: 1 }}>
          <h3>📑 Active Contracts</h3>
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '15px', border: '1px solid #E9ECEF' }}>
            <p style={{ fontWeight: 'bold' }}>{data.active_contract.title}</p>
            <div style={{ height: '8px', backgroundColor: '#E9ECEF', borderRadius: '4px', marginTop: '10px' }}>
              <div style={{ width: `${data.active_contract.progress}%`, height: '100%', backgroundColor: '#FF7A1A', borderRadius: '4px' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FreelancerDashboard;