import React from 'react';
import './StatsCard.css';

const StatsCard = ({ icon, title, value }) => {
  return (
    <div className="stats-card">
      <div className="stats-icon">{icon}</div>
      <div className="stats-content">
        <p className="stats-title">{title}</p>
        <h3 className="stats-value">{value}</h3>
      </div>
    </div>
  );
};

export default StatsCard;
