import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import './FreelancerLayout.css';

const FreelancerLayout = ({ children }) => {
  return (
    <div className="freelancer-layout">
      <Sidebar />
      <div className="freelancer-main">
        <Header />
        <div className="freelancer-content">
          {children}
        </div>
      </div>
    </div>
  );
};

export default FreelancerLayout;
