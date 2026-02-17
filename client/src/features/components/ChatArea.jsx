import React, { useEffect, useRef, useState } from 'react';
import MessageBubble from './MessageBubble';
import UserAvatar from './UserAvatar';
import { Send } from 'lucide-react';

const ChatArea = ({ messages, selectedUser, currentUserId, onSend, loading }) => {
  const [text, setText]     = useState('');
  const bottomRef           = useRef(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!text.trim()) return;
    onSend(text.trim());
    setText('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ── Empty state ───────────────────────────────────────────────────────────
  if (!selectedUser) {
    return (
      <div style={{
        flex:           1,
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        flexDirection:  'column',
        gap:            12,
        background:     'var(--bg-secondary)',
        color:          'var(--color-tertiary)',
      }}>
        <span style={{ fontSize: 48 }}>💬</span>
        <p style={{ fontSize: 15 }}>Select a conversation to start messaging</p>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg-secondary)' }}>

      {/* Chat Header */}
      <div style={{
        display:       'flex',
        alignItems:    'center',
        gap:           12,
        padding:       '14px 20px',
        background:    'var(--bg-primary)',
        borderBottom:  '1px solid var(--border-color)',
        boxShadow:     'var(--shadow-sm)',
      }}>
        <UserAvatar username={selectedUser.username} size={40} />
        <div>
          <p style={{ fontWeight: 700, fontSize: 15, margin: 0, color: 'var(--color-secondary)' }}>
            {selectedUser.username}
          </p>
          <span style={{
            fontSize:     11,
            background:   'var(--bg-tertiary)',
            color:        'var(--color-primary)',
            padding:      '1px 8px',
            borderRadius: '999px',
            fontWeight:   600,
            textTransform:'capitalize',
          }}>
            {selectedUser.role}
          </span>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
        {loading && (
          <p style={{ textAlign: 'center', color: 'var(--color-tertiary)', fontSize: 13 }}>
            Loading messages…
          </p>
        )}

        {!loading && messages.length === 0 && (
          <p style={{ textAlign: 'center', color: 'var(--color-tertiary)', fontSize: 13, marginTop: 40 }}>
            No messages yet. Say hello! 👋
          </p>
        )}

        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            isMine={msg.sender_id === currentUserId}
          />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{
        display:      'flex',
        alignItems:   'center',
        gap:          10,
        padding:      '12px 20px',
        background:   'var(--bg-primary)',
        borderTop:    '1px solid var(--border-color)',
      }}>
        <input
          type="text"
          placeholder="Type a message…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          style={{
            flex:         1,
            padding:      '10px 16px',
            border:       '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            fontFamily:   'var(--font-text)',
            fontSize:     14,
            outline:      'none',
            background:   'var(--bg-secondary)',
          }}
        />
        <button
          onClick={handleSend}
          disabled={!text.trim()}
          style={{
            background:   text.trim() ? 'var(--color-primary)' : 'var(--bg-tertiary)',
            color:        text.trim() ? '#fff' : 'var(--color-tertiary)',
            border:       'none',
            borderRadius: 'var(--radius-md)',
            padding:      '10px 16px',
            cursor:       text.trim() ? 'pointer' : 'not-allowed',
            display:      'flex',
            alignItems:   'center',
            gap:          6,
            fontFamily:   'var(--font-text)',
            fontWeight:   600,
            fontSize:     14,
            transition:   '0.2s ease',
          }}
        >
          <Send size={16} />
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatArea;
