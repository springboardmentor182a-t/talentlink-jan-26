import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../features/hooks/useAuth';
import '../assets/theme.css';

// Client dashboard — placeholder until client dashboard teammate merges their work.
// Freelancers are handled by FreelancerDashboard.jsx, not this file.

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  return (
    <div style={{ padding: '32px 40px', maxWidth: '100%', overflowY: 'auto', height: '100vh' }}>

      {/* Welcome card */}
      <div style={{
        background: 'var(--bg-primary)', borderRadius: 'var(--radius-lg)',
        padding: '32px', boxShadow: 'var(--shadow-md)', marginBottom: '24px',
      }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', margin: 0 }}>Welcome back 👋</h1>
        <p style={{ color: 'var(--color-tertiary)', marginTop: '8px', fontSize: '14px', margin: '8px 0 0' }}>
          {user?.username || user?.email}
          <span style={{
            marginLeft: '10px', background: 'var(--bg-tertiary)',
            color: 'var(--color-primary)', padding: '2px 10px',
            borderRadius: '999px', fontSize: '12px',
            fontWeight: 600, textTransform: 'capitalize',
          }}>
            {user?.role}
          </span>
        </p>
        <div style={{ marginTop: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate('/contracts')}
            style={{
              background: '#f97316', color: '#fff', border: 'none',
              padding: '10px 18px', borderRadius: 'var(--radius-md)',
              fontWeight: 600, fontSize: '14px', cursor: 'pointer',
              fontFamily: 'var(--font-text)',
            }}
          >
            View Contracts
          </button>
          <button
            onClick={() => navigate('/messages')}
            style={{
              background: 'var(--bg-tertiary)', color: 'var(--color-secondary)',
              border: '1px solid var(--border-color)', padding: '10px 18px',
              borderRadius: 'var(--radius-md)', fontWeight: 600,
              fontSize: '14px', cursor: 'pointer', fontFamily: 'var(--font-text)',
            }}
          >
            Messages
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        {[
          { label: 'Active Projects', value: '—' },
          { label: 'Open Contracts',  value: '—' },
          { label: 'Total Spent',     value: '—' },
        ].map(stat => (
          <div key={stat.label} style={{
            background: 'var(--bg-primary)', borderRadius: 'var(--radius-lg)',
            padding: '24px', boxShadow: 'var(--shadow-sm)',
            border: '1px solid var(--border-color)',
          }}>
            <p style={{ color: 'var(--color-tertiary)', fontSize: '13px', margin: 0 }}>{stat.label}</p>
            <p style={{ fontSize: '28px', fontWeight: 700, margin: '8px 0 0', color: 'var(--color-secondary)' }}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

    </div>
  );
};

export default Dashboard;