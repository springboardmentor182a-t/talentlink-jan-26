import { useNavigate, useLocation } from 'react-router-dom';

const navItems = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
        <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
      </svg>
    ),
  },
  {
    label: 'Projects',
    path: '/projects',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
      </svg>
    ),
  },
  {
    label: 'Contracts',
    path: '/contracts',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
      </svg>
    ),
  },
  {
    label: 'Messages',
    path: '/messages',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
  },
  {
    label: 'Profile',
    path: '/profile',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div style={styles.sidebar}>
      {/* Logo */}
      <div style={styles.logo} onClick={() => navigate('/dashboard')}>
        <span style={styles.logoText}>TalentLink</span>
      </div>

      {/* Nav items */}
      <nav style={styles.nav}>
        {navItems.map(item => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              style={{
                ...styles.navItem,
                ...(isActive ? styles.navItemActive : {}),
              }}
              title={item.label}
            >
              <span style={{
                ...styles.navIcon,
                color: isActive ? '#f97316' : 'rgba(255,255,255,0.7)',
              }}>
                {item.icon}
              </span>
              <span style={{
                ...styles.navLabel,
                color: isActive ? '#fff' : 'rgba(255,255,255,0.7)',
                fontWeight: isActive ? 600 : 400,
              }}>
                {item.label}
              </span>
              {isActive && <div style={styles.activeIndicator} />}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

const styles = {
  sidebar: {
    width: 110,
    flexShrink: 0,
    height: '100vh',
    background: '#f97316',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingBottom: 16,
    position: 'relative',
    zIndex: 10,
  },
  logo: {
    width: '100%',
    padding: '20px 8px 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    borderBottom: '1px solid rgba(255,255,255,0.15)',
    marginBottom: 8,
  },
  logoText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 700,
    fontFamily: 'Poppins, sans-serif',
    textAlign: 'center',
    lineHeight: 1.3,
    letterSpacing: '0.01em',
  },
  nav: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
    padding: '8px 0',
  },
  navItem: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: '12px 8px',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    position: 'relative',
    transition: 'background 0.15s',
    borderRadius: 0,
  },
  navItemActive: {
    background: 'rgba(255,255,255,0.15)',
  },
  navIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  navLabel: {
    fontSize: 11,
    fontFamily: 'Inter, sans-serif',
    textAlign: 'center',
    letterSpacing: '0.01em',
  },
  activeIndicator: {
    position: 'absolute',
    right: 0,
    top: '50%',
    transform: 'translateY(-50%)',
    width: 3,
    height: 32,
    background: '#fff',
    borderRadius: '3px 0 0 3px',
  },
};

export default Sidebar;
