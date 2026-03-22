import React from 'react';
import Sidebar from '../layout/Sidebar';
import Navbar from '../layout/Navbar';
import { Briefcase, Clock, CheckCircle, TrendingUp } from 'lucide-react';

const FreelancerDashboard = () => {
  const stats = [
    { label: "Active Proposals", value: "12", icon: <Briefcase className="text-blue-500" /> },
    { label: "Hours Worked", value: "164", icon: <Clock className="text-purple-500" /> },
    { label: "Jobs Completed", value: "8", icon: <CheckCircle className="text-green-500" /> },
    { label: "Earnings", value: "$4,250", icon: <TrendingUp className="text-orange-500" /> },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar profile={{ full_name: "Freelancer User", role: "Freelancer" }} />
        <main className="flex-1 overflow-y-auto p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Freelancer Dashboard</h1>
            <p className="text-gray-500">Welcome! Here's an overview of your projects and earnings.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 transition-transform hover:scale-[1.02]">
                <div className="p-3 bg-gray-50 rounded-xl">{stat.icon}</div>
                <div>
                  <p className="text-sm text-gray-400 font-medium">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center py-20">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Briefcase className="text-blue-600 w-10 h-10" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">No Active Projects</h2>
            <p className="text-gray-500 mb-8 max-w-sm mx-auto">You haven't been hired for any projects yet. Start by exploring open jobs and sending proposals!</p>
            <button className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all">
              Explore Jobs
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default FreelancerDashboard;
