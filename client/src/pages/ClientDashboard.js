import React, { useEffect, useState } from "react";
import { Plus } from "lucide-react"; // Import Plus icon for the button
import { fetchDashboardData } from "../services/dashboardService";
import StatsCards from "../components/Dashboard/StatsCards";
import DashboardCharts from "../components/Dashboard/DashboardCharts";
import RecentActivity from "../components/Dashboard/RecentActivity";
import Sidebar from "../layout/Sidebar";
import Navbar from "../layout/Navbar";
import PostJobModal from "../components/Dashboard/PostJobModal"; // Import the Modal

const ClientDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false); // State for Modal visibility

  // Moved loadData outside useEffect so we can call it again after posting a job
  const loadData = async () => {
    try {
      const result = await fetchDashboardData();
      setData(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading)
    return <div className="p-10 flex justify-center">Loading...</div>;
  if (!data)
    return <div className="p-10 text-red-500">Failed to load data</div>;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* 1. Sidebar */}
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 2. Navbar */}
        <Navbar profile={data.profile} />

        {/* 3. Dashboard Content */}
        <main className="flex-1 overflow-y-auto p-8">
          {/* Header with Post Job Button */}
          <div className="flex justify-between items-end mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Client Dashboard
              </h1>
              <p className="text-gray-500">
                Welcome back! Here's what's happening with your account.
              </p>
            </div>

            {/* Post Job Button */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 font-medium transition-all shadow-sm"
            >
              <Plus size={20} />
              Post a Job
            </button>
          </div>

          {/* Widgets */}
          <StatsCards stats={data.stats} />

          <DashboardCharts
            spendingData={data.spending_chart}
            timelineData={data.project_timeline}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Active Projects List */}
            <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-6">
                Active Projects
              </h3>
              {data.active_projects.length > 0 ? (
                data.active_projects.map((project) => (
                  <div key={project.id} className="mb-6 last:mb-0">
                    <div className="flex justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-800">
                          {project.title}
                        </h4>
                        <p className="text-sm text-gray-500">
                          Freelancer:{" "}
                          {project.freelancer_name || "Not Hired Yet"}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium h-fit ${
                          project.status_label === "On Track"
                            ? "bg-green-100 text-green-700"
                            : project.status_label === "Almost Done"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-orange-100 text-orange-700"
                        }`}
                      >
                        {project.status_label}
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-gray-400">
                      <span>Progress: {project.progress}%</span>
                      <span>Deadline: {project.days_left} days</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-center py-4">
                  No active projects found.
                </p>
              )}
            </div>

            {/* Recent Activity Feed */}
            <RecentActivity activities={data.recent_activity} />
          </div>
        </main>
      </div>

      {/* 4. Post Job Modal */}
      <PostJobModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          loadData(); // Refresh dashboard data after posting!
          alert("Job Posted Successfully!");
        }}
      />
    </div>
  );
};

export default ClientDashboard;
