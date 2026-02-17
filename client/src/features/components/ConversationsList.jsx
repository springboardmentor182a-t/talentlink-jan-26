import React, { useState } from 'react';
import UserAvatar from './UserAvatar';

const timeAgo = (dateStr) => {
  if (!dateStr) return '';
  const utcStr = dateStr.endsWith('Z') ? dateStr : dateStr + 'Z';
  const diff = (Date.now() - new Date(utcStr)) / 1000;
  if (diff < 60)     return 'just now';
  if (diff < 3600)   return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400)  return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

const ConversationsList = ({ conversations, selectedUserId, onSelect, loading }) => {
  const [search, setSearch] = useState('');

  const filtered = conversations.filter((c) =>
    c.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{
      width:        320,
      minWidth:     320,
      borderRight:  '1px solid var(--border-color)',
      display:      'flex',
      flexDirection:'column',
      height:       '100%',
      background:   'var(--bg-primary)',
    }}>
      {/* Header */}
      <div style={{ padding: '20px 16px 12px', borderBottom: '1px solid var(--border-color)' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 18, margin: 0 }}>
          Messages
        </h2>
      </div>

      {/* Search */}
      <div style={{ padding: '12px 16px' }}>
        <input
          type="text"
          placeholder="Search conversations..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width:        '100%',
            padding:      '8px 12px',
            border:       '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            fontFamily:   'var(--font-text)',
            fontSize:     13,
            outline:      'none',
            boxSizing:    'border-box',
          }}
        />
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {loading && (
          <p style={{ padding: '20px 16px', color: 'var(--color-tertiary)', fontSize: 13 }}>
            Loading…
          </p>
        )}

        {!loading && filtered.length === 0 && (
          <p style={{ padding: '20px 16px', color: 'var(--color-tertiary)', fontSize: 13 }}>
            No conversations yet.
          </p>
        )}

        {filtered.map((conv) => {
          const isActive = conv.user_id === selectedUserId;
          return (
            <div
              key={conv.user_id}
              onClick={() => onSelect(conv.user_id)}
              style={{
                display:       'flex',
                alignItems:    'center',
                gap:           12,
                padding:       '12px 16px',
                cursor:        'pointer',
                background:    isActive ? 'var(--bg-tertiary)' : 'transparent',
                borderLeft:    isActive ? '3px solid var(--color-primary)' : '3px solid transparent',
                transition:    '0.15s ease',
              }}
            >
              <UserAvatar username={conv.username} size={42} />

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--color-secondary)' }}>
                    {conv.username}
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--color-tertiary)' }}>
                    {timeAgo(conv.last_message_time)}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 }}>
                  <span style={{
                    fontSize:     12,
                    color:        'var(--color-tertiary)',
                    overflow:     'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace:   'nowrap',
                    maxWidth:     160,
                  }}>
                    {conv.last_message || 'No messages yet'}
                  </span>
                  {conv.unread_count > 0 && (
                    <span style={{
                      background:   'var(--color-primary)',
                      color:        '#fff',
                      borderRadius: '999px',
                      padding:      '1px 7px',
                      fontSize:     11,
                      fontWeight:   700,
                      minWidth:     18,
                      textAlign:    'center',
                    }}>
                      {conv.unread_count}
                    </span>
                  )}
                </div>

                {/* Role badge */}
                <span style={{
                  fontSize:     10,
                  background:   'var(--bg-tertiary)',
                  color:        'var(--color-primary)',
                  padding:      '1px 6px',
                  borderRadius: '999px',
                  fontWeight:   600,
                  textTransform:'capitalize',
                  marginTop:    2,
                  display:      'inline-block',
                }}>
                  {conv.role}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ConversationsList;
