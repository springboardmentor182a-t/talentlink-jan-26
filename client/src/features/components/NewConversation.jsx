import { useState, useEffect, useRef } from 'react';
import { messageAPI } from '../services/messages';
import UserAvatar from './UserAvatar';

/**
 * NewConversation modal
 *
 * Previously called getMessageableUsers() on mount which returned every user
 * on the platform — a user enumeration and performance problem.
 *
 * Now uses a search-as-you-type pattern: results only load after 2+ chars,
 * matching the backend's minimum query length requirement.
 */
const NewConversation = ({ onClose, onSelectUser }) => {
  const [users, setUsers]       = useState([]);
  const [search, setSearch]     = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);
  const debounceRef             = useRef(null);

  // Search with 300 ms debounce so we don't fire on every keystroke
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (search.trim().length < 2) {
      setUsers([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    debounceRef.current = setTimeout(async () => {
      try {
        const data = await messageAPI.searchUsers(search);
        setUsers(data);
      } catch {
        setError('Failed to search users');
        setUsers([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(debounceRef.current);
  }, [search]);

  const showHint    = search.trim().length < 2;
  const showEmpty   = !loading && !showHint && users.length === 0 && !error;

  return (
    <div style={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={styles.modal}>
        {/* Header */}
        <div style={styles.modalHeader}>
          <div>
            <h3 style={styles.modalTitle}>New Conversation</h3>
            <p style={styles.modalSub}>Search for someone to message</p>
          </div>
          <button onClick={onClose} style={styles.closeBtn}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Search */}
        <div style={styles.searchWrap}>
          <svg style={styles.searchIcon} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder="Type a name (min. 2 characters)..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            autoFocus
            style={styles.searchInput}
          />
          {search && (
            <button onClick={() => setSearch('')} style={styles.clearBtn}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18M6 6l12 12"/>
              </svg>
            </button>
          )}
        </div>

        {/* User List */}
        <div style={styles.userList}>
          {showHint && (
            <div style={styles.stateMsg}>Type at least 2 characters to search</div>
          )}
          {loading && (
            <div style={styles.stateMsg}>Searching...</div>
          )}
          {error && (
            <div style={{ ...styles.stateMsg, color: '#ef4444' }}>{error}</div>
          )}
          {showEmpty && (
            <div style={styles.stateMsg}>No users found for &ldquo;{search}&rdquo;</div>
          )}
          {!loading && users.map(user => (
            <button
              key={user.id}
              onClick={() => onSelectUser(user.id, user)}
              style={styles.userItem}
            >
              <UserAvatar username={user.username} size={40} />
              <div style={styles.userInfo}>
                <span style={styles.userName}>{user.username}</span>
                {user.role && (
                  <span style={{
                    ...styles.roleBadge,
                    background: user.role === 'client' ? '#fff7ed' : '#f0fdf4',
                    color:      user.role === 'client' ? '#ea580c' : '#16a34a',
                    border:     `1px solid ${user.role === 'client' ? '#fed7aa' : '#bbf7d0'}`,
                  }}>
                    {user.role}
                  </span>
                )}
              </div>
              <svg style={styles.arrowIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 18 6-6-6-6"/>
              </svg>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.35)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: 20,
  },
  modal: {
    background: '#fff',
    borderRadius: 16,
    width: '100%',
    maxWidth: 420,
    boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
    overflow: 'hidden',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '20px 20px 16px',
    borderBottom: '1px solid #f3f4f6',
  },
  modalTitle: {
    margin: 0,
    fontSize: 17,
    fontWeight: 700,
    fontFamily: 'Poppins, sans-serif',
    color: '#111827',
  },
  modalSub: {
    margin: '3px 0 0',
    fontSize: 13,
    color: '#9ca3af',
    fontFamily: 'Inter, sans-serif',
  },
  closeBtn: {
    background: '#f3f4f6',
    border: 'none',
    borderRadius: 8,
    width: 32,
    height: 32,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: '#6b7280',
    flexShrink: 0,
  },
  searchWrap: {
    position: 'relative',
    margin: '14px 16px 8px',
    display: 'flex',
    alignItems: 'center',
  },
  searchIcon: {
    position: 'absolute',
    left: 11,
    top: '50%',
    transform: 'translateY(-50%)',
    pointerEvents: 'none',
  },
  searchInput: {
    width: '100%',
    padding: '10px 32px 10px 34px',
    border: '1.5px solid #e5e7eb',
    borderRadius: 10,
    fontSize: 13.5,
    fontFamily: 'Inter, sans-serif',
    color: '#111827',
    background: '#f9fafb',
    outline: 'none',
    boxSizing: 'border-box',
  },
  clearBtn: {
    position: 'absolute',
    right: 10,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 2,
    display: 'flex',
    alignItems: 'center',
  },
  userList: {
    maxHeight: 340,
    overflowY: 'auto',
    padding: '8px 8px 12px',
  },
  stateMsg: {
    textAlign: 'center',
    padding: '32px 16px',
    color: '#9ca3af',
    fontSize: 13,
    fontFamily: 'Inter, sans-serif',
  },
  userItem: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '10px 12px',
    border: 'none',
    background: 'transparent',
    borderRadius: 10,
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'background 0.12s',
  },
  userInfo: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    minWidth: 0,
  },
  userName: {
    fontWeight: 500,
    fontSize: 14,
    fontFamily: 'Inter, sans-serif',
    color: '#111827',
  },
  roleBadge: {
    fontSize: 11,
    fontWeight: 500,
    padding: '2px 8px',
    borderRadius: 999,
    fontFamily: 'Inter, sans-serif',
    textTransform: 'capitalize',
  },
  arrowIcon: {
    flexShrink: 0,
    opacity: 0.4,
  },
};

export default NewConversation;
