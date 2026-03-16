import React from 'react';
import Sidebar from '../../layout/Sidebar';
import Navbar from '../../layout/Navbar';
import { FileText, CheckCircle, XCircle } from 'lucide-react';
import { useProposals } from '../../context/ProposalContext';
import { DollarSign, Clock, Calendar } from 'lucide-react';
import './Dashboard.css';

const MyProposals = () => {
    const { proposals, getStats } = useProposals();
    const stats = getStats();

    return (
        <div className="dashboard-layout">
            <Navbar />
            <div className="dashboard-container">
                <Sidebar />
                <div className="main-content scrollable">
                    <div className="proposals-header">
                        <h1 className="page-title">Proposal Tracking</h1>
                        <p className="page-subtitle">Monitor the status of all your submitted proposals</p>
                    </div>

                    <div className="stats-row-grid">
                        <div className="stat-card-white">
                            <div className="stat-card-content">
                                <span className="stat-label">Pending</span>
                                <span className="stat-value-large">{stats.pending}</span>
                            </div>
                            <div className="stat-icon-wrapper orange">
                                <FileText size={24} color="#f97316" />
                            </div>
                        </div>

                        <div className="stat-card-white">
                            <div className="stat-card-content">
                                <span className="stat-label">Accepted</span>
                                <span className="stat-value-large">{stats.accepted}</span>
                            </div>
                            <div className="stat-icon-wrapper green">
                                <CheckCircle size={24} color="#10b981" />
                            </div>
                        </div>

                        <div className="stat-card-white">
                            <div className="stat-card-content">
                                <span className="stat-label">Rejected</span>
                                <span className="stat-value-large">{stats.rejected}</span>
                            </div>
                            <div className="stat-icon-wrapper red">
                                <XCircle size={24} color="#ef4444" />
                            </div>
                        </div>
                    </div>

                    <div className="proposals-list-section">
                        {proposals.length === 0 ? (
                            <div className="section-card empty-state-card">
                                <FileText size={48} className="empty-icon" />
                                <p className="empty-text">No proposals yet. Browse projects and submit your first proposal!</p>
                            </div>
                        ) : (
                            <>
                                <h2 className="section-title-medium">Pending Proposals ({proposals.length})</h2>
                                <div className="proposals-cards-container">
                                    {proposals.map((proposal) => (
                                        <ProposalCard key={proposal.id} proposal={proposal} />
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const ProposalCard = ({ proposal }) => (
    <div className="section-card proposal-item-card">
        <div className="proposal-item-header">
            <div className="proposal-title-info">
                <h3 className="proposal-item-title">{proposal.title}</h3>
                <span className={`status-badge-mini ${proposal.status}`}>{proposal.status}</span>
            </div>
            <p className="proposal-item-desc">{proposal.description}</p>
        </div>

        <div className="skills-row-mini mb-20">
            {proposal.skills.map((skill, i) => (
                <span key={i} className="skill-pill-blue">{skill}</span>
            ))}
        </div>

        <div className="proposal-metrics-grid-row">
            <div className="metric-col">
                <span className="metric-mini-label">Your Bid</span>
                <div className="metric-mini-value">
                    <DollarSign size={14} />
                    <span>{proposal.yourBid}</span>
                </div>
            </div>
            <div className="metric-col">
                <span className="metric-mini-label">Delivery</span>
                <div className="metric-mini-value">
                    <Clock size={14} />
                    <span>{proposal.delivery}</span>
                </div>
            </div>
            <div className="metric-col">
                <span className="metric-mini-label">Submitted</span>
                <div className="metric-mini-value">
                    <Calendar size={14} />
                    <span>{proposal.submittedDate}</span>
                </div>
            </div>
            <div className="metric-col">
                <span className="metric-mini-label">Client Budget</span>
                <div className="metric-mini-value">
                    <span>{proposal.clientBudget}</span>
                </div>
            </div>
        </div>

        <div className="proposal-cover-letter-preview">
            <h4 className="preview-label">Your Cover Letter</h4>
            <p className="preview-text">{proposal.coverLetter}</p>
        </div>
    </div>
);

export default MyProposals;
