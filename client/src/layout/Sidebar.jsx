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
} from 'lucide-react';

// ── Nav config ────────────────────────────────────────────────────────────────
// Profile is NOT in the main nav — it lives pinned at the bottom.
// Main nav = destinations you visit regularly.
// Bottom = account-level actions you visit occasionally.

const FREELANCER_NAV = [
  { label: 'Dashboard',  path: '/dashboard', icon: LayoutDashboard },
  { label: 'Find Work',  path: '/jobs',       icon: Briefcase },
  { label: 'Contracts',  path: '/contracts',  icon: FileText },
  { label: 'Messages',   path: '/messages',   icon: MessageSquare },
];

const CLIENT_NAV = [
  { label: 'Dashboard',   path: '/dashboard', icon: LayoutDashboard },
  { label: 'Job Listings', path: '/jobs',     icon: Briefcase },
  { label: 'Contracts',   path: '/contracts', icon: FileText },
  { label: 'Messages',    path: '/messages',  icon: MessageSquare },
];

// ── Component ─────────────────────────────────────────────────────────────────

const Sidebar = () => {
  const navigate         = useNavigate();
  const location         = useLocation();
  const { user, logout } = useAuth();

  const role        = user?.role ?? 'freelancer';
  const navItems    = role === 'client' ? CLIENT_NAV : FREELANCER_NAV;
  const profilePath = role === 'client' ? '/profile/client' : '/profile/freelancer';
  const ProfileIcon = role === 'client' ? Building2 : User;
  const profileLabel = role === 'client' ? 'Company Profile' : 'My Profile';

  const profileActive =
    location.pathname === profilePath ||
    location.pathname.startsWith(profilePath + '/');

  return (
    <aside style={styles.sidebar}>

      {/* Logo */}
      <div style={styles.logoArea} onClick={() => navigate('/dashboard')}>
        <span style={styles.logoBlack}>Talent</span>
        <span style={styles.logoOrange}>Link</span>
      </div>

      {/* Primary nav */}
      <nav style={styles.nav}>
        {navItems.map(({ label, path, icon: Icon }) => {
          const isActive =
            location.pathname === path ||
            location.pathname.startsWith(path + '/');

          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              style={{
                ...styles.navItem,
                ...(isActive ? styles.navItemActive : {}),
              }}
            >
              {isActive && <div style={styles.activeBar} />}
              <Icon
                size={18}
                style={{ color: isActive ? '#fff' : 'rgba(255,255,255,0.65)', flexShrink: 0 }}
              />
              <span style={{
                ...styles.navLabel,
                color:      isActive ? '#fff' : 'rgba(255,255,255,0.65)',
                fontWeight: isActive ? 600 : 400,
              }}>
                {label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Bottom — Profile + Sign Out */}
      <div style={styles.bottomSection}>

        {/* Divider */}
        <div style={styles.divider} />

        {/* Profile */}
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

        {/* Sign Out */}
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

// ── Styles ────────────────────────────────────────────────────────────────────

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
  logoBlack: {
    fontSize: 22,
    fontWeight: 700,
    fontFamily: 'Poppins, sans-serif',
    color: '#fff',
    letterSpacing: '-0.01em',
  },
  logoOrange: {
    fontSize: 22,
    fontWeight: 700,
    fontFamily: 'Poppins, sans-serif',
    color: 'rgba(255,255,255,0.55)',
    letterSpacing: '-0.01em',
  },
  nav: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    paddingTop: 12,
    paddingBottom: 12,
    gap: 2,
    overflowY: 'auto',
  },
  navItem: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: '11px 24px',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    position: 'relative',
    transition: 'background 0.15s',
    textAlign: 'left',
  },
  navItemActive: {
    background: 'rgba(0,0,0,0.12)',
  },
  activeBar: {
    position: 'absolute',
    left: 0,
    top: '50%',
    transform: 'translateY(-50%)',
    width: 3,
    height: 28,
    background: '#fff',
    borderRadius: '0 3px 3px 0',
  },
  navLabel: {
    fontSize: 13.5,
    fontFamily: 'Inter, sans-serif',
    letterSpacing: '0.01em',
    lineHeight: 1,
  },
  bottomSection: {
    flexShrink: 0,
    paddingBottom: 8,
  },
  divider: {
    margin: '4px 24px 4px',
    borderTop: '1px solid rgba(255,255,255,0.15)',
  },
};

export default Sidebar;
