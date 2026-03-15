import React from 'react';

const RecentProposals = ({ proposals }) => {
    return (
        <div className="section-card">
            <div className="section-header">
                <h2>Recent Proposals</h2>
                <p>Your latest proposal submissions</p>
            </div>

            {proposals.length === 0 ? (
                <p className="empty-state">
                    No proposals yet. Browse projects to get started!
                </p>
            ) : (
                <div className="proposals-list">
                    {proposals.slice(0, 5).map(proposal => (
                        <div key={proposal.id} className="list-item">
                            <span className="item-title">Proposal for Job #{proposal.job_id}</span>
                            <div className="item-details">
                                <span>Bid: <strong>${proposal.bid_amount}</strong></span>
                                <span className={`status-text ${proposal.status.toLowerCase()}`}>
                                    {proposal.status}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default RecentProposals;
