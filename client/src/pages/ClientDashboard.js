import React, { useEffect, useState } from 'react';
import StatsCard from '../components/dashboard/StatsCard';
import AnalyticsChart from '../components/dashboard/AnalyticsChart';
import RecentProjects from '../components/dashboard/RecentProjects';
import { Briefcase, FileText, CheckCircle, Star, LogOut } from 'lucide-react';

const ClientDashboard = () => {
    const [stats, setStats] = useState(null);
    const [projects, setProjects] = useState([]);
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, projectsRes, chartRes] = await Promise.all([
                    fetch('http://localhost:8000/api/client/dashboard/stats'),
                    fetch('http://localhost:8000/api/client/dashboard/recent-projects'),
                    fetch('http://localhost:8000/api/client/dashboard/charts')
                ]);

                const statsData = await statsRes.json();
                const projectsData = await projectsRes.json();
                const chartDataResponse = await chartRes.json();

                setStats(statsData);
                setProjects(projectsData);
                setChartData(chartDataResponse.data);
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return <div style={{ padding: '20px' }}>Loading...</div>;
    }

    return (
        <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
            {/* Top Navigation Bar */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '40px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 600 }}>Tech Solutions Inc.</div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>Client</div>
                    </div>
                    <button style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        backgroundColor: 'transparent',
                        border: '1px solid var(--border)',
                        color: 'var(--foreground)',
                        padding: '8px 16px',
                        cursor: 'pointer',
                        borderRadius: 'var(--radius)'
                    }}>
                        <LogOut size={16} /> Logout
                    </button>
                </div>
            </div>

            <header style={{ marginBottom: '32px' }}>
                <h1 style={{ marginBottom: '8px', fontSize: '2rem' }}>Dashboard</h1>
                <p style={{ color: 'var(--muted-foreground)', margin: 0 }}>
                    Welcome back! Here's an overview of your projects and activities.
                </p>
            </header>

            {/* Stats Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '24px',
                marginBottom: '32px'
            }}>
                <StatsCard
                    title="Active Projects"
                    value={stats.active_projects}
                    icon={Briefcase}
                    color="#2563eb"
                    bgColor="#EFF6FF"
                />
                <StatsCard
                    title="Pending Proposals"
                    value={stats.pending_proposals}
                    icon={FileText}
                    color="#f97316"
                    bgColor="#FFF7ED"
                />
                <StatsCard
                    title="Active Contracts"
                    value={stats.active_contracts}
                    icon={CheckCircle}
                    color="#16a34a"
                    bgColor="#F0FDF4"
                />
                <StatsCard
                    title="Completed Projects"
                    value={stats.completed_projects}
                    icon={Star}
                    color="#9333ea"
                    bgColor="#FAF5FF"
                />
            </div>

            {/* Main Content Grid */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                <RecentProjects projects={projects} />
                <AnalyticsChart data={chartData} />
            </div>
        </div>
    );
};

export default ClientDashboard;
