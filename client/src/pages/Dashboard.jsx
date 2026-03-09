import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../features/hooks/useAuth';
import Button from '../components/Buttons/Button';
import '../assets/theme.css';
import { MessageSquare } from 'lucide-react';

// Demo stat cards — these are visual placeholders.
// TODO: Replace with real API calls when the jobs/projects endpoints are ready.
const DEMO_STATS = [
  { label: 'Active Projects', value: '—' },
  { label: 'Proposals Sent', value: '—' },
  { label: 'Profile Views', value: '—' },
];

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Welcome card — real user data from AuthContext / localStorage */}
      <div style={{
        background: 'var(--bg-primary)',
        borderRadius: 'var(--radius-lg)',
        padding: '32px',
        boxShadow: 'var(--shadow-md)',
        marginBottom: '24px',
      }}>
        <h1 style={{ fontFamily: 'var(--font-heading)' }}>Welcome back 👋</h1>
        <p style={{ color: 'var(--color-tertiary)', marginTop: '8px' }}>
          {user?.username || user?.email}
          {user?.role && (
            <span style={{
              marginLeft: '10px',
              background: 'var(--bg-tertiary)',
              color: 'var(--color-primary)',
              padding: '2px 10px',
              borderRadius: '999px',
              fontSize: '12px',
              fontWeight: '600',
              textTransform: 'capitalize',
            }}>
              {user.role}
            </span>
          )}
        </p>

        <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
          <Button variant="primary" onClick={() => navigate('/messages')} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <MessageSquare size={16} /> Messages
          </Button>
        </div>
      </div>

      {/* Stat cards — placeholder until real endpoints exist */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        {DEMO_STATS.map((stat) => (
          <div key={stat.label} style={{
            background: 'var(--bg-primary)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px',
            boxShadow: 'var(--shadow-sm)',
            border: '1px solid var(--border-color)',
          }}>
            <p style={{ color: 'var(--color-tertiary)', fontSize: '14px' }}>{stat.label}</p>
            <p style={{ fontSize: '28px', fontWeight: '700', marginTop: '8px', color: 'var(--color-secondary)' }}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
