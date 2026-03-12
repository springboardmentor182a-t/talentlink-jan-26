import { useState } from 'react';
import UserAvatar from './UserAvatar';
import '../../assets/messages.css';

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
    <div className="conv-list-container">
      {/* Header */}
      <div className="conv-list-header">
        <h2 className="conv-list-title">Messages</h2>
        <button onClick={onNewChat} className="conv-new-chat-btn" title="New conversation">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          <span>New Chat</span>
        </button>
      </div>

      {/* Search */}
      <div className="conv-search-wrap">
        <svg className="conv-search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          type="text"
          placeholder="Search conversations..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="conv-search-input"
        />
        {search && (
          <button onClick={() => setSearch('')} className="conv-clear-btn">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        )}
      </div>

      {/* List */}
      <div className="conv-list">
        {filtered.length === 0 ? (
          <div className="conv-list-empty">
            {search ? `No results for "${search}"` : 'No conversations yet'}
          </div>
        ) : (
          filtered.map(conv => {
            const isActive = conv.user_id === selectedUserId;
            return (
              <button
                key={conv.user_id}
                onClick={() => onSelect(conv.user_id)}
                className={isActive ? 'conv-item conv-item--active' : 'conv-item'}
              >
                <div className="conv-avatar-wrap">
                  <UserAvatar username={conv.username} size={42} />
                  {conv.unread_count > 0 && (
                    <span className="conv-unread-badge">
                      {conv.unread_count > 9 ? '9+' : conv.unread_count}
                    </span>
                  )}
                </div>
                <div className="conv-info">
                  <div className="conv-top">
                    <span className={isActive ? 'conv-name conv-name--active' : 'conv-name'}>
                      {conv.username}
                    </span>
                    <span className={isActive ? 'conv-time conv-time--active' : 'conv-time'}>
                      {timeAgo(conv.last_message_time)}
                    </span>
                  </div>
                  <p className={isActive ? 'conv-preview conv-preview--active' : 'conv-preview'}>
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

export default ConversationsList;
