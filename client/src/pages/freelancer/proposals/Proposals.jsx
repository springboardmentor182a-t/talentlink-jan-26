import React from 'react';
import './Proposals.css';

const Proposals = () => {
  return (
    <div className="proposals-page">
      <div className="page-header">
        <h1>My Proposals</h1>
        <p>Track and manage all your project proposals</p>
      </div>

      <div className="proposals-filters">
        <button className="filter-btn active">All</button>
        <button className="filter-btn">Pending</button>
        <button className="filter-btn">Accepted</button>
        <button className="filter-btn">Rejected</button>
      </div>

      <div className="proposals-list">
        <p className="placeholder">Your proposals will appear here.</p>
      </div>
    </div>
  );
};

export default Proposals;
