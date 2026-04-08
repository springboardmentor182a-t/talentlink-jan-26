import React from "react";
import { BadgeCheck, CalendarDays, Eye, Star } from "lucide-react";

import { useFreelancerShell } from "../../../context/FreelancerShellContext";
import "./Profile.css";

const Profile = () => {
  const { profileData, loading, error } = useFreelancerShell();

  if (loading) {
    return <div className="freelancer-state">Loading profile...</div>;
  }

  if (error) {
    return <div className="freelancer-state error">{error}</div>;
  }

  const profile = profileData?.profile || {};
  const overview = profileData?.overview || {};
  const memberSince = profile.member_since
    ? new Intl.DateTimeFormat("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(new Date(profile.member_since))
    : "-";

  return (
    <div className="freelancer-profile-page">
      <section className="profile-hero-card">
        <div className="profile-avatar-large">{profile.initials || "FR"}</div>
        <div className="profile-hero-copy">
          <div className="profile-title-row">
            <div>
              <h2>{profile.full_name || "Freelancer"}</h2>
              <p>{profile.email || ""}</p>
            </div>
            <span className="verified-chip">
              <BadgeCheck size={16} />
              {profile.role || "Freelancer"}
            </span>
          </div>

          <div className="profile-meta-grid">
            <div>
              <span>Member Since</span>
              <strong>{memberSince}</strong>
            </div>
            <div>
              <span>Rating</span>
              <strong>{profile.rating || 0}/5</strong>
            </div>
            <div>
              <span>Profile Views</span>
              <strong>{overview.profile_views || 0}</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="profile-overview-grid">
        <article className="overview-card">
          <DollarStat label="Total Earnings" value={`$${Number(overview.total_earnings || 0).toLocaleString()}`} />
        </article>
        <article className="overview-card">
          <DollarStat label="Pending Earnings" value={`$${Number(overview.pending_earnings || 0).toLocaleString()}`} />
        </article>
        <article className="overview-card">
          <MetricStat label="Active Projects" value={overview.active_projects || 0} icon={CalendarDays} />
        </article>
        <article className="overview-card">
          <MetricStat label="Success Rate" value={`${overview.success_rate || 0}%`} icon={Star} />
        </article>
      </section>

      <section className="profile-content-grid">
        <article className="profile-panel">
          <div className="section-heading">
            <h3>Active Projects</h3>
            <p>Live contract progress from the backend</p>
          </div>
          <div className="stack-list">
            {(profileData?.active_projects || []).length === 0 && (
              <p className="empty-copy">No active projects assigned.</p>
            )}
            {(profileData?.active_projects || []).map((project) => (
              <div key={project.id} className="project-row-card">
                <div className="project-row-top">
                  <div>
                    <h4>{project.title}</h4>
                    <p>{project.client_name}</p>
                  </div>
                  <span className={`status-pill ${project.status_label.toLowerCase().replace(/\s+/g, "-")}`}>
                    {project.status_label}
                  </span>
                </div>
                <div className="progress-inline">
                  <span>Progress</span>
                  <strong>{project.progress}%</strong>
                </div>
                <div className="progress-track"><span style={{ width: `${project.progress}%` }} /></div>
              </div>
            ))}
          </div>
        </article>

        <article className="profile-panel">
          <div className="section-heading">
            <h3>Recent Proposals</h3>
            <p>Latest submitted proposals</p>
          </div>
          <div className="stack-list">
            {(profileData?.recent_proposals || []).length === 0 && (
              <p className="empty-copy">No proposals found.</p>
            )}
            {(profileData?.recent_proposals || []).map((proposal) => (
              <div key={proposal.id} className="proposal-row-card">
                <div>
                  <h4>{proposal.title}</h4>
                  <p>{proposal.client_name}</p>
                </div>
                <div className="proposal-right">
                  <strong>${Number(proposal.amount || 0).toLocaleString()}</strong>
                  <span>{proposal.status}</span>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="profile-content-grid lower-content-grid">
        <article className="profile-panel">
          <div className="section-heading">
            <h3>Payment History</h3>
            <p>Recorded payouts and invoice progress</p>
          </div>
          <div className="stack-list">
            {(profileData?.payment_history || []).length === 0 && (
              <p className="empty-copy">No payment history available.</p>
            )}
            {(profileData?.payment_history || []).map((payment) => (
              <div key={payment.id} className="payment-row-card">
                <div>
                  <h4>{payment.project_title}</h4>
                  <p>{payment.client_name}</p>
                </div>
                <div className="proposal-right">
                  <strong>${Number(payment.amount || 0).toLocaleString()}</strong>
                  <span>{payment.time_ago}</span>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="profile-panel">
          <div className="section-heading">
            <h3>Recent Activity</h3>
            <p>Signals from proposals, projects, and profile views</p>
          </div>
          <div className="stack-list">
            {(profileData?.recent_activity || []).length === 0 && (
              <p className="empty-copy">No recent activity available.</p>
            )}
            {(profileData?.recent_activity || []).map((item) => (
              <div key={item.id} className="activity-row-card">
                <div className="activity-icon"><Eye size={16} /></div>
                <div>
                  <h4>{item.description}</h4>
                  <p>{item.time_ago}</p>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
};

const DollarStat = ({ label, value }) => (
  <div>
    <span className="metric-label">{label}</span>
    <strong className="metric-value">{value}</strong>
  </div>
);

const MetricStat = ({ label, value, icon: Icon }) => (
  <div>
    <span className="metric-label icon-label"><Icon size={15} /> {label}</span>
    <strong className="metric-value">{value}</strong>
  </div>
);

export default Profile;
