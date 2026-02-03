import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import StatsCard from './components/StatsCard';
import ProposalCard from './components/ProposalCard';
import ContractCard from './components/ContractCard';
import ActivityItem from './components/ActivityItem';
import './Dashboard.css';

const Dashboard = () => {
  const [stats] = useState({
    activeProposals: 6,
    ongoingProjects: 2,
    totalEarnings: 4200,
    profileViews: 75
  });

  const [proposals] = useState([
    {
      id: 1,
      title: 'E-Commerce Website Design',
      client: 'Client X',
      budget: 1500,
      postedDaysAgo: 2,
      tags: ['UI/UX', 'Web Design'],
      status: 'pending'
    },
    {
      id: 2,
      title: 'React App Development',
      client: 'Client X',
      budget: 1500,
      postedDaysAgo: 3,
      tags: ['UI/UX', 'Web Design'],
      status: 'pending'
    }
  ]);

  const [contracts] = useState([
    {
      id: 1,
      title: 'Market Place Mobile App',
      client: 'Client X',
      budget: 1500,
      postedDaysAgo: 2,
      status: 'active'
    },
    {
      id: 2,
      title: 'WordPress Site Optimization',
      client: 'Client X',
      budget: 1500,
      postedDaysAgo: 2,
      status: 'active'
    }
  ]);

  const [earningsData] = useState([
    { month: 1, earnings: 73 },
    { month: 2, earnings: 66 },
    { month: 3, earnings: 65 },
    { month: 4, earnings: 51 },
    { month: 5, earnings: 22 },
    { month: 6, earnings: 56 }
  ]);

  const [activities] = useState([
    {
      id: 1,
      message: 'Your Proposal for React App Development was viewed',
      timestamp: 'just now'
    },
    {
      id: 2,
      message: 'Your Proposal for React App Development was viewed',
      timestamp: '2 hours ago'
    }
  ]);

  return (
    <div className="freelancer-dashboard">
      {/* Welcome Section */}
      <div className="dashboard-welcome">
        <h1>Welcome back, Nayana! 👋</h1>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <StatsCard
          icon="📋"
          title="Active Proposals"
          value={stats.activeProposals}
        />
        <StatsCard
          icon="📁"
          title="Ongoing Projects"
          value={stats.ongoingProjects}
        />
        <StatsCard
          icon="💰"
          title="Total Earnings"
          value={`$${stats.totalEarnings}`}
        />
        <StatsCard
          icon="👁️"
          title="Profile views"
          value={stats.profileViews}
        />
      </div>

      {/* Main Content Grid */}
      <div className="dashboard-content">
        {/* Left Section */}
        <div className="left-section">
          {/* My Proposals */}
          <section className="proposals-section">
            <div className="section-header">
              <h2>My Proposals</h2>
              <a href="/freelancer/proposals" className="view-all">
                View all {'>'}
              </a>
            </div>
            <div className="proposals-list">
              {proposals.map(proposal => (
                <ProposalCard key={proposal.id} proposal={proposal} />
              ))}
            </div>
          </section>

          {/* Monthly Earnings Chart */}
          <section className="earnings-section">
            <div className="section-header">
              <h2>Monthly Earnings</h2>
              <a href="/freelancer/earnings" className="view-all">
                View all {'>'}
              </a>
            </div>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={earningsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="earnings"
                    stroke="#4CAF50"
                    dot={{ fill: '#4CAF50', r: 5 }}
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>
        </div>

        {/* Right Section */}
        <div className="right-section">
          {/* My Contracts */}
          <section className="contracts-section">
            <div className="section-header">
              <h2>My Contracts</h2>
              <a href="/freelancer/contracts" className="view-all">
                View all {'>'}
              </a>
            </div>
            <div className="contracts-list">
              {contracts.map(contract => (
                <ContractCard key={contract.id} contract={contract} />
              ))}
            </div>
          </section>

          {/* Recent Activities */}
          <section className="activities-section">
            <div className="section-header">
              <h2>Recent Activities</h2>
            </div>
            <div className="activities-list">
              {activities.map(activity => (
                <ActivityItem key={activity.id} activity={activity} />
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
