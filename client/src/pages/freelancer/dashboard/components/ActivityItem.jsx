import React from 'react';
import './ActivityItem.css';

const ActivityItem = ({ activity }) => {
  return (
    <div className="activity-item">
      <div className="activity-icon">📄</div>
      <div className="activity-content">
        <p className="activity-message">{activity.message}</p>
        <span className="activity-time">{activity.timestamp}</span>
      </div>
    </div>
  );
};

export default ActivityItem;
