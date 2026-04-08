import React, { useEffect, useState } from "react";
import { BadgeCheck, CreditCard, Eye, FolderOpen, Star, Users } from "lucide-react";

import ClientShell from "../../components/client/ClientShell";
import { fetchClientProfile } from "../../services/client";

const ClientProfile = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await fetchClientProfile();
        setData(response);
      } catch (err) {
        setError(err.message || "Failed to load client profile.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  if (loading) {
    return <div className="p-10">Loading profile...</div>;
  }

  if (error) {
    return <div className="p-10 text-red-600">{error}</div>;
  }

  const profile = data?.profile || {};
  const overview = data?.overview || {};
  const memberSince = profile.member_since
    ? new Intl.DateTimeFormat("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(new Date(profile.member_since))
    : "-";

  return (
    <ClientShell
      profile={profile}
      title="Client Profile"
      subtitle="A live overview of your client account, projects, proposals, payments, and activity."
    >
      <section className="mb-8 rounded-[30px] border border-slate-200/70 bg-white p-8 shadow-[0_24px_50px_rgba(15,23,42,0.08)]">
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex h-24 w-24 items-center justify-center rounded-[28px] bg-[linear-gradient(135deg,_#4f46e5,_#7c3aed)] text-3xl font-extrabold text-white">
            {profile.initials || "CL"}
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-4xl font-extrabold text-slate-900">
                  {profile.full_name || "Client"}
                </h2>
                <p className="mt-2 text-lg text-slate-600">{profile.email}</p>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full bg-sky-100 px-4 py-2 text-sm font-semibold text-sky-700">
                <BadgeCheck size={16} />
                {profile.role || "Client"}
              </span>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
              <Metric label="Member Since" value={memberSince} />
              <Metric label="Proposals Received" value={overview.proposals_received || 0} />
              <Metric label="Accepted Proposals" value={overview.accepted_proposals || 0} />
            </div>
          </div>
        </div>
      </section>

      <section className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={CreditCard} label="Total Spent" value={`$${Number(overview.total_spent || 0).toLocaleString()}`} />
        <StatCard icon={FolderOpen} label="Active Projects" value={overview.active_projects || 0} />
        <StatCard icon={Users} label="Hired Freelancers" value={overview.hired_freelancers || 0} />
        <StatCard icon={Star} label="Avg Rating" value={overview.avg_rating || 0} />
      </section>

      <section className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Panel title="Recent Projects" subtitle="Latest client projects from the backend">
          {(data?.projects || []).map((project) => (
            <div key={project.id} className="rounded-[22px] border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h4 className="text-xl font-bold text-slate-900">{project.title}</h4>
                  <p className="mt-2 text-slate-500">Freelancer: {project.freelancer_name}</p>
                </div>
                <span className="rounded-full bg-blue-100 px-3 py-2 text-sm font-semibold text-blue-700">
                  {project.status}
                </span>
              </div>
              <div className="mt-5 flex justify-between text-sm font-semibold text-slate-600">
                <span>Progress</span>
                <span>{project.progress}%</span>
              </div>
              <div className="mt-2 h-3 rounded-full bg-slate-200">
                <div
                  className="h-3 rounded-full bg-[linear-gradient(90deg,_#3b82f6,_#4f46e5)]"
                  style={{ width: `${project.progress}%` }}
                />
              </div>
            </div>
          ))}
        </Panel>

        <Panel title="Received Proposals" subtitle="Most recent incoming proposals">
          {(data?.received_proposals || []).map((proposal) => (
            <div key={proposal.id} className="flex items-center justify-between gap-4 rounded-[22px] border border-slate-200 bg-slate-50 p-5">
              <div>
                <h4 className="text-lg font-bold text-slate-900">{proposal.title}</h4>
                <p className="mt-2 text-slate-500">{proposal.freelancer_name}</p>
              </div>
              <div className="text-right">
                <strong className="block text-slate-900">${Number(proposal.amount || 0).toLocaleString()}</strong>
                <span className="text-sm text-slate-500">{proposal.status}</span>
              </div>
            </div>
          ))}
        </Panel>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Panel title="Payments" subtitle="Recent project payments">
          {(data?.payments || []).map((payment) => (
            <div key={payment.id} className="flex items-center justify-between gap-4 rounded-[22px] border border-slate-200 bg-slate-50 p-5">
              <div>
                <h4 className="text-lg font-bold text-slate-900">{payment.project_title}</h4>
                <p className="mt-2 text-slate-500">{payment.time_ago}</p>
              </div>
              <strong className="text-slate-900">${Number(payment.amount || 0).toLocaleString()}</strong>
            </div>
          ))}
        </Panel>

        <Panel title="Recent Activity" subtitle="Latest account activity">
          {(data?.recent_activity || []).map((activity) => (
            <div key={activity.id} className="flex gap-4 rounded-[22px] border border-slate-200 bg-slate-50 p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
                <Eye size={16} />
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-900">{activity.description}</h4>
                <p className="mt-2 text-slate-500">{activity.time_ago}</p>
              </div>
            </div>
          ))}
        </Panel>
      </section>
    </ClientShell>
  );
};

const Metric = ({ label, value }) => (
  <div>
    <span className="text-sm text-slate-500">{label}</span>
    <strong className="mt-2 block text-2xl font-extrabold text-slate-900">{value}</strong>
  </div>
);

const StatCard = ({ icon: Icon, label, value }) => (
  <article className="rounded-[28px] border border-slate-200/70 bg-white p-6 shadow-[0_24px_50px_rgba(15,23,42,0.08)]">
    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,_#4f46e5,_#2563eb)] text-white">
      <Icon size={20} />
    </div>
    <p className="text-sm font-medium text-slate-500">{label}</p>
    <h3 className="mt-2 text-4xl font-extrabold text-slate-900">{value}</h3>
  </article>
);

const Panel = ({ title, subtitle, children }) => (
  <article className="rounded-[28px] border border-slate-200/70 bg-white p-6 shadow-[0_24px_50px_rgba(15,23,42,0.08)]">
    <h3 className="text-3xl font-extrabold text-slate-900">{title}</h3>
    <p className="mt-2 text-slate-500">{subtitle}</p>
    <div className="mt-6 space-y-4">{children}</div>
  </article>
);

export default ClientProfile;
