import React from 'react';

const FreelancerDashboard = () => {
  return (
    <div style={{ padding: '40px', backgroundColor: '#F8F9FA', minHeight: '100vh' }}>
      <h1 style={{ marginBottom: '5px' }}>Welcome back, John! 👋</h1>
      <p style={{ color: '#6C757D', marginBottom: '30px' }}>Ready to find your next project?</p>

      {/* Stats Cards Section */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '40px' }}>
        {[
          { label: 'Active Projects', val: '3', icon: '📦' },
          { label: 'Pending Proposals', val: '12', icon: '🎯' },
          { label: 'Total Earnings', val: '$4.5k', icon: '💰' },
          { label: 'Profile Views', val: '247', icon: '👁️' }
        ].map((stat, i) => (
          <div key={i} style={{ flex: 1, padding: '20px', backgroundColor: 'white', borderRadius: '15px', border: '1px solid #E9ECEF' }}>
            <span style={{ fontSize: '24px' }}>{stat.icon}</span>
            <h2 style={{ margin: '10px 0 0', fontSize: '28px' }}>{stat.val}</h2>
            <p style={{ margin: 0, color: '#6C757D', fontSize: '14px' }}>{stat.label}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '30px' }}>
        {/* Recommended Projects Column (Left) */}
        <div style={{ flex: 2 }}>
          <h3 style={{ marginBottom: '20px' }}>🎯 Recommended Projects</h3>
          <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '15px', border: '1px solid #E9ECEF' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <h4>Mobile App Development</h4>
              <span style={{ color: '#28A745', backgroundColor: '#E8F5E9', padding: '4px 8px', borderRadius: '5px', fontSize: '12px' }}>95% Match</span>
            </div>
            <p style={{ color: '#6C757D', fontSize: '14px' }}>TechStart Inc. • $3,000 - $6,000</p>
            <button className="btn-primary">Apply Now</button>
          </div>
        </div>

        {/* Active Contracts Column (Right) */}
        <div style={{ flex: 1 }}>
          <h3 style={{ marginBottom: '20px' }}>📋 Active Contracts</h3>
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '15px', border: '1px solid #E9ECEF' }}>
            <div style={{ marginBottom: '15px' }}>
              <p style={{ margin: 0, fontWeight: 'bold' }}>Website Redesign</p>
              <p style={{ margin: 0, fontSize: '12px', color: '#6C757D' }}>Due in 5 days</p>
            </div>
            <div style={{ height: '8px', backgroundColor: '#E9ECEF', borderRadius: '4px' }}>
              <div style={{ width: '70%', height: '100%', backgroundColor: '#FF7A1A', borderRadius: '4px' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FreelancerDashboard;

// BACKEND//
  import axios from 'axios';

// 1. Create the function to send the proposal
const handleApplyNow = async (projectId) => {
  try {
    // We send a POST request to your FastAPI backend address
    const response = await axios.post('http://127.0.0.1:8000/proposals/', {
      project_id: projectId,
      cover_letter: "I am a skilled developer interested in this project!",
      bid_amount: 500.0
    });

    if (response.status === 200 || response.status === 201) {
      alert("Success! Your proposal has been saved to the database.");
    }
  } catch (error) {
    console.error("Connection Error:", error);
    alert("Backend not reached. Make sure your Python terminal is running!");
  }
};


