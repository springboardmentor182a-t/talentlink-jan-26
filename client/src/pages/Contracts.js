import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { CheckCircle, Clock, DollarSign, MessageCircle, MoreVertical } from 'lucide-react';

const Contracts = () => {
    const { user } = useContext(AuthContext);
    const [activeContracts, setActiveContracts] = useState([]);
    const [completedContracts, setCompletedContracts] = useState([]);
    const [proposals, setProposals] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [activeRes, completedRes, statsRes, proposalsRes] = await Promise.all([
                    fetch(`${process.env.REACT_APP_BASE_URL}/api/client/contracts/active`),
                    fetch(`${process.env.REACT_APP_BASE_URL}/api/client/contracts/completed`),
                    fetch(`${process.env.REACT_APP_BASE_URL}/api/client/contracts/stats`),
                    fetch(`${process.env.REACT_APP_BASE_URL}/api/client/proposals/3`)
                ]);

                let active = await activeRes.json();
                let completed = await completedRes.json();
                let stats = await statsRes.json();
                let proposals = await proposalsRes.json();

                // Mock data if API returns empty
                if (!active || active.length === 0) {
                    active = [
                        {
                            id: 1,
                            title: 'Mobile App Development',
                            freelancer_name: 'John Developer',
                            status: 'active',
                            contract_value: '$5,000',
                            start_date: '2024-01-15',
                            end_date: '2024-03-15',
                            milestones_total: 5,
                            milestones: [
                                { id: 1, title: 'Design & Planning', amount: '$1,000', status: 'completed' },
                                { id: 2, title: 'Frontend Development', amount: '$1,500', status: 'in-progress' },
                                { id: 3, title: 'Backend Development', amount: '$1,500', status: 'pending' },
                                { id: 4, title: 'Testing', amount: '$500', status: 'pending' },
                                { id: 5, title: 'Deployment', amount: '$500', status: 'pending' }
                            ]
                        }
                    ];
                }
                if (!completed || completed.length === 0) {
                    completed = [
                        {
                            id: 2,
                            title: 'Website Redesign',
                            freelancer_name: 'Jane Designer',
                            status: 'completed',
                            contract_value: '$3,500',
                            start_date: '2023-10-01',
                            end_date: '2023-12-31',
                            milestones_total: 3,
                            milestones: [
                                { id: 1, title: 'UI/UX Design', amount: '$1,200', status: 'completed' },
                                { id: 2, title: 'Development', amount: '$1,500', status: 'completed' },
                                { id: 3, title: 'QA & Deployment', amount: '$800', status: 'completed' }
                            ]
                        }
                    ];
                }
                if (!stats || Object.keys(stats).length === 0) {
                    stats = {
                        active_count: 1,
                        completed_count: 1,
                        total_investment: '$8,500'
                    };
                }

                setActiveContracts(active);
                setCompletedContracts(completed);
                setStats(stats);
                setProposals(proposals || []);
            } catch (error) {
                console.error("Error fetching contracts:", error);
                // Set mock data on error
                setActiveContracts([
                    {
                        id: 1,
                        title: 'Mobile App Development',
                        freelancer_name: 'John Developer',
                        status: 'active',
                        contract_value: '$5,000',
                        start_date: '2024-01-15',
                        end_date: '2024-03-15',
                        milestones_total: 5,
                        milestones: [
                            { id: 1, title: 'Design & Planning', amount: '$1,000', status: 'completed' },
                            { id: 2, title: 'Frontend Development', amount: '$1,500', status: 'in-progress' },
                            { id: 3, title: 'Backend Development', amount: '$1,500', status: 'pending' },
                            { id: 4, title: 'Testing', amount: '$500', status: 'pending' },
                            { id: 5, title: 'Deployment', amount: '$500', status: 'pending' }
                        ]
                    }
                ]);
                setCompletedContracts([
                    {
                        id: 2,
                        title: 'Website Redesign',
                        freelancer_name: 'Jane Designer',
                        status: 'completed',
                        contract_value: '$3,500',
                        start_date: '2023-10-01',
                        end_date: '2023-12-31',
                        milestones_total: 3,
                        milestones: [
                            { id: 1, title: 'UI/UX Design', amount: '$1,200', status: 'completed' },
                            { id: 2, title: 'Development', amount: '$1,500', status: 'completed' },
                            { id: 3, title: 'QA & Deployment', amount: '$800', status: 'completed' }
                        ]
                    }
                ]);
                setStats({
                    active_count: 1,
                    completed_count: 1,
                    total_investment: '$8,500'
                });
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleAcceptProposal = async (proposalId) => {
        setProcessing(true);
        try {
            const response = await fetch(`${process.env.REACT_APP_BASE_URL}/api/client/proposals/${proposalId}/accept`, {
                method: 'POST',
            });
            if (response.ok) {
                alert("Proposal accepted! A new contract has been created.");
                // Refresh data by calling fetchData again
                const [activeRes, completedRes, statsRes, proposalsRes] = await Promise.all([
                    fetch(`${process.env.REACT_APP_BASE_URL}/api/client/contracts/active`),
                    fetch(`${process.env.REACT_APP_BASE_URL}/api/client/contracts/completed`),
                    fetch(`${process.env.REACT_APP_BASE_URL}/api/client/contracts/stats`),
                    fetch(`${process.env.REACT_APP_BASE_URL}/api/client/proposals/3`)
                ]);
                setActiveContracts(await activeRes.json());
                setCompletedContracts(await completedRes.json());
                setStats(await statsRes.json());
                setProposals(await proposalsRes.json());
            } else {
                alert("Failed to accept proposal.");
            }
        } catch (error) {
            console.error("Error accepting proposal:", error);
        } finally {
            setProcessing(false);
        }
    };

    if (loading) return <div style={{ padding: '24px' }}>Loading Contracts...</div>;

    const renderContract = (contract) => (
        <div key={contract.id} style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            padding: '24px',
            marginBottom: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div>
                    <h3 style={{ margin: '0 0 4px 0', fontSize: '1.25rem' }}>{contract.title}</h3>
                    <p style={{ color: '#64748B', margin: 0 }}>Freelancer: {contract.freelancer_name}</p>
                </div>
                <span style={{
                    backgroundColor: contract.status === 'active' ? '#E0F2FE' : '#F1F5F9',
                    color: contract.status === 'active' ? '#0369A1' : '#475569',
                    padding: '4px 12px',
                    borderRadius: '999px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    textTransform: 'uppercase'
                }}>
                    {contract.status}
                </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
                <div>
                    <p style={{ color: '#94A3B8', fontSize: '0.875rem', margin: '0 0 4px 0' }}>Contract Value</p>
                    <p style={{ fontWeight: 600, margin: 0 }}>{contract.contract_value}</p>
                </div>
                <div>
                    <p style={{ color: '#94A3B8', fontSize: '0.875rem', margin: '0 0 4px 0' }}>Start Date</p>
                    <p style={{ fontWeight: 600, margin: 0 }}>{contract.start_date}</p>
                </div>
                <div>
                    <p style={{ color: '#94A3B8', fontSize: '0.875rem', margin: '0 0 4px 0' }}>End Date</p>
                    <p style={{ fontWeight: 600, margin: 0 }}>{contract.end_date || 'Ongoing'}</p>
                </div>
                <div>
                    <p style={{ color: '#94A3B8', fontSize: '0.875rem', margin: '0 0 4px 0' }}>Milestones</p>
                    <p style={{ fontWeight: 600, margin: 0 }}>{contract.milestones_total}</p>
                </div>
            </div>

            <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '20px' }}>
                <h4 style={{ margin: '0 0 16px 0', fontSize: '1rem' }}>Milestones</h4>
                {contract.milestones.map((m, idx) => (
                    <div key={m.id} style={{ marginBottom: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <span style={{ fontSize: '0.95rem' }}>{m.title}</span>
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                <span style={{ color: '#64748B', fontSize: '0.875rem' }}>{m.amount}</span>
                                <span style={{
                                    backgroundColor: m.status === 'completed' ? '#DCFCE7' : m.status === 'in-progress' ? '#FEF9C3' : '#F1F5F9',
                                    color: m.status === 'completed' ? '#166534' : m.status === 'in-progress' ? '#854D0E' : '#475569',
                                    padding: '2px 8px',
                                    borderRadius: '4px',
                                    fontSize: '0.75rem',
                                    fontWeight: 500
                                }}>
                                    {m.status}
                                </span>
                            </div>
                        </div>
                        <div style={{
                            height: '8px',
                            backgroundColor: '#F1F5F9',
                            borderRadius: '4px',
                            overflow: 'hidden'
                        }}>
                            <div style={{
                                width: m.status === 'completed' ? '100%' : m.status === 'in-progress' ? '60%' : '0%',
                                height: '100%',
                                backgroundColor: m.status === 'completed' ? '#16A34A' : '#EAB308',
                                transition: 'width 0.3s ease'
                            }} />
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                <button style={{
                    backgroundColor: 'black',
                    color: 'white',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    fontWeight: 500
                }}>
                    <MessageCircle size={18} /> Message Freelancer
                </button>
                <button style={{
                    backgroundColor: 'white',
                    color: 'black',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    cursor: 'pointer',
                    fontWeight: 500
                }}>
                    View Details
                </button>
            </div>
        </div>
    );

    return (
        <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
            <header style={{ marginBottom: '32px' }}>
                <h1 style={{ margin: '0 0 8px 0', fontSize: '2rem' }}>Contract Management</h1>
                <p style={{ color: '#64748B', margin: 0 }}>Track and manage your active and completed contracts</p>
            </header>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '40px' }}>
                <div style={{ padding: '24px', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <p style={{ color: '#64748B', margin: '0 0 8px 0', fontSize: '0.875rem' }}>Active Contracts</p>
                        <h2 style={{ margin: 0, fontSize: '2rem' }}>{stats?.active_contracts || 0}</h2>
                    </div>
                    <div style={{ backgroundColor: '#EFF6FF', padding: '12px', borderRadius: '12px' }}>
                        <Clock color="#2563eb" size={24} />
                    </div>
                </div>
                <div style={{ padding: '24px', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <p style={{ color: '#64748B', margin: '0 0 8px 0', fontSize: '0.875rem' }}>Completed</p>
                        <h2 style={{ margin: 0, fontSize: '2rem' }}>{stats?.completed_contracts || 0}</h2>
                    </div>
                    <div style={{ backgroundColor: '#F0FDF4', padding: '12px', borderRadius: '12px' }}>
                        <CheckCircle color="#16a34a" size={24} />
                    </div>
                </div>
                <div style={{ padding: '24px', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <p style={{ color: '#64748B', margin: '0 0 8px 0', fontSize: '0.875rem' }}>Total Investment</p>
                        <h2 style={{ margin: 0, fontSize: '2rem' }}>{stats?.total_investment || '$0'}</h2>
                    </div>
                    <div style={{ backgroundColor: '#F5F3FF', padding: '12px', borderRadius: '12px' }}>
                        <DollarSign color="#7C3AED" size={24} />
                    </div>
                </div>
            </div>

            <section>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '24px' }}>Active Contracts</h2>
                {activeContracts.length > 0 ? activeContracts.map(renderContract) : <p>No active contracts found.</p>}
            </section>

            {proposals.length > 0 && (
                <section style={{ marginTop: '48px' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '24px' }}>Pending Proposals (New)</h2>
                    <div style={{ display: 'grid', gap: '16px' }}>
                        {proposals.filter(p => p.status === 'pending').map(proposal => (
                            <div key={proposal.id} style={{
                                backgroundColor: '#F8FAFC',
                                borderRadius: '12px',
                                border: '1px dashed #CBD5E1',
                                padding: '20px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <div>
                                    <h4 style={{ margin: '0 0 4px 0' }}>{proposal.freelancer_name}</h4>
                                    <p style={{ margin: '0 0 8px 0', fontSize: '0.875rem', color: '#64748B' }}>Bid Amount: {proposal.amount}</p>
                                    <p style={{ margin: 0, fontSize: '0.875rem', fontStyle: 'italic' }}>"{proposal.cover_letter}"</p>
                                </div>
                                <button
                                    onClick={() => handleAcceptProposal(proposal.id)}
                                    disabled={processing}
                                    style={{
                                        backgroundColor: '#16A34A',
                                        color: 'white',
                                        padding: '8px 20px',
                                        borderRadius: '8px',
                                        border: 'none',
                                        cursor: processing ? 'not-allowed' : 'pointer',
                                        fontWeight: 600,
                                        opacity: processing ? 0.7 : 1
                                    }}
                                >
                                    {processing ? "Processing..." : "Accept & Start Contract"}
                                </button>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            <section style={{ marginTop: '48px' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '24px' }}>Completed Contracts</h2>
                {completedContracts.length > 0 ? completedContracts.map(renderContract) : <p>No completed contracts found.</p>}
            </section>
        </div>
    );
};

export default Contracts;
