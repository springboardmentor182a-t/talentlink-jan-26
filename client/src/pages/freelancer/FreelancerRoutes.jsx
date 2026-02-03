// Routes configuration for Freelancer module
// Import and use these in your App.js or main routing file

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import FreelancerLayout from '../../components/freelancer/FreelancerLayout';

// Pages
import Dashboard from './dashboard/Dashboard';
import Projects from './projects/Projects';
import Proposals from './proposals/Proposals';
import Earnings from './earnings/Earnings';
import Profile from './profile/Profile';
import Messages from './messages/Messages';

export const FreelancerRoutes = () => {
  return (
    <FreelancerLayout>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/proposals" element={<Proposals />} />
        <Route path="/earnings" element={<Earnings />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/messages" element={<Messages />} />
      </Routes>
    </FreelancerLayout>
  );
};

export default FreelancerRoutes;
