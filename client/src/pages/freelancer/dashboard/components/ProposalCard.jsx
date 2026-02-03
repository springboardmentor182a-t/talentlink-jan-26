import React from 'react';
import './ProposalCard.css';

const ProposalCard = ({ proposal }) => {
  return (
    <div className="proposal-card">
      <div className="proposal-header">
        <div className="proposal-icon">📄</div>
        <div className="proposal-info">
          <h3 className="proposal-title">{proposal.title}</h3>
          <p className="proposal-client">{proposal.client} • {proposal.postedDaysAgo} days ago</p>
        </div>
      </div>
      
      <p className="proposal-budget">${proposal.budget}</p>
      
      <div className="proposal-tags">
        {proposal.tags.map((tag, idx) => (
          <span key={idx} className="tag">{tag}</span>
        ))}
      </div>
    </div>
  );
};

export default ProposalCard;
