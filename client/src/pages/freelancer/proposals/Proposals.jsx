import React, { useEffect, useMemo, useRef, useState } from "react";
import "./Proposals.css";
import authService from "../../../services/auth";



const Proposals = () => {
  const [proposals, setProposals] = useState([]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [newProposal, setNewProposal] = useState({
    title: "",
    description: "",
    amount: "",
    rate: "",
    timeline: "",
    client_email: "",
    project_id: "",
  });
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
  const isMountedRef = useRef(false);

  const fetchProposals = async () => {
    const apiBase = process.env.REACT_APP_API_URL || "http://localhost:8000";
    if (isMountedRef.current) {
      setIsLoading(true);
      setError("");
    }

    const timeoutController = new AbortController();
    const timeoutId = setTimeout(() => timeoutController.abort(), 10000);

    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error("Session expired. Please sign in again.");
      }
      const response = await fetch(`${apiBase}/freelancer/proposals`, {
        signal: timeoutController.signal,
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Session expired. Please sign in again.");
        }
        throw new Error("Failed to load proposals from backend.");
      }

      const data = await response.json();
      if (isMountedRef.current) {
        setProposals(Array.isArray(data?.proposals) ? data.proposals : []);
      }
    } catch (err) {
      if (isMountedRef.current) {
        if (err.name === "AbortError") {
          setError("Request timed out. Please ensure backend is running on port 8000.");
        } else {
          setError(err.message || "Unable to load proposals");
        }
        setProposals([]);
      }
    } finally {
      clearTimeout(timeoutId);
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    isMountedRef.current = true;
    fetchProposals();

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const resetForm = () => {
    setNewProposal({
      title: "",
      description: "",
      amount: "",
      rate: "",
      timeline: "",
      client_email: "",
      project_id: "",
    });
    setSubmitError("");
    setSubmitSuccess("");
  };

  const handleCreateProposal = async (e) => {
    e.preventDefault();
    setSubmitError("");
    setSubmitSuccess("");

    const token = authService.getToken();
    if (!token) {
      setSubmitError("Session expired. Please sign in again.");
      return;
    }

    try {
      const apiBase = process.env.REACT_APP_API_URL || "http://localhost:8000";
      const body = {
        title: newProposal.title,
        description: newProposal.description,
        amount: parseFloat(newProposal.amount),
        rate: parseFloat(newProposal.rate),
        timeline: newProposal.timeline,
        client_email: newProposal.client_email,
        project_id: newProposal.project_id
          ? parseInt(newProposal.project_id, 10)
          : null,
      };

      const response = await fetch(`${apiBase}/freelancer/proposals`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || "Failed to create proposal");
      }

      await fetchProposals();
      setShowModal(false);
      resetForm();
      setSubmitSuccess("Proposal created successfully.");
    } catch (err) {
      setSubmitError(err.message || "Failed to create proposal");
    }
  };

  const filteredProposals = useMemo(() => {
    if (statusFilter === "All") {
      return proposals;
    }

    return proposals.filter(
      (proposal) =>
        proposal.status?.toLowerCase() === statusFilter.toLowerCase(),
    );
  }, [proposals, statusFilter]);

  return (
    <div className="proposals-page">
      <div className="page-header">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h1>My Proposals</h1>
            <p>Track and manage all your project proposals</p>
          </div>
          <button
            className="action-btn"
            style={{ padding: "10px 16px", fontWeight: "600" }}
            onClick={() => setShowModal(true)}
          >
            + Add Proposal
          </button>
        </div>
      </div>

      <div className="proposals-filters">
        {["All", "Pending", "Accepted", "Rejected"].map((status) => (
          <button
            key={status}
            className={`filter-btn ${statusFilter === status ? "active" : ""}`}
            onClick={() => setStatusFilter(status)}
          >
            {status}
          </button>
        ))}
      </div>

      {showModal && (
        <div
          className="proposal-modal-backdrop"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: 12,
              width: "90%",
              maxWidth: 500,
              padding: 24,
              position: "relative",
            }}
          >
            <h2 style={{ marginTop: 0 }}>Add New Proposal</h2>
            {submitError && <p style={{ color: "#dc2626" }}>{submitError}</p>}
            {submitSuccess && (
              <p style={{ color: "#15803d" }}>{submitSuccess}</p>
            )}
            <form onSubmit={handleCreateProposal}>
              <div style={{ marginBottom: 10 }}>
                <label style={{ fontWeight: 600 }}>Title</label>
                <input
                  type="text"
                  value={newProposal.title}
                  onChange={(e) =>
                    setNewProposal({ ...newProposal, title: e.target.value })
                  }
                  required
                  style={{
                    width: "100%",
                    marginTop: 4,
                    padding: 8,
                    borderRadius: 6,
                    border: "1px solid #d1d5db",
                  }}
                />
              </div>
              <div style={{ marginBottom: 10 }}>
                <label style={{ fontWeight: 600 }}>Description</label>
                <textarea
                  value={newProposal.description}
                  onChange={(e) =>
                    setNewProposal({
                      ...newProposal,
                      description: e.target.value,
                    })
                  }
                  rows={3}
                  required
                  style={{
                    width: "100%",
                    marginTop: 4,
                    padding: 8,
                    borderRadius: 6,
                    border: "1px solid #d1d5db",
                  }}
                />
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "10px",
                  marginBottom: 10,
                }}
              >
                <div>
                  <label style={{ fontWeight: 600 }}>Amount</label>
                  <input
                    type="number"
                    value={newProposal.amount}
                    onChange={(e) =>
                      setNewProposal({ ...newProposal, amount: e.target.value })
                    }
                    required
                    style={{
                      width: "100%",
                      marginTop: 4,
                      padding: 8,
                      borderRadius: 6,
                      border: "1px solid #d1d5db",
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontWeight: 600 }}>Rate</label>
                  <input
                    type="number"
                    value={newProposal.rate}
                    onChange={(e) =>
                      setNewProposal({ ...newProposal, rate: e.target.value })
                    }
                    required
                    style={{
                      width: "100%",
                      marginTop: 4,
                      padding: 8,
                      borderRadius: 6,
                      border: "1px solid #d1d5db",
                    }}
                  />
                </div>
              </div>
              <div style={{ marginBottom: 10 }}>
                <label style={{ fontWeight: 600 }}>Timeline</label>
                <input
                  type="text"
                  value={newProposal.timeline}
                  onChange={(e) =>
                    setNewProposal({ ...newProposal, timeline: e.target.value })
                  }
                  required
                  style={{
                    width: "100%",
                    marginTop: 4,
                    padding: 8,
                    borderRadius: 6,
                    border: "1px solid #d1d5db",
                  }}
                />
              </div>
              <div style={{ marginBottom: 10 }}>
                <label style={{ fontWeight: 600 }}>Client Email</label>
                <input
                  type="email"
                  value={newProposal.client_email}
                  onChange={(e) =>
                    setNewProposal({
                      ...newProposal,
                      client_email: e.target.value,
                    })
                  }
                  required
                  style={{
                    width: "100%",
                    marginTop: 4,
                    padding: 8,
                    borderRadius: 6,
                    border: "1px solid #d1d5db",
                  }}
                />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontWeight: 600 }}>Project ID (optional)</label>
                <input
                  type="number"
                  value={newProposal.project_id}
                  onChange={(e) =>
                    setNewProposal({
                      ...newProposal,
                      project_id: e.target.value,
                    })
                  }
                  style={{
                    width: "100%",
                    marginTop: 4,
                    padding: 8,
                    borderRadius: 6,
                    border: "1px solid #d1d5db",
                  }}
                />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="action-btn"
                  style={{ background: "#f3f4f6", color: "#111" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="action-btn"
                  style={{
                    background: "#6c63ff",
                    color: "white",
                    borderColor: "#6c63ff",
                  }}
                >
                  Submit Proposal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="proposals-list">
        {isLoading && <p className="placeholder">Loading proposals...</p>}
        {!isLoading && error && <p className="placeholder">{error}</p>}
        {!isLoading && !error && filteredProposals.length === 0 && (
          <p className="placeholder">No proposals found.</p>
        )}
        {!isLoading && !error && filteredProposals.length > 0 && (
          <ul className="proposal-grid">
            {filteredProposals.map((proposal) => (
              <li key={proposal.id || proposal._id} className="proposal-item">
                <div className="proposal-top">
                  <h3 className="proposal-title">
                    {proposal.title || "Untitled Proposal"}
                  </h3>
                  <span
                    className={`proposal-status status-${(proposal.status || "pending").toLowerCase()}`}
                  >
                    {proposal.status || "Pending"}
                  </span>
                </div>
                <p className="proposal-meta">
                  {proposal.client_name || proposal.client || "Client"} •{" "}
                  {proposal.submittedAt || proposal.created_at || "—"}
                </p>

                <p className="proposal-summary">
                  {proposal.description ||
                    proposal.summary ||
                    "No summary available."}
                </p>

                <div className="proposal-details">
                  <span>Rate: ${proposal.rate ?? proposal.budget ?? 0}</span>
                  <span>
                    Delivery:{" "}
                    {proposal.timeline || proposal.deliveryTime || "TBD"}
                  </span>
                </div>

                <div className="proposal-actions">
                  <button className="action-btn detail-btn">
                    View Details
                  </button>
                  <button className="action-btn edit-btn">Edit Proposal</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Proposals;
