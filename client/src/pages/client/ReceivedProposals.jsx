import React, { useEffect, useState } from "react";
import Sidebar from "../../layout/Sidebar";
import Navbar from "../../layout/Navbar";
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
  const [profile, setProfile] = useState({ full_name: "Account User", role: "Client" });

  useEffect(() => {
    const apiBase = process.env.REACT_APP_API_URL || "http://localhost:8000";
    const controller = new AbortController();

    const fetchProposals = async () => {
      setIsLoading(true);
      setError("");

      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${apiBase}/client/received-proposals`, {
          method: "GET",
          signal: controller.signal,
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (!response.ok) {
          throw new Error("Failed to load received proposals");
        }

        const data = await response.json();
        const incoming = Array.isArray(data?.proposals) ? data.proposals : [];
        setProposals(incoming);
        if (incoming.length > 0 && incoming[0].client_name) {
          setProfile({ full_name: incoming[0].client_name, role: "Client" });
        }
        setActiveProjects(
          incoming.filter((p) => p.status === "Accepted").length,
        );
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message || "Failed to load received proposals");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProposals();

    return () => controller.abort();
  }, []);

  const total = proposals.length;
  const accepted = proposals.filter((p) => p.status === "Accepted").length;
  const underReview = proposals.filter(
    (p) => p.status === "Under Review",
  ).length;

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar profile={profile} />
        <main className="flex-1 overflow-y-auto p-8 client-proposals-page">
          <div className="page-header">
            <h1>Received Proposals</h1>
            <p>Review and manage proposals submitted by freelancers</p>
          </div>

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
                    <button className="btn-outline">Message</button>
                    <button className="btn-accept">Accept</button>
                    <button className="btn-reject">Reject</button>
                  </div>
                </div>
              ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ReceivedProposals;
