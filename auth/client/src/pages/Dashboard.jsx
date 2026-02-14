import React from 'react';
import { useAuth } from '../features/authentication/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ 
        background: 'var(--bg-primary)', 
        borderRadius: 'var(--radius-lg)',
        padding: '32px',
        boxShadow: 'var(--shadow-md)'
      }}>
        <h1>Welcome to Dashboard</h1>
        <p style={{ color: 'var(--color-tertiary)', marginTop: '8px' }}>
          Hello, {user?.username || user?.email}!
        </p>
        
        <div style={{ marginTop: '24px' }}>
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
