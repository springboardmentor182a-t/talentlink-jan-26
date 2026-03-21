import { useEffect, useRef, useState } from 'react';
import MessageBubble from './MessageBubble';
import UserAvatar from './UserAvatar';
import '../../assets/messages.css';

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
      <div className="chat-empty-state">
        <div className="chat-empty-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        </div>
        <h3 className="chat-empty-title">Your Messages</h3>
        <p className="chat-empty-subtitle">Select a conversation or start a new chat</p>
      </div>
    );
  }

  return (
    <div className="chat-container">
      {/* Header */}
      <div className="chat-header">
        <div className="chat-header-left">
          <div className="chat-avatar-wrap">
            <UserAvatar username={selectedUser.username} size={40} />
            {isOnline && <span className="chat-online-dot" title="Online" />}
          </div>
          <div>
            <div className="chat-header-name">{selectedUser.username}</div>
            <div className="chat-header-status">
              {isOnline
                ? <><span className="chat-online-pulse" />Online</>
                : (selectedUser.role || 'TalentLink User')
              }
            </div>
          </div>
        </div>
        <div className="chat-header-actions">
          <button className="chat-icon-btn" title="More options">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="chat-messages">
        {loading && (
          <div className="chat-loading-wrap">
            <span className="chat-loading-dot" />
            <span className="chat-loading-dot" style={{ animationDelay: '0.15s' }} />
            <span className="chat-loading-dot" style={{ animationDelay: '0.3s' }} />
          </div>
        )}
        {!loading && messages.length === 0 && (
          <div className="chat-no-messages">
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
                <div className="chat-date-divider">
                  <span className="chat-date-divider-text">
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
      <div className="chat-input-area">
        <div className="chat-input-wrap">
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows={1}
            className="chat-textarea"
          />
          <button
            onClick={handleSend}
            disabled={!text.trim()}
            className={text.trim() ? 'chat-send-btn' : 'chat-send-btn chat-send-btn--disabled'}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>
        <p className="chat-hint">Press Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  );
};

export default ChatArea;
