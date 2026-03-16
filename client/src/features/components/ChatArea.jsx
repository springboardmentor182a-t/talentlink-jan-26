import { useEffect, useRef, useState } from 'react';
import MessageBubble from './MessageBubble';
import UserAvatar from './UserAvatar';

/**
 * ChatArea
 *
 * Props:
 *  messages      - array of message objects
 *  selectedUser  - conversation partner { username, role, user_id, ... }
 *  currentUser   - logged-in user { id, ... }
 *  onSend        - (content: string) => void
 *  loading       - bool — shows loading dots while fetching initial messages
 *  isOnline      - bool — real presence from WebSocket manager
 */
const ChatArea = ({ messages = [], selectedUser, currentUser, onSend, loading, isOnline = false }) => {
  const [text, setText] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!selectedUser) {
    return (
      <div style={styles.emptyState}>
        <div style={styles.emptyIcon}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        </div>
        <h3 style={styles.emptyTitle}>Your Messages</h3>
        <p style={styles.emptySubtitle}>Select a conversation or start a new chat</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.avatarWrap}>
            <UserAvatar username={selectedUser.username} size={40} />
            {/* Online presence dot */}
            {isOnline && <span style={styles.onlineDot} title="Online" />}
          </div>
          <div>
            <div style={styles.headerName}>{selectedUser.username}</div>
            <div style={styles.headerStatus}>
              {isOnline
                ? <><span style={styles.onlinePulse} />Online</>
                : (selectedUser.role || 'TalentLink User')
              }
            </div>
          </div>
        </div>
        <div style={styles.headerActions}>
          <button style={styles.iconBtn} title="More options">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Messages */}
      <div style={styles.messages}>
        {loading && (
          <div style={styles.loadingWrap}>
            <span style={styles.loadingDot} />
            <span style={{ ...styles.loadingDot, animationDelay: '0.15s' }} />
            <span style={{ ...styles.loadingDot, animationDelay: '0.3s' }} />
          </div>
        )}
        {!loading && messages.length === 0 && (
          <div style={styles.noMessages}>
            <p>No messages yet. Say hello! 👋</p>
          </div>
        )}
        {messages.map((msg, i) => {
          const isOwn = msg.sender_id === currentUser?.id;
          const prevMsg = messages[i - 1];
          const showDateDivider =
            i === 0 ||
            new Date(msg.timestamp).toDateString() !== new Date(prevMsg?.timestamp).toDateString();

          return (
            <div key={msg.id || i}>
              {showDateDivider && (
                <div style={styles.dateDivider}>
                  <span style={styles.dateDividerText}>
                    {new Date(msg.timestamp).toLocaleDateString([], {
                      weekday: 'long', month: 'short', day: 'numeric'
                    })}
                  </span>
                </div>
              )}
              <MessageBubble message={msg} isOwn={isOwn} />
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={styles.inputArea}>
        <div style={styles.inputWrap}>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows={1}
            style={styles.textarea}
          />
          <button
            onClick={handleSend}
            disabled={!text.trim()}
            style={{
              ...styles.sendBtn,
              ...(!text.trim() ? styles.sendBtnDisabled : {}),
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>
        <p style={styles.hint}>Press Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    background: '#fff',
    minWidth: 0,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 20px',
    borderBottom: '1px solid #e5e7eb',
    background: '#fff',
    flexShrink: 0,
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  avatarWrap: {
    position: 'relative',
    display: 'inline-flex',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 1,
    right: 1,
    width: 10,
    height: 10,
    borderRadius: '50%',
    background: '#22c55e',
    border: '2px solid #fff',
  },
  headerName: {
    fontWeight: 600,
    fontSize: 15,
    fontFamily: 'Poppins, sans-serif',
    color: '#111827',
    lineHeight: 1.3,
  },
  headerStatus: {
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    fontSize: 12,
    color: '#6b7280',
    fontFamily: 'Inter, sans-serif',
  },
  onlinePulse: {
    display: 'inline-block',
    width: 7,
    height: 7,
    borderRadius: '50%',
    background: '#22c55e',
  },
  headerActions: {
    display: 'flex',
    gap: 4,
  },
  iconBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 6,
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background 0.15s',
  },
  messages: {
    flex: 1,
    overflowY: 'auto',
    padding: '20px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    background: '#fafafa',
  },
  loadingWrap: {
    display: 'flex',
    justifyContent: 'center',
    gap: 6,
    padding: 20,
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: '#f97316',
    animation: 'bounce 0.6s infinite alternate',
    display: 'inline-block',
  },
  noMessages: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#9ca3af',
    fontSize: 14,
    fontFamily: 'Inter, sans-serif',
  },
  dateDivider: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '16px 0 12px',
  },
  dateDividerText: {
    background: '#f3f4f6',
    color: '#9ca3af',
    fontSize: 11,
    fontFamily: 'Inter, sans-serif',
    fontWeight: 500,
    padding: '4px 12px',
    borderRadius: 999,
  },
  inputArea: {
    padding: '12px 20px 14px',
    borderTop: '1px solid #e5e7eb',
    background: '#fff',
    flexShrink: 0,
  },
  inputWrap: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: 10,
    background: '#f9fafb',
    border: '1.5px solid #e5e7eb',
    borderRadius: 14,
    padding: '8px 8px 8px 14px',
    transition: 'border-color 0.15s',
  },
  textarea: {
    flex: 1,
    border: 'none',
    background: 'transparent',
    resize: 'none',
    fontFamily: 'Inter, sans-serif',
    fontSize: 14,
    color: '#111827',
    lineHeight: 1.5,
    outline: 'none',
    maxHeight: 120,
    overflowY: 'auto',
  },
  sendBtn: {
    flexShrink: 0,
    width: 38,
    height: 38,
    borderRadius: 10,
    background: '#f97316',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    transition: 'opacity 0.15s',
  },
  sendBtnDisabled: {
    background: '#e5e7eb',
    color: '#9ca3af',
    cursor: 'not-allowed',
  },
  hint: {
    margin: '6px 0 0',
    fontSize: 11,
    color: '#d1d5db',
    fontFamily: 'Inter, sans-serif',
    textAlign: 'center',
  },
  emptyState: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    background: '#fafafa',
    padding: 40,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: '50%',
    background: '#f3f4f6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: {
    margin: 0,
    fontSize: 18,
    fontWeight: 600,
    fontFamily: 'Poppins, sans-serif',
    color: '#111827',
  },
  emptySubtitle: {
    margin: 0,
    fontSize: 14,
    color: '#9ca3af',
    fontFamily: 'Inter, sans-serif',
  },
};

export default ChatArea;
