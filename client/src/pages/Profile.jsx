import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Pure role-based router — no API calls, no rendering.
// Reads role from localStorage and immediately redirects to the
// correct profile view. The actual content lives in FreelancerView
// and ClientView.
export default function Profile() {
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/login', { replace: true });
      return;
    }
    const user = JSON.parse(storedUser);
    navigate(
      user.role === 'client' ? '/profile/client' : '/profile/freelancer',
      { replace: true }
    );
  }, [navigate]);

  return null;
}