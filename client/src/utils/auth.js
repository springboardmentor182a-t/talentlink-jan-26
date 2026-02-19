// Helper function to redirect users to the correct dashboard based on their role
export const redirectToDashboard = (user, navigate) => {
  if (!user || !user.role) {
    navigate('/');
    return;
  }

  switch (user.role) {
    case 'freelancer':
      navigate('/freelancer/dashboard');
      break;
    case 'client':
      navigate('/client/dashboard');
      break;
    case 'both':
      navigate('/dashboard');
      break;
    default:
      navigate('/');
  }
};