import React, { useEffect, useState } from "react";
import { Plus } from "lucide-react"; // Import Plus icon for the button
import { fetchClientDashboard } from "../services/client";
import StatsCards from "../components/Dashboard/StatsCards";
import DashboardCharts from "../components/Dashboard/DashboardCharts";
import RecentActivity from "../components/Dashboard/RecentActivity";
import ClientShell from "../components/client/ClientShell";
import PostJobModal from "../components/Dashboard/PostJobModal"; // Import the Modal

const ClientDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false); // State for Modal visibility

  // Moved loadData outside useEffect so we can call it again after posting a job
  const loadData = async () => {
    try {
      const result = await fetchClientDashboard();
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
    <>
      <ClientShell
        profile={data.profile}
        title="Client Dashboard"
        subtitle="Welcome back! Here's what's happening with your account."
        action={
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 font-semibold text-white shadow-sm transition-all hover:bg-blue-700"
          >
            <Plus size={20} />
            Post a Job
          </button>
        }
      >
        <StatsCards stats={data.stats} />

        <DashboardCharts
          spendingData={data.spending_chart}
          timelineData={data.project_timeline}
        />

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="rounded-[28px] border border-slate-200/70 bg-white p-6 shadow-[0_24px_50px_rgba(15,23,42,0.08)] lg:col-span-2">
            <h3 className="mb-6 text-3xl font-extrabold text-slate-900">
              Active Projects
            </h3>
            {data.active_projects.length > 0 ? (
              data.active_projects.map((project) => (
                <div key={project.id} className="mb-6 last:mb-0">
                  <div className="mb-3 flex justify-between gap-4">
                    <div>
                      <h4 className="text-xl font-bold text-slate-900">
                        {project.title}
                      </h4>
                      <p className="mt-2 text-sm text-slate-500">
                        Freelancer: {project.freelancer_name || "Not Hired Yet"}
                      </p>
                    </div>
                    <span
                      className={`h-fit rounded-full px-4 py-2 text-sm font-semibold ${
                        project.status_label === "On Track"
                          ? "bg-emerald-100 text-emerald-700"
                          : project.status_label === "Almost Done"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-orange-100 text-orange-700"
                      }`}
                    >
                      {project.status_label}
                    </span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-slate-200">
                    <div
                      className="h-3 rounded-full bg-[linear-gradient(90deg,_#3b82f6,_#4f46e5)] transition-all duration-500"
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                  <div className="mt-3 flex justify-between text-sm text-slate-500">
                    <span>Progress: {project.progress}%</span>
                    <span>Deadline: {project.days_left} days</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="py-4 text-center text-slate-400">
                No active projects found.
              </p>
            )}
          </div>

          <RecentActivity activities={data.recent_activity} />
        </div>
      </ClientShell>

      <PostJobModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          loadData(); // Refresh dashboard data after posting!
          alert("Job Posted Successfully!");
        }}
      />
    </>
  );
};

export default ClientDashboard;
