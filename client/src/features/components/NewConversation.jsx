import { useState, useEffect } from 'react';
import { messageAPI } from '../services/messages';
import UserAvatar from './UserAvatar';

const NewConversation = ({ onClose, onSelectUser }) => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    messageAPI.getMessageableUsers()
      .then(data => setUsers(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = users.filter(u =>
    u.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={styles.modal}>
        {/* Header */}
        <div style={styles.modalHeader}>
          <div>
            <h3 style={styles.modalTitle}>New Conversation</h3>
            <p style={styles.modalSub}>Select someone to message</p>
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
            placeholder="Search by name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            autoFocus
            style={styles.searchInput}
          />
        </div>

        {/* User List */}
        <div style={styles.userList}>
          {loading && (
            <div style={styles.stateMsg}>Loading users...</div>
          )}
          {!loading && filtered.length === 0 && (
            <div style={styles.stateMsg}>
              {search ? `No users found for "${search}"` : 'No users available'}
            </div>
          )}
          {!loading && filtered.map(user => (
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
                    color: user.role === 'client' ? '#ea580c' : '#16a34a',
                    border: `1px solid ${user.role === 'client' ? '#fed7aa' : '#bbf7d0'}`,
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
    padding: '10px 14px 10px 34px',
    border: '1.5px solid #e5e7eb',
    borderRadius: 10,
    fontSize: 13.5,
    fontFamily: 'Inter, sans-serif',
    color: '#111827',
    background: '#f9fafb',
    outline: 'none',
    boxSizing: 'border-box',
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
