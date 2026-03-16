import React, { useState, useEffect, useContext, useCallback } from 'react';
import { AuthContext } from '../../context/AuthContext';
import Sidebar from '../../layout/Sidebar';
import Navbar from '../../layout/Navbar';
import StatsCard from '../../components/dashboard/StatsCard';
import RecentProposals from '../../components/dashboard/RecentProposals';
import NewProjects from '../../components/dashboard/NewProjects';
import './Dashboard.css';

const FreelancerDashboard = () => {
    const { token } = useContext(AuthContext);
    const [jobs, setJobs] = useState([]);
    const [proposals, setProposals] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchJobs = useCallback(async () => {
        try {
            const response = await fetch('http://localhost:8000/jobs/', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setJobs(data);
            }
        } catch (err) {
            console.error('Failed to fetch jobs', err);
        }
    }, [token]);

    const fetchMyProposals = useCallback(async () => {
        try {
            const response = await fetch('http://localhost:8000/proposals/me', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setProposals(data);
            }
        } catch (err) {
            console.error("Failed to fetch proposals", err);
        }
    }, [token]);

    const fetchDashboardData = useCallback(async () => {
        setLoading(true);
        try {
            await Promise.all([fetchJobs(), fetchMyProposals()]);
        } catch (err) {
            console.error("Dashboard data fetch failed", err);
        } finally {
            setLoading(false);
        }
    }, [fetchJobs, fetchMyProposals]);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    if (loading) return (
        <div className="dashboard-container">
            <div className="main-content-wrapper">
                <div className="loading-state">
                    <div className="spinner">Fetching your workspace...</div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="dashboard-layout">
            <Navbar />
            <div className="dashboard-container">
                <Sidebar />
                <div className="main-content">
                    <div className="dashboard-header">
                        <h1>Freelancer Dashboard</h1>
                        <p>Welcome back! Here's an overview of your freelance work.</p>
                    </div>

                    <div className="stats-grid">
                        <StatsCard
                            title="Active Contracts"
                            value="0"
                            icon="💼"
                            colorClass="icon-blue"
                        />
                        <StatsCard
                            title="Pending Proposals"
                            value={proposals.length}
                            icon="📄"
                            colorClass="icon-orange"
                        />
                        <StatsCard
                            title="Total Earnings"
                            value="$0"
                            icon="USD"
                            colorClass="icon-green"
                        />
                        <StatsCard
                            title="Completed Projects"
                            value="0"
                            icon="⭐"
                            colorClass="icon-purple"
                        />
                    </div>

                    <div className="content-grid">
                        <RecentProposals proposals={proposals} />
                        <NewProjects jobs={jobs} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FreelancerDashboard;
