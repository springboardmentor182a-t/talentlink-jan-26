import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { CheckCircle, Clock, DollarSign, MessageCircle } from 'lucide-react';

const FreelancerContracts = () => {
    // Temporarily hardcoded for you to take a screenshot!
    const user = { name: "David Kim" };
    const [activeContracts, setActiveContracts] = useState([]);
    const [completedContracts, setCompletedContracts] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    // Guard against FastAPI/Pydantic error response shapes
    const isApiError = (data) => data && typeof data === 'object' && 'detail' in data;

    useEffect(() => {
        const fetchData = async () => {
            if (!user?.name) {
                setLoading(false);
                return;
            }
            try {
                const freelancerName = encodeURIComponent(user.name);
                const [activeRes, completedRes, statsRes] = await Promise.all([
                    fetch(`${process.env.REACT_APP_BASE_URL}/api/freelancer/contracts/active?freelancer_name=${freelancerName}`),
                    fetch(`${process.env.REACT_APP_BASE_URL}/api/freelancer/contracts/completed?freelancer_name=${freelancerName}`),
                    fetch(`${process.env.REACT_APP_BASE_URL}/api/freelancer/contracts/stats?freelancer_name=${freelancerName}`)
                ]);

                let active = activeRes.ok ? await activeRes.json() : [];
                let completed = completedRes.ok ? await completedRes.json() : [];
                let statsResponse = statsRes.ok ? await statsRes.json() : null;

                setActiveContracts(Array.isArray(active) && !isApiError(active?.[0]) ? active : []);
                setCompletedContracts(Array.isArray(completed) && !isApiError(completed?.[0]) ? completed : []);
                setStats(!isApiError(statsResponse) && statsResponse && Object.keys(statsResponse).length > 0 ? statsResponse : null);
            } catch (error) {
                console.error("Error fetching freelancer contracts:", error);
                setActiveContracts([]);
                setCompletedContracts([]);
                setStats(null);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    const handleUpdateMilestone = async (contractId, milestoneId, newStatus) => {
        if (!user?.name) return;
        try {
            const freelancerName = encodeURIComponent(user.name);
            const response = await fetch(`${process.env.REACT_APP_BASE_URL}/api/freelancer/contracts/${contractId}/milestones/${milestoneId}?freelancer_name=${freelancerName}&status=${newStatus}`, {
                method: 'PUT',
            });
            if (response.ok) {
                // simple reload
                window.location.reload();
            } else {
                alert("Failed to update milestone.");
            }
        } catch (error) {
            console.error("Error updating milestone:", error);
        }
    };

    if (loading) return <div style={{ padding: '24px' }}>Loading Contracts...</div>;
    
    if (!user) return <div style={{ padding: '24px' }}>Please log in as a freelancer to view your contracts.</div>;

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
                {contract.milestones.map((m) => (
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
                                {contract.status === 'active' && m.status !== 'completed' && (
                                    <select 
                                        value={m.status}
                                        onChange={(e) => handleUpdateMilestone(contract.id, m.id, e.target.value)}
                                        style={{ fontSize: '0.75rem', padding: '2px 4px', borderRadius: '4px', border: '1px solid #CBD5E1' }}
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="in-progress">In Progress</option>
                                        <option value="completed">Completed</option>
                                    </select>
                                )}
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
                    <MessageCircle size={18} /> Message Client
                </button>
            </div>
        </div>
    );

    return (
        <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
            <header style={{ marginBottom: '32px' }}>
                <h1 style={{ margin: '0 0 8px 0', fontSize: '2rem' }}>My Contracts</h1>
                <p style={{ color: '#64748B', margin: 0 }}>Track your active contracts and milestone progress</p>
            </header>

            {/* Stats Cards */}
            {stats ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '40px' }}>
                    <div style={{ padding: '24px', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <p style={{ color: '#64748B', margin: '0 0 8px 0', fontSize: '0.875rem' }}>Active Contracts</p>
                            <h2 style={{ margin: 0, fontSize: '2rem' }}>{stats.active_contracts || 0}</h2>
                        </div>
                        <div style={{ backgroundColor: '#EFF6FF', padding: '12px', borderRadius: '12px' }}>
                            <Clock color="#2563eb" size={24} />
                        </div>
                    </div>
                    <div style={{ padding: '24px', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <p style={{ color: '#64748B', margin: '0 0 8px 0', fontSize: '0.875rem' }}>Completed</p>
                            <h2 style={{ margin: 0, fontSize: '2rem' }}>{stats.completed_contracts || 0}</h2>
                        </div>
                        <div style={{ backgroundColor: '#F0FDF4', padding: '12px', borderRadius: '12px' }}>
                            <CheckCircle color="#16a34a" size={24} />
                        </div>
                    </div>
                    <div style={{ padding: '24px', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <p style={{ color: '#64748B', margin: '0 0 8px 0', fontSize: '0.875rem' }}>Total Earnings</p>
                            <h2 style={{ margin: 0, fontSize: '2rem' }}>{stats.total_investment || '$0'}</h2>
                        </div>
                        <div style={{ backgroundColor: '#F5F3FF', padding: '12px', borderRadius: '12px' }}>
                            <DollarSign color="#7C3AED" size={24} />
                        </div>
                    </div>
                </div>
            ) : (
                <div style={{
                    padding: '24px',
                    backgroundColor: '#F8FAFC',
                    borderRadius: '12px',
                    border: '1px solid #E2E8F0',
                    textAlign: 'center',
                    color: '#64748B',
                    marginBottom: '32px'
                }}>
                    No contract statistics available yet.
                </div>
            )}

            <section>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '24px' }}>Active Contracts</h2>
                {activeContracts.length > 0 ? activeContracts.map(renderContract) : <p>No active contracts found.</p>}
            </section>

            <section style={{ marginTop: '48px' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '24px' }}>Completed Contracts</h2>
                {completedContracts.length > 0 ? completedContracts.map(renderContract) : <p>No completed contracts found.</p>}
            </section>
        </div>
    );
};

export default FreelancerContracts;
