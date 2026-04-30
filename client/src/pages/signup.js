import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('client');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.post('/auth/register', { name, email, password, role });
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to register. Email might already exist.");
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f0f4f8', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ backgroundColor:"#1e293b", padding: '40px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', width: '100%', maxWidth: '400px' }}>
        <h2 style={{ textAlign: 'center', fontSize: '28px', fontWeight: 'bold', color: '#022c22', marginBottom: '8px' }}>Create Account</h2>
        <p style={{ textAlign: 'center', color:"#94a3b8", marginBottom: '32px' }}>Join the platform to get started.</p>
        
        {error && <div style={{ backgroundColor: '#fee2e2', color: '#ef4444', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px' }}>{error}</div>}
        
        <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>Full Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '15px' }} placeholder="John Doe" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>Email Address</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '15px' }} placeholder="you@example.com" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '15px' }} placeholder="••••••••" />
          </div>
          
          <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
            <label style={{ flex: 1, padding: '10px', border: role === 'client' ? '2px solid #10b981' : '1px solid #cbd5e1', borderRadius: '8px', textAlign: 'center', cursor: 'pointer', backgroundColor: role === 'client' ? '#ecfdf5' : 'white', fontWeight: role === 'client' ? 'bold' : 'normal' }}>
              <input type="radio" value="client" checked={role === 'client'} onChange={(e) => setRole(e.target.value)} style={{ display: 'none' }} /> Client
            </label>
            <label style={{ flex: 1, padding: '10px', border: role === 'freelancer' ? '2px solid #10b981' : '1px solid #cbd5e1', borderRadius: '8px', textAlign: 'center', cursor: 'pointer', backgroundColor: role === 'freelancer' ? '#ecfdf5' : 'white', fontWeight: role === 'freelancer' ? 'bold' : 'normal' }}>
              <input type="radio" value="freelancer" checked={role === 'freelancer'} onChange={(e) => setRole(e.target.value)} style={{ display: 'none' }} /> Freelancer
            </label>
          </div>

          <button type="submit" disabled={loading} style={{ backgroundColor: '#10b981', color: 'white', padding: '14px', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', marginTop: '10px' }}>
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>
        
        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color:"#94a3b8" }}>
          Already have an account? <Link to="/login" style={{ color: '#10b981', fontWeight: 'bold', textDecoration: 'none' }}>Log in</Link>
        </p>
      </div>
    </div>
  );
}
