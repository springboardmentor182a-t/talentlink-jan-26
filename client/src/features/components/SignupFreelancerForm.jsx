import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { User, Mail, Lock } from 'lucide-react';
import { redirectToDashboard } from '../../utils/auth';

const SignupFreelancerForm = () => {
  const [formData, setFormData] = useState({
    fullName: '',
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
        role: 'freelancer',
      });
    
      // FIX 1: Check the data object directly instead of looking for data.user
     if (data && data.user) {
        redirectToDashboard(data.user, navigate);
      }
    } catch (err) {
      const errorDetail = err.response?.data?.detail;
      
      // FIX 2: Safely handle FastAPI's array of errors so React doesn't crash
      if (Array.isArray(errorDetail)) {
        setError(`Validation Error: ${errorDetail[0].msg}`);
      } else {
        setError(errorDetail || 'Registration failed. Please try again.');
      }
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
