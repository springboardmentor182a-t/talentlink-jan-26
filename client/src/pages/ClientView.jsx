import React, { useState, useEffect } from 'react';
import { Bell, UserCircle, Briefcase, Users, DollarSign, CheckCircle, Plus } from 'lucide-react';
import { getClientDashboardData } from '../services/api';

const StatCard = ({ icon: Icon, value, label }) => (
  <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm flex flex-col justify-center">
    <div className="w-10 h-10 bg-gray-50 rounded-md flex items-center justify-center mb-4">
      <Icon className="text-gray-500 w-5 h-5" />
    </div>
    <h3 className="text-2xl font-semibold text-gray-900">{value}</h3>
    <p className="text-sm text-gray-500">{label}</p>
  </div>
);

const ProjectCard = ({ title, postedTime, proposals, budget, duration, status }) => (
  <div className="bg-white p-5 rounded-lg border border-gray-200 mb-4 flex flex-col md:flex-row justify-between md:items-center">
    <div>
      <h4 className="font-semibold text-gray-900">{title}</h4>
      <p className="text-xs text-gray-500 mb-3">Posted {postedTime}</p>
      <div className="flex flex-wrap gap-4 text-xs text-gray-600">
        <span className="flex items-center gap-1"><Users className="w-4 h-4 text-orange-500" /> {proposals} Proposals</span>
        <span className="flex items-center gap-1"><DollarSign className="w-4 h-4 text-yellow-500" /> {budget}</span>
        <span className="flex items-center gap-1"><Briefcase className="w-4 h-4 text-gray-400" /> {duration}</span>
      </div>
    </div>
    <span className="mt-3 md:mt-0 px-3 py-1 bg-orange-50 text-orange-600 text-xs font-medium rounded-full border border-orange-100 self-start md:self-auto">
      {status}
    </span>
  </div>
);

const ActivityItem = ({ icon: Icon, text, time, iconColor }) => (
  <div className="flex items-start gap-4 p-4 border-b border-gray-100 last:border-0">
     <div className={`mt-1 ${iconColor}`}><Icon className="w-4 h-4" /></div>
     <div>
       <p className="text-sm text-gray-800">{text}</p>
       <p className="text-xs text-gray-500 mt-1">{time}</p>
     </div>
  </div>
);

const ClientView = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Hardcoded for testing. In reality, get this from your AuthContext.
  const testUserId = 1; 

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const data = await getClientDashboardData(testUserId);
        setDashboardData(data);
      } catch (err) {
        console.error("Dashboard Fetch Error:", err);
        setError("Failed to load dashboard data. Ensure the backend is running.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) return <div className="p-8 text-gray-500">Loading dashboard data from server...</div>;
  if (error) return <div className="p-8 text-red-500 bg-red-50 rounded-md border border-red-200">{error}</div>;
  if (!dashboardData) return null;

  const { stats, active_projects, recent_activity } = dashboardData;

  return (
    <div className="p-8 w-full bg-gray-50 min-h-screen font-sans">
      
      {/* Top Header */}
      <div className="flex justify-between items-center mb-8 border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500">Home / Dashboard</p>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 text-gray-400 hover:text-gray-600"><Bell className="w-5 h-5" /></button>
          <button className="p-2 text-gray-400 hover:text-gray-600"><UserCircle className="w-6 h-6" /></button>
        </div>
      </div>

      {/* Welcome Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900">Welcome back, Sarah! 👋</h2>
        <p className="text-sm text-gray-500">Here's what's happening with your projects today</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard icon={Briefcase} value={stats.active_projects} label="Active Projects" />
        <StatCard icon={Users} value={stats.pending_proposals} label="Pending Proposals" />
        <StatCard icon={DollarSign} value={`$${stats.total_spent.toLocaleString()}`} label="Total Spent" />
        <StatCard icon={CheckCircle} value={stats.completed_projects} label="Completed Projects" />
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span> Quick Actions
        </h3>
        <div className="flex flex-wrap gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-md hover:bg-orange-600 transition-colors">
            <Plus className="w-4 h-4" /> Post New Project
          </button>
          <button className="px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded-md border border-gray-200 hover:bg-gray-50">View All Proposals</button>
          <button className="px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded-md border border-gray-200 hover:bg-gray-50">Active Contracts</button>
          <button className="px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded-md border border-gray-200 hover:bg-gray-50">Messages</button>
        </div>
      </div>

      {/* Active Projects List */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
           <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Active Projects
        </h3>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-2">
          {active_projects.length > 0 ? (
            active_projects.map((project) => (
              <ProjectCard 
                key={project.id}
                title={project.title} 
                postedTime={project.posted_time} 
                proposals={project.proposals_count} 
                budget={project.budget} 
                duration={project.duration} 
                status={project.status} 
              />
            ))
          ) : (
            <p className="p-4 text-sm text-gray-500">No active projects found.</p>
          )}
        </div>
      </div>

      {/* Recent Activity List */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
           <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></span> Recent Activity
        </h3>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100">
          {recent_activity.map((activity) => (
            <ActivityItem 
              key={activity.id}
              icon={activity.type === 'proposal' ? UserCircle : CheckCircle} 
              text={activity.text} 
              time={activity.time} 
              iconColor={activity.type === 'proposal' ? "text-red-400" : "text-green-500"} 
            />
          ))}
        </div>
      </div>

    </div>
  );
};

export default ClientView;