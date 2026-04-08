import React, { useEffect, useState } from "react";
import { Clock3 } from "lucide-react";

import ClientShell from "../../components/client/ClientShell";
import { fetchClientProjects, fetchClientProfile } from "../../services/client";

const ClientProjects = () => {
  const [profile, setProfile] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError("");
      try {
        const [profileData, projectsData] = await Promise.all([
          fetchClientProfile(),
          fetchClientProjects(),
        ]);
        setProfile(profileData.profile);
        setProjects(Array.isArray(projectsData?.projects) ? projectsData.projects : []);
      } catch (err) {
        setError(err.message || "Failed to load client projects.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return <div className="p-10">Loading projects...</div>;
  }

  if (error) {
    return <div className="p-10 text-red-600">{error}</div>;
  }

  return (
    <ClientShell
      profile={profile}
      title="My Projects"
      subtitle="Every project shown here is coming from your backend records."
    >
      <div className="grid grid-cols-1 gap-6">
        {projects.length === 0 && (
          <div className="rounded-[28px] border border-slate-200/70 bg-white p-8 text-slate-500 shadow-[0_24px_50px_rgba(15,23,42,0.08)]">
            No projects found for this client account.
          </div>
        )}

        {projects.map((project) => (
          <article
            key={project.id}
            className="rounded-[28px] border border-slate-200/70 bg-white p-6 shadow-[0_24px_50px_rgba(15,23,42,0.08)]"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h3 className="text-3xl font-extrabold text-slate-900">
                  {project.title}
                </h3>
                <p className="mt-3 max-w-3xl text-slate-600">
                  {project.description}
                </p>
                <p className="mt-4 text-base text-slate-500">
                  Freelancer: {project.freelancer_name}
                </p>
              </div>
              <span
                className={`rounded-full px-4 py-2 text-sm font-semibold ${
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

            <div className="mt-8 flex justify-between text-lg font-semibold text-slate-700">
              <span>Progress</span>
              <span>{project.progress}%</span>
            </div>
            <div className="mt-3 h-3 w-full rounded-full bg-slate-200">
              <div
                className="h-3 rounded-full bg-[linear-gradient(90deg,_#3b82f6,_#4f46e5)]"
                style={{ width: `${project.progress}%` }}
              />
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-4 text-slate-500">
              <span className="flex items-center gap-2">
                <Clock3 size={16} />
                Deadline: {project.days_left} days
              </span>
              <span className="text-lg font-semibold text-slate-700">
                Budget: ${Number(project.budget || 0).toLocaleString()}
              </span>
            </div>
          </article>
        ))}
      </div>
    </ClientShell>
  );
};

export default ClientProjects;
