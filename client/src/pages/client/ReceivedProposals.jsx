import React, { useEffect, useState } from "react";
import ClientShell from "../../components/client/ClientShell";
import {
  fetchClientProfile,
  fetchClientReceivedProposals,
  updateClientProposalStatus,
} from "../../services/client";
import "./ReceivedProposals.css";

const statusColors = {
  "Under Review": "status-under-review",
  Accepted: "status-accepted",
  Rejected: "status-rejected",
};

const ReceivedProposals = () => {
  const [proposals, setProposals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeProjects, setActiveProjects] = useState(0);
  const [profile, setProfile] = useState(null);

  const loadProposals = async () => {
    setIsLoading(true);
    setError("");

    try {
      const [profileData, proposalData] = await Promise.all([
        fetchClientProfile(),
        fetchClientReceivedProposals(),
      ]);
      const incoming = Array.isArray(proposalData?.proposals) ? proposalData.proposals : [];
      setProfile(profileData.profile);
      setProposals(incoming);
      setActiveProjects(
        incoming.filter((proposal) => proposal.status === "Accepted").length,
      );
    } catch (err) {
      setError(err.message || "Failed to load received proposals");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProposals();
  }, []);

  const handleStatusUpdate = async (proposalId, status) => {
    try {
      await updateClientProposalStatus(proposalId, status);
      await loadProposals();
    } catch (err) {
      setError(err.message || "Failed to update proposal");
    }
  };

  const total = proposals.length;
  const accepted = proposals.filter((p) => p.status === "Accepted").length;
  const underReview = proposals.filter(
    (p) => p.status === "Under Review",
  ).length;

  return (
    <ClientShell
      profile={profile}
      title="Received Proposals"
      subtitle="Review and manage proposals submitted by freelancers."
    >
      <div className="proposal-stats">
        <div className="stat-card">
          <p>Total Proposals</p>
          <h2>{total}</h2>
        </div>
        <div className="stat-card">
          <p>Under Review</p>
          <h2>{underReview}</h2>
        </div>
        <div className="stat-card">
          <p>Accepted</p>
          <h2>{accepted}</h2>
        </div>
        <div className="stat-card">
          <p>Active Projects</p>
          <h2>{activeProjects}</h2>
        </div>
      </div>

      <div className="proposal-list">
        {isLoading && <p className="placeholder">Loading proposals...</p>}
        {!isLoading && error && <p className="placeholder">{error}</p>}
        {!isLoading && !error && proposals.length === 0 && (
          <p className="placeholder">No proposals found.</p>
        )}

        {!isLoading &&
          !error &&
          proposals.length > 0 &&
          proposals.map((proposal) => (
            <div key={proposal.id} className="proposal-card">
              <div className="proposal-top">
                <div>
                  <h3>{proposal.freelancer_name || "Freelancer"}</h3>
                  <p>Rate: ${proposal.rate}/hr</p>
                </div>
                <span
                  className={`status-badge ${statusColors[proposal.status]}`}
                >
                  {proposal.status}
                </span>
              </div>
              <div className="proposal-details-row">
                <div>
                  <strong>Budget:</strong> ${proposal.amount}
                </div>
                <div>
                  <strong>Timeline:</strong> {proposal.timeline}
                </div>
              </div>
              {proposal.description && (
                <div className="proposal-tags">
                  <span className="proposal-tag">{proposal.description}</span>
                </div>
              )}
              <div className="proposal-actions">
                <button
                  className="btn-accept"
                  onClick={() => handleStatusUpdate(proposal.id, "Accepted")}
                >
                  Accept
                </button>
                <button
                  className="btn-reject"
                  onClick={() => handleStatusUpdate(proposal.id, "Rejected")}
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
      </div>
    </ClientShell>
  );
};

export default ReceivedProposals;
