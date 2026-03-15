import React from 'react';
import Sidebar from '../../layout/Sidebar';
import Navbar from '../../layout/Navbar';
import { FileCheck, CheckCircle, DollarSign, FileText } from 'lucide-react';
import './Dashboard.css';

const MyContracts = () => {
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
                                <span className="stat-value-large">0</span>
                            </div>
                            <div className="stat-icon-wrapper-large">
                                <FileCheck size={32} strokeWidth={1.5} color="#2563eb" />
                            </div>
                        </div>

                        <div className="stat-card-white">
                            <div className="stat-card-content">
                                <span className="stat-label">Completed</span>
                                <span className="stat-value-large">0</span>
                            </div>
                            <div className="stat-icon-wrapper-large">
                                <CheckCircle size={32} strokeWidth={1.5} color="#10b981" />
                            </div>
                        </div>

                        <div className="stat-card-white">
                            <div className="stat-card-content">
                                <span className="stat-label">Total Earned</span>
                                <span className="stat-value-large">$0</span>
                            </div>
                            <div className="stat-icon-wrapper-large">
                                <DollarSign size={32} strokeWidth={1.5} color="#a855f7" />
                            </div>
                        </div>
                    </div>

                    <div className="contracts-list-section mt-32">
                        <div className="section-card empty-state-card mt-32">
                            <FileText size={64} strokeWidth={1} className="empty-icon-grey" />
                            <p className="empty-text-contract">No contracts yet. Submit proposals to start working on projects!</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MyContracts;
