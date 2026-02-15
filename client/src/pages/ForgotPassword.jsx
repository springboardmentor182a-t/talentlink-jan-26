import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { authAPI } from '../services/auth';
import '../assets/auth.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authAPI.forgotPassword(email);
      setIsSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="auth-container">
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <div className="role-icon-header" style={{ background: '#f0fdf4', color: '#16a34a', margin: '0 auto 1.5rem' }}>
            <CheckCircle size={28} />
          </div>
          <h1>Check your email</h1>
          <p style={{ color: 'var(--color-tertiary)', marginTop: '0.5rem' }}>
            If <strong>{email}</strong> is registered, a reset link has been sent.
          </p>
          <Link
            to="/login"
            className="btn-primary btn-full"
            style={{ display: 'block', marginTop: '1.5rem', textDecoration: 'none', textAlign: 'center' }}
          >
            Back to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <Link to="/login" className="back-nav">
          <ArrowLeft size={16} /> Back to login
        </Link>

        <div className="role-icon-header">
          <Mail size={24} />
        </div>

        <div className="auth-header">
          <h1>Forgot password?</h1>
          <p>Enter your email and we'll send you reset instructions.</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="email">Email address</label>
            <div className="input-wrapper">
              <Mail className="input-icon" size={18} />
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn-primary btn-full" disabled={loading}>
            {loading ? 'Sending...' : 'Send reset instructions'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
