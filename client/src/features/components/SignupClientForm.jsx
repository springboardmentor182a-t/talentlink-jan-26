import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { User, Building2, Mail, Lock } from 'lucide-react';
import { redirectToDashboard } from '../../utils/auth';

const SignupClientForm = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    companyName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  });
  const [error, setError] = useState('');
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
        email: formData.email,
        password: formData.password,
        role: 'client',
      });
    
      // NEW: Redirect based on role from response
      if (data.user) {
        redirectToDashboard(data.user, navigate);
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
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
            placeholder="John Doe"
            value={formData.fullName}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="companyName">Company Name</label>
        <div className="input-wrapper">
          <Building2 className="input-icon" size={18} />
          <input
            id="companyName"
            name="companyName"
            placeholder="Acme Inc."
            value={formData.companyName}
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
            name="email"
            type="email"
            placeholder="you@company.com"
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
            name="password"
            type="password"
            minLength={8}
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
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
            placeholder="••••••••"
            value={formData.confirmPassword}
            onChange={handleChange}
            minLength={8}
            required
          />
        </div>
      </div>

      <div className="form-options">
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
      </div>

      <button type="submit" className="btn-primary btn-full" disabled={loading}>
        {loading ? 'Creating account...' : 'Create Client Account'}
      </button>

      <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '14px' }}>
        Already have an account?{' '}
        <Link to="/login?tab=client" style={{ color: 'var(--color-primary)', fontWeight: '600', textDecoration: 'none' }}>
          Sign in as Client
        </Link>
      </div>
    </form>
  );
};

export default SignupClientForm;
