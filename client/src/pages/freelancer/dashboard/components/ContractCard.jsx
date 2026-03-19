import React from 'react';
import './ContractCard.css';

const ContractCard = ({ contract }) => {
  return (
    <div className="contract-card">
      <div className="contract-icon">📁</div>
      <div className="contract-details">
        <h3 className="contract-title">{contract.title}</h3>
        <p className="contract-client">{contract.client} • {contract.postedDaysAgo} days ago</p>
        <p className="contract-budget">${contract.budget}</p>
      </div>
    </div>
  );
};

export default ContractCard;
