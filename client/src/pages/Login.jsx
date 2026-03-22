import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import LoginForm from '../features/components/LoginForm';
import '../assets/auth.css';

const Login = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('freelancer');

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'freelancer' || tabParam === 'client') {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab ${activeTab === 'freelancer' ? 'active' : ''}`}
            onClick={() => handleTabChange('freelancer')}
          >
            Freelancer
          </button>
          <button
            type="button"
            className={`auth-tab ${activeTab === 'client' ? 'active' : ''}`}
            onClick={() => handleTabChange('client')}
          >
            Client
          </button>
        </div>

        <div className="auth-header">
          <h1>Welcome back</h1>
          <p>Sign in to continue to your account</p>
        </div>

        <LoginForm userType={activeTab} />

        <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '14px', color: '#6b7280' }}>
          Don't have an account?{' '}
          <Link
            to={activeTab === 'client' ? '/signup/client' : '/signup/freelancer'}
            style={{ color: '#f97316', textDecoration: 'none', fontWeight: 500 }}
          >
            Sign up as {activeTab}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
