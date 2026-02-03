import React from 'react';
import './Earnings.css';

const Earnings = () => {
  return (
    <div className="earnings-page">
      <div className="page-header">
        <h1>Earnings & Payments</h1>
        <p>View your earnings, payment history, and withdrawal options</p>
      </div>

      <div className="earnings-cards">
        <div className="earning-card">
          <h3>Total Earned</h3>
          <p className="amount">$4,200</p>
        </div>
        <div className="earning-card">
          <h3>Available Balance</h3>
          <p className="amount">$2,150</p>
        </div>
        <div className="earning-card">
          <h3>Pending</h3>
          <p className="amount">$1,050</p>
        </div>
      </div>

      <div className="earnings-chart">
        <p className="placeholder">Detailed earnings chart will appear here.</p>
      </div>
    </div>
  );
};

export default Earnings;
