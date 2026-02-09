import React, { useEffect, useMemo, useState } from 'react';
import './Proposals.css';

const Proposals = () => {
  const [proposals, setProposals] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const apiBase = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api';
    const controller = new AbortController();

    const fetchProposals = async () => {
      setIsLoading(true);
      setError('');

      try {
        const response = await fetch(`${apiBase}/freelancer/proposals`, {
          signal: controller.signal
        });

        if (!response.ok) {
          throw new Error('Failed to load proposals');
        }

        const data = await response.json();
        setProposals(Array.isArray(data?.proposals) ? data.proposals : []);
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err.message || 'Failed to load proposals');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProposals();

    return () => controller.abort();
  }, []);

  const filteredProposals = useMemo(() => {
    if (statusFilter === 'All') {
      return proposals;
    }

    return proposals.filter(
      (proposal) => proposal.status?.toLowerCase() === statusFilter.toLowerCase()
    );
  }, [proposals, statusFilter]);

  return (
    <div className="proposals-page">
      <div className="page-header">
        <h1>My Proposals</h1>
        <p>Track and manage all your project proposals</p>
      </div>

      <div className="proposals-filters">
        {['All', 'Pending', 'Accepted', 'Rejected'].map((status) => (
          <button
            key={status}
            className={`filter-btn ${statusFilter === status ? 'active' : ''}`}
            onClick={() => setStatusFilter(status)}
          >
            {status}
          </button>
        ))}
      </div>

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
                  <h3 className="proposal-title">{proposal.title || 'Untitled Proposal'}</h3>
                  <span className={`proposal-status status-${proposal.status || 'pending'}`}>
                    {proposal.status || 'Pending'}
                  </span>
                </div>
                <p className="proposal-meta">
                  {proposal.client || 'Client'} • {proposal.submittedAt || '—'}
                </p>
                <p className="proposal-amount">${proposal.budget ?? 0}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Proposals;
