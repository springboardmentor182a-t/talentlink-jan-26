import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { User, Mail, Lock } from 'lucide-react';
import { redirectToDashboard } from '../../utils/auth';

const GitHubIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
  </svg>
);

const SignupFreelancerForm = () => {
  const [formData, setFormData] = useState({
    fullName:        '',
    email:           '',
    password:        '',
    confirmPassword: '',
    agreeToTerms:    false,
  });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const data = await register({
        username: formData.fullName,
        email:    formData.email,
        password: formData.password,
        role:     'freelancer',
      });
      if (data && data.user) redirectToDashboard(data.user, navigate);
    } catch (err) {
      const errorDetail = err.response?.data?.detail;
      if (Array.isArray(errorDetail)) {
        setError(`Validation Error: ${errorDetail[0].msg}`);
      } else {
        setError(errorDetail || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Role is freelancer — passed to backend so new OAuth users get freelancer role
  const handleOAuth = (provider) => {
    window.location.href = `/api/auth/${provider}?role=freelancer`;
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      {error && <div className="error-message">{error}</div>}

      <div className="form-group">
        <label htmlFor="fullName">Full Name</label>
        <div className="input-wrapper">
          <User className="input-icon" size={18} />
          <input
            id="fullName"
            name="fullName"
            placeholder="Jane Doe"
            value={formData.fullName}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="email">Email Address</label>
        <div className="input-wrapper">
          <Mail className="input-icon" size={18} />
          <input
            id="email"
            type="email"
            name="email"
            placeholder="jane@example.com"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="password">Password</label>
        <div className="input-wrapper">
          <Lock className="input-icon" size={18} />
          <input
            id="password"
            type="password"
            name="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            minLength={8}
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="confirmPassword">Confirm Password</label>
        <div className="input-wrapper">
          <Lock className="input-icon" size={18} />
          <input
            id="confirmPassword"
            type="password"
            name="confirmPassword"
            minLength={8}
            placeholder="••••••••"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <label className="remember-me" htmlFor="agreeToTerms">
        <input
          id="agreeToTerms"
          type="checkbox"
          name="agreeToTerms"
          checked={formData.agreeToTerms}
          onChange={handleChange}
          required
        />
        <span style={{ fontSize: '13px' }}>I accept the terms and conditions</span>
      </label>

      <button type="submit" className="btn-primary btn-full" disabled={loading}>
        {loading ? 'Creating account...' : 'Create Freelancer Account'}
      </button>

      <div className="social-divider">
        <span>Or sign up with</span>
      </div>

      <div className="social-grid">
        <button type="button" className="btn-social" onClick={() => handleOAuth('google')}>
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" width="20" height="20" />
          <span>Google</span>
        </button>
        <button type="button" className="btn-social" onClick={() => handleOAuth('github')}>
          <GitHubIcon />
          <span>GitHub</span>
        </button>
      </div>

      <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '14px' }}>
        Already have an account?{' '}
        <Link to="/login?tab=freelancer" style={{ color: 'var(--color-primary)', fontWeight: '600', textDecoration: 'none' }}>
          Sign in as Freelancer
        </Link>
      </div>
    </form>
  );
};

export default SignupFreelancerForm;