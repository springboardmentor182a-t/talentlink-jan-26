import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchFreelancerProposals } from "../../../services/freelancer";
import authService from "../../../services/auth";
import "./Proposals.css";

const initialForm = {
  title: "",
  description: "",
  amount: "",
  rate: "",
  timeline: "",
  client_email: "",
  project_id: "",
};

const Proposals = () => {
  const [proposals, setProposals] = useState([]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState(initialForm);
  const [submitError, setSubmitError] = useState("");
  const navigate = useNavigate();

  const loadProposals = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchFreelancerProposals();
      setProposals(Array.isArray(data?.proposals) ? data.proposals : []);
    } catch (err) {
      setError(err.message || "Failed to load proposals.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProposals();
  }, []);

  const filteredProposals = useMemo(() => {
    if (statusFilter === "All") {
      return proposals;
    }
    return proposals.filter(
      (proposal) => proposal.status?.toLowerCase() === statusFilter.toLowerCase(),
    );
  }, [proposals, statusFilter]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitError("");
    try {
      const token = authService.getToken();
      const apiBase = process.env.REACT_APP_API_URL || "http://localhost:8000";
      const response = await fetch(`${apiBase}/freelancer/proposals`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          amount: Number(formData.amount),
          rate: Number(formData.rate),
          project_id: formData.project_id ? Number(formData.project_id) : null,
        }),
      });

      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload.detail || "Failed to create proposal");
      }

      setShowModal(false);
      setFormData(initialForm);
      await loadProposals();
    } catch (err) {
      setSubmitError(err.message || "Failed to create proposal.");
    }
  };

  const openChat = (proposal) => {
    navigate(`/freelancer/messages?proposal=${proposal.id}`);
  };

  return (
    <div className="freelancer-section-page">
      <div className="section-hero proposals-hero">
        <div>
          <h2>My Proposals</h2>
          <p>Track live proposal records and submit new ones.</p>
        </div>
        <button className="primary-action" type="button" onClick={() => setShowModal(true)}>
          Create Proposal
        </button>
      </div>

      <div className="proposal-filter-row">
        {["All", "Under Review", "Pending", "Accepted", "Rejected"].map((status) => (
          <button
            key={status}
            type="button"
            className={`filter-chip ${statusFilter === status ? "active" : ""}`}
            onClick={() => setStatusFilter(status)}
          >
            {status}
          </button>
        ))}
      </div>

      {loading && <div className="freelancer-state">Loading proposals...</div>}
      {!loading && error && <div className="freelancer-state error">{error}</div>}
      {!loading && !error && (
        <div className="proposal-grid-list">
          {filteredProposals.length === 0 && <div className="empty-card">No proposals found.</div>}
          {filteredProposals.map((proposal) => (
            <article key={proposal.id} className="proposal-card-v2">
              <div className="proposal-card-top">
                <div>
                  <h3>{proposal.title}</h3>
                  <p>{proposal.client_name}</p>
                </div>
                <span className={`proposal-status-badge ${proposal.status.toLowerCase().replace(/\s+/g, "-")}`}>
                  {proposal.status}
                </span>
              </div>
              <p className="proposal-description">{proposal.description}</p>
              <div className="proposal-meta-row">
                <span>${Number(proposal.amount || 0).toLocaleString()}</span>
                <span>${Number(proposal.rate || 0)}/hr</span>
                <span>{proposal.timeline}</span>
                <span>{proposal.time_ago}</span>
              </div>
              <div className="proposal-card-actions">
                <button
                  type="button"
                  className="secondary-action"
                  onClick={() => openChat(proposal)}
                >
                  Message Client
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {showModal && (
        <div className="proposal-modal-backdrop">
          <div className="proposal-modal-card">
            <div className="section-heading">
              <h3>Create Proposal</h3>
              <p>This submits directly to the backend.</p>
            </div>
            {submitError && <p className="form-error">{submitError}</p>}
            <form className="proposal-form-grid" onSubmit={handleSubmit}>
              <input placeholder="Proposal title" value={formData.title} onChange={(event) => setFormData({ ...formData, title: event.target.value })} required />
              <input placeholder="Client email" type="email" value={formData.client_email} onChange={(event) => setFormData({ ...formData, client_email: event.target.value })} required />
              <textarea placeholder="Description" rows={4} value={formData.description} onChange={(event) => setFormData({ ...formData, description: event.target.value })} required />
              <div className="proposal-form-row">
                <input placeholder="Amount" type="number" value={formData.amount} onChange={(event) => setFormData({ ...formData, amount: event.target.value })} required />
                <input placeholder="Rate per hour" type="number" value={formData.rate} onChange={(event) => setFormData({ ...formData, rate: event.target.value })} required />
              </div>
              <div className="proposal-form-row">
                <input placeholder="Timeline" value={formData.timeline} onChange={(event) => setFormData({ ...formData, timeline: event.target.value })} required />
                <input placeholder="Project ID (optional)" type="number" value={formData.project_id} onChange={(event) => setFormData({ ...formData, project_id: event.target.value })} />
              </div>
              <div className="proposal-form-actions">
                <button type="button" className="secondary-action" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="primary-action">Submit Proposal</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Proposals;
