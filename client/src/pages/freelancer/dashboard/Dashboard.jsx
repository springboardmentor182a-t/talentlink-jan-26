import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import StatsCard from './components/StatsCard';
import ProposalCard from './components/ProposalCard';
import ContractCard from './components/ContractCard';
import ActivityItem from './components/ActivityItem';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState({
    activeProposals: 0,
    ongoingProjects: 0,
    totalEarnings: 0,
    profileViews: 0
  });
  const [proposals, setProposals] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [earningsData, setEarningsData] = useState([]);
  const [activities, setActivities] = useState([]);
  const [displayName, setDisplayName] = useState('Freelancer');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const apiBase = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api';
    const controller = new AbortController();

    const fetchDashboard = async () => {
      setIsLoading(true);
      setError('');

      try {
        const response = await fetch(`${apiBase}/freelancer/dashboard`, {
          signal: controller.signal
        });

        if (!response.ok) {
          throw new Error('Failed to load dashboard data');
        }

        const data = await response.json();

        setStats({
          activeProposals: data?.stats?.activeProposals ?? 0,
          ongoingProjects: data?.stats?.ongoingProjects ?? 0,
          totalEarnings: data?.stats?.totalEarnings ?? 0,
          profileViews: data?.stats?.profileViews ?? 0
        });
        setProposals(Array.isArray(data?.proposals) ? data.proposals : []);
        setContracts(Array.isArray(data?.contracts) ? data.contracts : []);
        setEarningsData(Array.isArray(data?.earningsSeries) ? data.earningsSeries : []);
        setActivities(Array.isArray(data?.activities) ? data.activities : []);

        const name = data?.user?.name || data?.user?.firstName;
        if (name) {
          setDisplayName(name);
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err.message || 'Failed to load dashboard data');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();

    return () => controller.abort();
  }, []);

  return (
    <div className="freelancer-dashboard">
      {/* Welcome Section */}
      <div className="dashboard-welcome">
        <h1>Welcome back, {displayName}! 👋</h1>
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
              {isLoading && <p className="placeholder">Loading proposals...</p>}
              {!isLoading && error && <p className="placeholder">{error}</p>}
              {!isLoading && !error && proposals.length === 0 && (
                <p className="placeholder">No proposals found.</p>
              )}
              {!isLoading && !error && proposals.map(proposal => (
                <ProposalCard key={proposal.id || proposal._id} proposal={proposal} />
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
              {isLoading && <p className="placeholder">Loading earnings...</p>}
              {!isLoading && error && <p className="placeholder">{error}</p>}
              {!isLoading && !error && earningsData.length === 0 && (
                <p className="placeholder">No earnings data available.</p>
              )}
              {!isLoading && !error && earningsData.length > 0 && (
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
              )}
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
              {isLoading && <p className="placeholder">Loading contracts...</p>}
              {!isLoading && error && <p className="placeholder">{error}</p>}
              {!isLoading && !error && contracts.length === 0 && (
                <p className="placeholder">No contracts found.</p>
              )}
              {!isLoading && !error && contracts.map(contract => (
                <ContractCard key={contract.id || contract._id} contract={contract} />
              ))}
            </div>
          </section>

          {/* Recent Activities */}
          <section className="activities-section">
            <div className="section-header">
              <h2>Recent Activities</h2>
            </div>
            <div className="activities-list">
              {isLoading && <p className="placeholder">Loading activities...</p>}
              {!isLoading && error && <p className="placeholder">{error}</p>}
              {!isLoading && !error && activities.length === 0 && (
                <p className="placeholder">No recent activity.</p>
              )}
              {!isLoading && !error && activities.map(activity => (
                <ActivityItem key={activity.id || activity._id} activity={activity} />
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
