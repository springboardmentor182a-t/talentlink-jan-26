import { useState } from 'react';
import UserAvatar from './UserAvatar';

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60) return 'now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

const ConversationsList = ({ conversations = [], selectedUserId, onSelect, onNewChat }) => {
  const [search, setSearch] = useState('');

  const filtered = conversations.filter(c =>
    c.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.title}>Messages</h2>
        <button onClick={onNewChat} style={styles.newChatBtn} title="New conversation">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          <span>New Chat</span>
        </button>
      </div>

      {/* Search */}
      <div style={styles.searchWrap}>
        <svg style={styles.searchIcon} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          type="text"
          placeholder="Search conversations..."
          value={search}
          onChange={e => setSearch(e.target.value)}
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

      {/* List */}
      <div style={styles.list}>
        {filtered.length === 0 ? (
          <div style={styles.empty}>
            {search ? `No results for "${search}"` : 'No conversations yet'}
          </div>
        ) : (
          filtered.map(conv => {
            const isActive = conv.user_id === selectedUserId;
            return (
              <button
                key={conv.user_id}
                onClick={() => onSelect(conv.user_id)}
                style={{
                  ...styles.convItem,
                  ...(isActive ? styles.convItemActive : {}),
                }}
              >
                <div style={{ position: 'relative' }}>
                  <UserAvatar username={conv.username} size={42} />
                  {conv.unread_count > 0 && (
                    <span style={styles.unreadBadge}>
                      {conv.unread_count > 9 ? '9+' : conv.unread_count}
                    </span>
                  )}
                </div>
                <div style={styles.convInfo}>
                  <div style={styles.convTop}>
                    <span style={{ ...styles.convName, ...(isActive ? { color: '#fff' } : {}) }}>
                      {conv.username}
                    </span>
                    <span style={{ ...styles.convTime, ...(isActive ? { color: 'rgba(255,255,255,0.65)' } : {}) }}>
                      {timeAgo(conv.last_message_time)}
                    </span>
                  </div>
                  <p style={{ ...styles.convPreview, ...(isActive ? { color: 'rgba(255,255,255,0.75)' } : {}) }}>
                    {conv.last_message || 'No messages yet'}
                  </p>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    width: 300,
    flexShrink: 0,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    background: '#fff',
    borderRight: '1px solid #e5e7eb',
  },
  header: {
    padding: '20px 16px 14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: '1px solid #f3f4f6',
  },
  title: {
    margin: 0,
    fontSize: 18,
    fontWeight: 700,
    fontFamily: 'Poppins, sans-serif',
    color: '#111827',
  },
  newChatBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    background: '#f97316',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    padding: '7px 12px',
    fontSize: 13,
    fontWeight: 500,
    fontFamily: 'Inter, sans-serif',
    cursor: 'pointer',
    transition: 'opacity 0.15s',
  },
  searchWrap: {
    position: 'relative',
    margin: '12px 14px',
    display: 'flex',
    alignItems: 'center',
  },
  searchIcon: {
    position: 'absolute',
    left: 11,
    pointerEvents: 'none',
  },
  searchInput: {
    width: '100%',
    padding: '9px 32px 9px 34px',
    border: '1px solid #e5e7eb',
    borderRadius: 10,
    fontSize: 13,
    fontFamily: 'Inter, sans-serif',
    color: '#111827',
    background: '#f9fafb',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s',
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
  list: {
    flex: 1,
    overflowY: 'auto',
    padding: '4px 8px 8px',
  },
  empty: {
    textAlign: 'center',
    padding: '32px 16px',
    color: '#9ca3af',
    fontSize: 13,
    fontFamily: 'Inter, sans-serif',
  },
  convItem: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '10px 10px',
    borderRadius: 12,
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'background 0.15s',
    marginBottom: 2,
  },
  convItemActive: {
    background: '#f97316',
  },
  convInfo: {
    flex: 1,
    minWidth: 0,
  },
  convTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  convName: {
    fontWeight: 600,
    fontSize: 14,
    fontFamily: 'Poppins, sans-serif',
    color: '#111827',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  convTime: {
    fontSize: 11,
    color: '#9ca3af',
    flexShrink: 0,
    marginLeft: 6,
    fontFamily: 'Inter, sans-serif',
  },
  convPreview: {
    margin: 0,
    fontSize: 12.5,
    color: '#6b7280',
    fontFamily: 'Inter, sans-serif',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  unreadBadge: {
    position: 'absolute',
    top: -3,
    right: -3,
    background: '#ef4444',
    color: '#fff',
    fontSize: 10,
    fontWeight: 700,
    minWidth: 17,
    height: 17,
    borderRadius: 999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px solid #fff',
    fontFamily: 'Inter, sans-serif',
  },
};

export default ConversationsList;
