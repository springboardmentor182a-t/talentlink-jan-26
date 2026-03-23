import React, { useState, useEffect, useContext } from 'react';
import api from '../../utils/api';
import { AuthContext } from '../../context/AuthContext';
import Sidebar from '../../layout/Sidebar';
import Navbar from '../../layout/Navbar';
import { FileCheck, CheckCircle, DollarSign, FileText } from 'lucide-react';
import './Dashboard.css';

const MyContracts = () => {
    const { token } = useContext(AuthContext);
    const [contracts, setContracts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchContracts = async () => {
            try {
                const [proposalsRes, jobsRes] = await Promise.all([
                    api.get('/proposals/me'),
                    api.get('/jobs/')
                ]);
                
                const acceptedProposals = proposalsRes.data.filter(p => p.status?.toUpperCase() === 'ACCEPTED');
                const jobsData = jobsRes.data;

                const enrichedContracts = acceptedProposals.map(p => {
                    const job = jobsData.find(j => j.id === p.job_id);
                    return {
                        ...p,
                        job_title: job ? job.title : `Project ${p.job_id}`,
                        job_status: job ? job.status : 'OPEN'
                    };
                });
                setContracts(enrichedContracts);
            } catch (error) {
                console.error("Error fetching contracts:", error);
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchContracts();
        }
    }, [token]);

    const activeContracts = contracts.filter(c => c.job_status?.toUpperCase() !== 'COMPLETED' && c.job_status?.toUpperCase() !== 'CLOSED');
    const completedContracts = contracts.filter(c => c.job_status?.toUpperCase() === 'COMPLETED' || c.job_status?.toUpperCase() === 'CLOSED');
    const totalEarned = contracts.reduce((acc, c) => acc + c.bid_amount, 0);

    return (
        <div className="dashboard-layout">
            <Navbar />
            <div className="dashboard-container">
                <Sidebar />
                <div className="main-content scrollable">
                    <div className="contracts-header">
                        <h1 className="page-title">My Contracts</h1>
                        <p className="page-subtitle">Manage your active projects and track completed work</p>
                    </div>

                    <div className="stats-row-grid">
                        <div className="stat-card-white">
                            <div className="stat-card-content">
                                <span className="stat-label">Active Contracts</span>
                                <span className="stat-value-large">{activeContracts.length}</span>
                            </div>
                            <div className="stat-icon-wrapper-large">
                                <FileCheck size={32} strokeWidth={1.5} color="#2563eb" />
                            </div>
                        </div>

                        <div className="stat-card-white">
                            <div className="stat-card-content">
                                <span className="stat-label">Completed</span>
                                <span className="stat-value-large">{completedContracts.length}</span>
                            </div>
                            <div className="stat-icon-wrapper-large">
                                <CheckCircle size={32} strokeWidth={1.5} color="#10b981" />
                            </div>
                        </div>

                        <div className="stat-card-white">
                            <div className="stat-card-content">
                                <span className="stat-label">Total Earned</span>
                                <span className="stat-value-large">${totalEarned}</span>
                            </div>
                            <div className="stat-icon-wrapper-large">
                                <DollarSign size={32} strokeWidth={1.5} color="#a855f7" />
                            </div>
                        </div>
                    </div>

                    <div className="contracts-list-section mt-32">
                        {loading ? (
                            <div className="loading-state">Loading contracts...</div>
                        ) : contracts.length > 0 ? (
                            <div className="contracts-grid mt-24">
                                {contracts.map((contract) => (
                                    <div key={contract.id} className="section-card contract-item-card mb-16">
                                        <div className="flex-between">
                                            <h3 className="contract-title">{contract.job_title}</h3>
                                            <span className={`status-pill ${contract.job_status?.toUpperCase() === 'CLOSED' || contract.job_status?.toUpperCase() === 'COMPLETED' ? 'completed' : 'accepted'}`}>
                                                {contract.job_status?.toUpperCase() === 'CLOSED' || contract.job_status?.toUpperCase() === 'COMPLETED' ? 'COMPLETED' : 'ACTIVE'}
                                            </span>
                                        </div>
                                        <div className="contract-meta mt-12">
                                            <span>Bid Amount: ${contract.bid_amount}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="section-card empty-state-card mt-32">
                                <FileText size={64} strokeWidth={1} className="empty-icon-grey" />
                                <p className="empty-text-contract">No active contracts yet. Submit proposals and get hired!</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MyContracts;
