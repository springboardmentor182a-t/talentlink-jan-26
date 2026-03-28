import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../features/hooks/useAuth';
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  MessageSquare,
  User,
  Building2,
  LogOut,
  PlusCircle,
} from 'lucide-react';

const FREELANCER_NAV = [
  { label: 'Dashboard',    path: '/freelancer/dashboard', icon: LayoutDashboard },
  { label: 'Job Listings', path: '/find-projects',        icon: Briefcase       },
  { label: 'Contracts',    path: '/contracts',            icon: FileText        },
  { label: 'Messages',     path: '/messages',             icon: MessageSquare   },
];

const CLIENT_NAV = [
  { label: 'Dashboard',      path: '/dashboard', icon: LayoutDashboard },
  { label: 'Post a Project', path: null,         icon: PlusCircle, disabled: true, soon: true },
  { label: 'Contracts',      path: '/contracts', icon: FileText        },
  { label: 'Messages',       path: '/messages',  icon: MessageSquare   },
];

const Sidebar = () => {
  const navigate         = useNavigate();
  const location         = useLocation();
  const { user, logout } = useAuth();

  const role         = user?.role ?? 'freelancer';
  const navItems     = role === 'client' ? CLIENT_NAV : FREELANCER_NAV;
  const profilePath  = role === 'client' ? '/profile/client' : '/profile/freelancer';
  const ProfileIcon  = role === 'client' ? Building2 : User;
  const profileLabel = role === 'client' ? 'Company Profile' : 'My Profile';

  const profileActive =
    location.pathname === profilePath ||
    location.pathname.startsWith(profilePath + '/');

  return (
    <aside style={styles.sidebar}>

      {/* Logo */}
      <div style={styles.logoArea} onClick={() => navigate('/dashboard')}>
        <span style={styles.logoWhite}>Talent</span>
        <span style={styles.logoFaded}>Link</span>
      </div>

      {/* Primary nav */}
      <nav style={styles.nav}>
        {navItems.map(({ label, path, icon: Icon, disabled, soon }) => {
          const isActive = !disabled && (
            location.pathname === path ||
            location.pathname.startsWith(path + '/')
          );

          return (
            <button
              key={label}
              onClick={() => !disabled && navigate(path)}
              disabled={disabled}
              title={soon ? 'Coming soon' : undefined}
              style={{
                ...styles.navItem,
                ...(isActive   ? styles.navItemActive   : {}),
                ...(disabled   ? styles.navItemDisabled : {}),
              }}
            >
              {isActive && <div style={styles.activeBar} />}
              <Icon
                size={18}
                style={{ color: disabled ? 'rgba(255,255,255,0.3)' : isActive ? '#fff' : 'rgba(255,255,255,0.65)', flexShrink: 0 }}
              />
              <span style={{
                ...styles.navLabel,
                color:      disabled ? 'rgba(255,255,255,0.3)' : isActive ? '#fff' : 'rgba(255,255,255,0.65)',
                fontWeight: isActive ? 600 : 400,
                flex: 1,
              }}>
                {label}
              </span>
              {soon && (
                <span style={styles.soonBadge}>Soon</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom — Profile + Sign Out */}
      <div style={styles.bottomSection}>
        <div style={styles.divider} />

        <button
          onClick={() => navigate(profilePath)}
          style={{
            ...styles.navItem,
            ...(profileActive ? styles.navItemActive : {}),
          }}
        >
          {profileActive && <div style={styles.activeBar} />}
          <ProfileIcon
            size={18}
            style={{ color: profileActive ? '#fff' : 'rgba(255,255,255,0.65)', flexShrink: 0 }}
          />
          <span style={{
            ...styles.navLabel,
            color:      profileActive ? '#fff' : 'rgba(255,255,255,0.65)',
            fontWeight: profileActive ? 600 : 400,
          }}>
            {profileLabel}
          </span>
        </button>

        <button onClick={logout} style={styles.navItem}>
          <LogOut
            size={18}
            style={{ color: 'rgba(255,255,255,0.65)', flexShrink: 0 }}
          />
          <span style={{ ...styles.navLabel, color: 'rgba(255,255,255,0.65)' }}>
            Sign Out
          </span>
        </button>
      </div>

    </aside>
  );
};

const styles = {
  sidebar: {
    width: 220,
    flexShrink: 0,
    height: '100vh',
    background: '#f97316',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    zIndex: 10,
  },
  logoArea: {
    height: 64,
    display: 'flex',
    alignItems: 'center',
    paddingLeft: 24,
    borderBottom: '1px solid rgba(255,255,255,0.15)',
    cursor: 'pointer',
    flexShrink: 0,
  },
  logoWhite: {
    fontSize: 22, fontWeight: 700,
    fontFamily: 'Poppins, sans-serif',
    color: '#fff', letterSpacing: '-0.01em',
  },
  logoFaded: {
    fontSize: 22, fontWeight: 700,
    fontFamily: 'Poppins, sans-serif',
    color: 'rgba(255,255,255,0.55)', letterSpacing: '-0.01em',
  },
  nav: {
    flex: 1, display: 'flex', flexDirection: 'column',
    paddingTop: 12, paddingBottom: 12, gap: 2, overflowY: 'auto',
  },
  navItem: {
    width: '100%', display: 'flex', flexDirection: 'row',
    alignItems: 'center', gap: 12, padding: '11px 24px',
    border: 'none', background: 'transparent', cursor: 'pointer',
    position: 'relative', transition: 'background 0.15s', textAlign: 'left',
  },
  navItemActive:   { background: 'rgba(0,0,0,0.12)' },
  navItemDisabled: { cursor: 'not-allowed' },
  activeBar: {
    position: 'absolute', left: 0, top: '50%',
    transform: 'translateY(-50%)',
    width: 3, height: 28, background: '#fff', borderRadius: '0 3px 3px 0',
  },
  navLabel: {
    fontSize: 13.5, fontFamily: 'Inter, sans-serif',
    letterSpacing: '0.01em', lineHeight: 1,
  },
  soonBadge: {
    fontSize: 10, fontWeight: 700,
    background: 'rgba(255,255,255,0.2)',
    color: 'rgba(255,255,255,0.7)',
    padding: '2px 6px', borderRadius: '999px',
    letterSpacing: '0.04em', flexShrink: 0,
  },
  bottomSection: { flexShrink: 0, paddingBottom: 8 },
  divider: { margin: '4px 24px', borderTop: '1px solid rgba(255,255,255,0.15)' },
};

export default Sidebar;