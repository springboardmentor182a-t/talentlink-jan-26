import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import StatsCard from '../components/dashboard/StatsCard';
import AnalyticsChart from '../components/dashboard/AnalyticsChart';
import RecentProjects from '../components/dashboard/RecentProjects';
import { Briefcase, FileText, CheckCircle, Star, LogOut } from 'lucide-react';

const ClientDashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [projects, setProjects] = useState([]);
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);

    const handleLogout = () => {
        logout();
        // navigate('/client/login');
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, projectsRes, chartRes] = await Promise.all([
                    fetch(`${process.env.REACT_APP_BASE_URL}/api/client/dashboard/stats`),
                    fetch(`${process.env.REACT_APP_BASE_URL}/api/client/dashboard/recent-projects`),
                    fetch(`${process.env.REACT_APP_BASE_URL}/api/client/dashboard/charts`)
                ]);

                let statsData = await statsRes.json();
                let projectsData = await projectsRes.json();
                let chartDataResponse = await chartRes.json();

                // Mock data if API returns empty or error
                if (!statsData || Object.keys(statsData).length === 0) {
                    statsData = {
                        active_projects: 3,
                        active_contracts: 2,
                        proposals_received: 12,
                        total_spent: '$25,000'
                    };
                }
                if (!projectsData || projectsData.length === 0) {
                    projectsData = [
                        {
                            id: 1,
                            title: 'Mobile App Development',
                            budget: '$5,000',
                            status: 'In Progress',
                            progress: 60,
                            freelancer: 'John Dev',
                            deadline: '2024-03-15'
                        },
                        {
                            id: 2,
                            title: 'Website Redesign',
                            budget: '$3,500',
                            status: 'Completed',
                            progress: 100,
                            freelancer: 'Jane Designer',
                            deadline: '2023-12-31'
                        },
                        {
                            id: 3,
                            title: 'API Integration',
                            budget: '$2,000',
                            status: 'In Progress',
                            progress: 45,
                            freelancer: 'Bob Backend',
                            deadline: '2024-02-28'
                        }
                    ];
                }
                if (!chartDataResponse || !chartDataResponse.data || chartDataResponse.data.length === 0) {
                    chartDataResponse = {
                        data: [
                            { month: 'Jan', value: 400 },
                            { month: 'Feb', value: 600 },
                            { month: 'Mar', value: 800 },
                            { month: 'Apr', value: 1200 },
                            { month: 'May', value: 1400 },
                            { month: 'Jun', value: 1800 }
                        ]
                    };
                }

                setStats(statsData);
                setProjects(projectsData);
                setChartData(chartDataResponse.data);
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
                // Set mock data on error
                setStats({
                    active_projects: 3,
                    active_contracts: 2,
                    proposals_received: 12,
                    total_spent: '$25,000'
                });
                setProjects([
                    {
                        id: 1,
                        title: 'Mobile App Development',
                        budget: '$5,000',
                        status: 'In Progress',
                        progress: 60,
                        freelancer: 'John Dev',
                        deadline: '2024-03-15'
                    },
                    {
                        id: 2,
                        title: 'Website Redesign',
                        budget: '$3,500',
                        status: 'Completed',
                        progress: 100,
                        freelancer: 'Jane Designer',
                        deadline: '2023-12-31'
                    },
                    {
                        id: 3,
                        title: 'API Integration',
                        budget: '$2,000',
                        status: 'In Progress',
                        progress: 45,
                        freelancer: 'Bob Backend',
                        deadline: '2024-02-28'
                    }
                ]);
                setChartData([
                    { month: 'Jan', value: 400 },
                    { month: 'Feb', value: 600 },
                    { month: 'Mar', value: 800 },
                    { month: 'Apr', value: 1200 },
                    { month: 'May', value: 1400 },
                    { month: 'Jun', value: 1800 }
                ]);
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
                        <div style={{ fontWeight: 600 }}>{user?.name || "Client"}</div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>Client</div>
                    </div>
                    <button
                        onClick={handleLogout}
                        style={{
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
