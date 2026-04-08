import React, { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowUpRight, Clock3, DollarSign, FileText, FolderKanban } from "lucide-react";

import { fetchFreelancerDashboard } from "../../../services/freelancer";
import "./Dashboard.css";

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await fetchFreelancerDashboard();
        setData(response);
      } catch (err) {
        setError(err.message || "Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const statCards = useMemo(() => {
    const stats = data?.stats || {};
    return [
      {
        key: "earnings",
        label: "Total Earnings",
        value: `$${Number(stats.totalEarnings || 0).toLocaleString()}`,
        icon: DollarSign,
        tone: "blue",
      },
      {
        key: "projects",
        label: "Active Projects",
        value: stats.activeProjects || 0,
        icon: FolderKanban,
        tone: "pink",
      },
      {
        key: "proposals",
        label: "Proposals Sent",
        value: stats.proposalsSent || 0,
        icon: FileText,
        tone: "orange",
      },
      {
        key: "rate",
        label: "Success Rate",
        value: `${stats.successRate || 0}%`,
        icon: ArrowUpRight,
        tone: "green",
      },
    ];
  }, [data]);

  if (loading) {
    return <div className="freelancer-state">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="freelancer-state error">{error}</div>;
  }

  return (
    <div className="freelancer-dashboard-page">
      <div className="dashboard-hero">
        <div>
          <h2>Welcome back, {data?.user?.full_name || "Freelancer"}</h2>
          <p>Here is a live view of your projects, proposals, and earnings.</p>
        </div>
      </div>

      <section className="dashboard-stats-grid">
        {statCards.map((card) => (
          <article key={card.key} className={`dashboard-stat-card tone-${card.tone}`}>
            <div className="stat-icon-wrap">
              <card.icon size={22} />
            </div>
            <p>{card.label}</p>
            <h3>{card.value}</h3>
          </article>
        ))}
      </section>

      <section className="dashboard-main-grid">
        <article className="dashboard-panel wide-panel">
          <div className="panel-heading">
            <div>
              <h3>Earnings Overview</h3>
              <p>Completed payments recorded this year</p>
            </div>
          </div>
          <div className="chart-shell">
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={data?.earningsSeries || []}>
                <defs>
                  <linearGradient id="earningsFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.28} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#dbe4f0" strokeDasharray="4 4" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="earnings"
                  stroke="#4f46e5"
                  fill="url(#earningsFill)"
                  strokeWidth={3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="dashboard-panel activity-panel">
          <div className="panel-heading">
            <div>
              <h3>Recent Activity</h3>
              <p>Latest updates from your account</p>
            </div>
          </div>
          <div className="activity-list">
            {(data?.recentActivity || []).length === 0 && (
              <p className="empty-copy">No recent activity found.</p>
            )}
            {(data?.recentActivity || []).map((item) => (
              <div key={item.id} className="activity-row">
                <span className="activity-dot" />
                <div>
                  <strong>{item.description}</strong>
                  <p>{item.time_ago}</p>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="dashboard-main-grid lower-grid">
        <article className="dashboard-panel timeline-panel">
          <div className="panel-heading">
            <div>
              <h3>Proposal Timeline</h3>
              <p>Proposals created by month</p>
            </div>
          </div>
          <div className="chart-shell compact-chart">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={data?.projectTimeline || []}>
                <CartesianGrid stroke="#dbe4f0" strokeDasharray="4 4" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <Tooltip />
                <Bar dataKey="projects" radius={[12, 12, 0, 0]} fill="#7c3aed" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="dashboard-panel projects-panel">
          <div className="panel-heading">
            <div>
              <h3>Active Projects</h3>
              <p>Contracts currently in progress</p>
            </div>
          </div>
          <div className="project-stack">
            {(data?.activeProjects || []).length === 0 && (
              <p className="empty-copy">No active projects are assigned right now.</p>
            )}
            {(data?.activeProjects || []).map((project) => (
              <div key={project.id} className="active-project-card">
                <div className="project-card-top">
                  <div>
                    <h4>{project.title}</h4>
                    <p>Client: {project.client_name}</p>
                  </div>
                  <span className={`status-pill ${project.status_label.toLowerCase().replace(/\s+/g, "-")}`}>
                    {project.status_label}
                  </span>
                </div>
                <div className="progress-copy">
                  <span>Progress</span>
                  <strong>{project.progress}%</strong>
                </div>
                <div className="progress-track">
                  <span style={{ width: `${project.progress}%` }} />
                </div>
                <div className="project-footer-meta">
                  <span>
                    <Clock3 size={15} />
                    Deadline: {project.days_left ?? 0} days
                  </span>
                  <span>${Number(project.budget || 0).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
};

export default Dashboard;
