import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import '../styles/auth.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSubmitted(true);
    setLoading(false);
  };

  if (isSubmitted) {
    return (
      <div className="auth-container">
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <div className="role-icon-header" style={{ background: '#f0fdf4', color: '#16a34a' }}>
            <CheckCircle size={28} />
          </div>
          <h1>Check your email</h1>
          <p>We've sent a password reset link to <strong>{email}</strong></p>
          <Link to="/login" className="btn-primary btn-full" style={{ display: 'block', marginTop: '1.5rem', textDecoration: 'none' }}>
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
          <div className="form-group">
            <label>Email address</label>
            <div className="input-wrapper">
              <Mail className="input-icon" size={18} />
              <input
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