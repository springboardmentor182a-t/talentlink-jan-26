import React, { useState, useEffect, useContext } from 'react';
import Sidebar from '../../layout/Sidebar';
import Navbar from '../../layout/Navbar';
import { FileText, CheckCircle, XCircle } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import { DollarSign, Clock, Calendar } from 'lucide-react';
import api from '../../utils/api';
import './Dashboard.css';

const MyProposals = () => {
    const { token } = useContext(AuthContext);
    const [proposals, setProposals] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [proposalsRes, jobsRes] = await Promise.all([
                    api.get('/proposals/me'),
                    api.get('/jobs/')
                ]);
                
                const proposalsData = proposalsRes.data;
                const jobsData = jobsRes.data;
                    
                    const enrichedProposals = proposalsData.map(p => {
                        const job = jobsData.find(j => j.id === p.job_id);
                        return {
                            id: p.id,
                            status: p.status.toLowerCase(),
                            title: job ? job.title : "Unknown Project",
                            description: job ? job.description : "",
                            yourBid: `$${p.bid_amount.toLocaleString()}`,
                            delivery: p.delivery_time || "Flexible",
                            clientBudget: job ? `$${job.budget.toLocaleString()}` : "$0",
                            skills: job && job.skills ? job.skills.split(',') : [],
                            submittedDate: new Date(p.created_at || Date.now()).toLocaleDateString(),
                            coverLetter: p.cover_letter
                        };
                    });
                    setProposals(enrichedProposals);
            } catch (error) {
                console.error("Error fetching data", error);
            } finally {
                setLoading(false);
            }
        };
        if (token) {
            fetchData();
        }
    }, [token]);

    const getStats = () => {
        return {
            pending: proposals.filter(p => p.status === 'pending').length,
            accepted: proposals.filter(p => p.status === 'accepted').length,
            rejected: proposals.filter(p => p.status === 'rejected').length
        };
    };
    
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

                    {loading ? (
                        <div className="loading-state" style={{ padding: '40px', textAlign: 'center' }}>
                            <div className="spinner">Fetching proposals...</div>
                        </div>
                    ) : (
                        <>
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
                        </>
                    )}
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
