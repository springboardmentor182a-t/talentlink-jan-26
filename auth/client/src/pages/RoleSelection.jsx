import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Briefcase } from 'lucide-react';
import '../styles/auth.css';

const RoleSelection = () => {
  const navigate = useNavigate();

  return (
    <div className="auth-container">
      <div className="welcome-header">
        <h1>Welcome to TalentLink</h1>
        <p>Connect with opportunities or find the perfect talent</p>
      </div>

      <div className="role-cards">
        {/* Freelancer Card */}
        <div className="role-card">
          <div className="role-icon-header">
            <User size={28} />
          </div>
          <h3>I'm a Freelancer</h3>
          <p>Find great projects and work with clients worldwide.</p>
          <ul className="design-list">
            <li>Browse thousands of projects</li>
            <li>Set your own rates</li>
            <li>Get paid securely</li>
          </ul>
          <button 
            className="btn-primary btn-full" 
            onClick={() => navigate('/signup/freelancer')}
          >
            Join as Freelancer
          </button>
        </div>

        {/* Client Card */}
        <div className="role-card">
          <div className="role-icon-header">
            <div style={{ color: 'var(--color-primary)' }}>
               <Briefcase size={28} />
            </div>
          </div>
          <h3>I'm a Client</h3>
          <p>Hire skilled professionals and grow your business.</p>
          <ul className="design-list">
            <li>Post unlimited jobs</li>
            <li>Access top talent</li>
            <li>Secure payments</li>
          </ul>
          <button 
            className="btn-primary btn-full" 
            onClick={() => navigate('/signup/client')}
          >
            Join as Client
          </button>
        </div>
      </div>

      <div style={{ marginTop: '2rem', textAlign: 'center', color: 'var(--color-tertiary)' }}>
        Already have an account?{' '}
        <a href="/login" style={{ color: 'var(--color-primary)', fontWeight: '600', textDecoration: 'none' }}>Log in</a>
      </div>
    </div>
  );
};

export default RoleSelection;