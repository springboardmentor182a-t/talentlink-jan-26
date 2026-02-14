import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../features/authentication/hooks/useAuth';
import '../../styles/auth.css';

const SignupFreelancerForm = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  });
  const { register, error } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    try {
      await register({
        username: formData.fullName,
        email: formData.email,
        password: formData.password
      });
      navigate('/login?tab=freelancer');
    } catch (err) { console.error(err); }
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      <div className="form-group">
        <label>Full Name</label>
        <div className="input-wrapper">
          <span className="input-icon">👤</span>
          <input name="fullName" placeholder="Jane Doe" value={formData.fullName} onChange={handleChange} required />
        </div>
      </div>

      <div className="form-group">
        <label>Email Address</label>
        <div className="input-wrapper">
          <span className="input-icon">✉️</span>
          <input type="email" name="email" placeholder="jane@example.com" value={formData.email} onChange={handleChange} required />
        </div>
      </div>

      <div className="form-group">
        <label>Password</label>
        <div className="input-wrapper">
          <span className="input-icon">🔒</span>
          <input type="password" name="password" placeholder="••••••••" value={formData.password} onChange={handleChange} required />
        </div>
      </div>

      <div className="form-group">
        <label>Confirm Password</label>
        <div className="input-wrapper">
          <span className="input-icon">🔒</span>
          <input type="password" name="confirmPassword" placeholder="••••••••" value={formData.confirmPassword} onChange={handleChange} required />
        </div>
      </div>

      <div className="form-options">
        <label className="remember-me">
          <input type="checkbox" name="agreeToTerms" checked={formData.agreeToTerms} onChange={handleChange} required />
          <span style={{fontSize: '13px'}}>I accept the terms and conditions</span>
        </label>
      </div>

      <button type="submit" className="btn-primary btn-full">Create Freelancer Account</button>

      <div className="auth-footer" style={{textAlign: 'center', marginTop: '1rem', fontSize: '14px'}}>
        Already have an account? <Link to="/login?tab=freelancer" style={{color: 'var(--color-primary)', fontWeight: '600', textDecoration: 'none'}}>Sign in as Freelancer</Link>
      </div>
    </form>
  );
};

export default SignupFreelancerForm;