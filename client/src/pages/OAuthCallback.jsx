// client/src/pages/OAuthCallback.jsx
// Handles the redirect back from Google/GitHub OAuth.
//
// The backend redirects to:
//   /auth/callback#token=<jwt>&role=<role>&username=<name>&user_id=<id>
//
// Token is in the URL fragment (after #) — fragments are never sent to the
// server or stored in browser history, making this safer than query params.

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../features/hooks/useAuth';
import { redirectToDashboard } from '../utils/auth';

const OAuthCallback = () => {
  const navigate   = useNavigate();
  const { loginWithToken } = useAuth();
  const [error, setError] = useState(null);

  useEffect(() => {
    const hash = window.location.hash.slice(1); // strip leading #
    const params = new URLSearchParams(hash);

    const token    = params.get('token');
    const role     = params.get('role');
    const username = params.get('username');
    const user_id  = params.get('user_id');

    if (!token || !role) {
      setError('OAuth sign-in failed — missing token. Please try again.');
      return;
    }

    // Store token + minimal user object — same shape AuthContext expects
    const user = {
      id:       parseInt(user_id, 10),
      username,
      role,
    };

    loginWithToken(token, user);
    redirectToDashboard(user, navigate);
  }, []);

  if (error) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', flexDirection: 'column', gap: 16,
        fontFamily: 'var(--font-text)',
      }}>
        <p style={{ color: '#dc2626', fontSize: 15 }}>{error}</p>
        <button
          className="btn-primary btn-sm"
          onClick={() => navigate('/login')}
        >
          Back to login
        </button>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100vh', flexDirection: 'column', gap: 12,
      fontFamily: 'var(--font-text)', color: 'var(--color-tertiary)',
    }}>
      <div style={{
        width: 32, height: 32, border: '3px solid var(--color-primary)',
        borderTopColor: 'transparent', borderRadius: '50%',
        animation: 'spin 0.7s linear infinite',
      }} />
      <p>Signing you in…</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default OAuthCallback;