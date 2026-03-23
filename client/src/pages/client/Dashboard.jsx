import React, { useState, useEffect, useContext } from 'react';
import api from '../../utils/api';
import { AuthContext } from '../../context/AuthContext';
import Sidebar from '../../layout/Sidebar';
import Navbar from '../../layout/Navbar';
import { Briefcase, FileText, CheckCircle, XCircle } from 'lucide-react';
import '../freelancer/Dashboard.css';

const ClientDashboard = () => {
    const { token, user } = useContext(AuthContext);
    const [jobs, setJobs] = useState([]);
    const [selectedJob, setSelectedJob] = useState(null);
    const [proposals, setProposals] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchJobs = async () => {
        try {
            const response = await api.get('/jobs/');
            // Filter jobs by current client (user.id)
            setJobs(response.data.filter(j => j.client_id === user.id));
        } catch (error) {
            console.error("Error fetching jobs:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchProposals = async (jobId) => {
        try {
            const response = await api.get(`/proposals/job/${jobId}`);
            setProposals(response.data);
        } catch (error) {
            console.error("Error fetching proposals:", error);
        }
    };

    useEffect(() => {
        if (token && user) {
            fetchJobs();
        }
    }, [token, user]);

    const handleSelectJob = (jobId) => {
        setSelectedJob(jobId);
        fetchProposals(jobId);
    };

    const handleUpdateStatus = async (proposalId, status) => {
        try {
            await api.patch(`/proposals/${proposalId}/status?status=${status}`);
            // Refresh proposals
            fetchProposals(selectedJob);
        } catch (error) {
            console.error("Error updating proposal status:", error);
        }
    };

    return (
        <div className="dashboard-layout">
            <Navbar />
            <div className="dashboard-container">
                <Sidebar />
                <div className="main-content scrollable">
                    <div className="dashboard-header">
                        <h1 className="page-title">Client Dashboard</h1>
                        <p className="page-subtitle">Manage your job postings and proposals</p>
                    </div>

                    <div className="dashboard-grid mt-32">
                        {/* Jobs List */}
                        <div className="section-card">
                            <div className="section-header flex-between">
                                <h2>Your Job Postings</h2>
                                <Briefcase size={20} color="#6366f1" />
                            </div>
                            <div className="jobs-list mt-24">
                                {jobs.length > 0 ? (
                                    jobs.map((job) => (
                                        <div 
                                            key={job.id} 
                                            className={`job-item-card p-16 mb-12 pointer ${selectedJob === job.id ? 'active-border' : ''}`}
                                            onClick={() => handleSelectJob(job.id)}
                                        >
                                            <h3 className="job-title-small">{job.title}</h3>
                                            <div className="job-meta flex-between mt-8">
                                                <span>Budget: ${job.budget}</span>
                                                <span className="status-badge">{job.status}</span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="no-data">No jobs posted yet.</p>
                                )}
                            </div>
                        </div>

                        {/* Proposals for selected job */}
                        <div className="section-card">
                            <div className="section-header flex-between">
                                <h2>Proposals for {selectedJob ? jobs.find(j => j.id === selectedJob)?.title : 'Selected Job'}</h2>
                                <FileText size={20} color="#10b981" />
                            </div>
                            <div className="proposals-list mt-24">
                                {!selectedJob ? (
                                    <p className="no-data">Select a job to view proposals</p>
                                ) : proposals.length > 0 ? (
                                    proposals.map((proposal) => (
                                        <div key={proposal.id} className="proposal-item-card p-16 mb-16">
                                            <div className="flex-between">
                                                <h3 className="freelancer-name-small">Freelancer ID: {proposal.freelancer_id}</h3>
                                                <span className={`status-pill ${proposal.status.toLowerCase()}`}>{proposal.status}</span>
                                            </div>
                                            <p className="proposal-cover mt-12">{proposal.cover_letter.substring(0, 100)}...</p>
                                            <div className="proposal-meta mt-12 flex-between">
                                                <span>Bid: ${proposal.bid_amount}</span>
                                                <div className="proposal-actions">
                                                    {proposal.status === 'PENDING' && (
                                                        <>
                                                            <button className="accept-btn" onClick={() => handleUpdateStatus(proposal.id, 'ACCEPTED')}>
                                                                <CheckCircle size={18} />
                                                            </button>
                                                            <button className="reject-btn ml-8" onClick={() => handleUpdateStatus(proposal.id, 'REJECTED')}>
                                                                <XCircle size={18} />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="no-data">No proposals received for this job yet.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClientDashboard;
