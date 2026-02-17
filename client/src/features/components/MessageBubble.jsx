import React from 'react';

const formatTime = (dateStr) => {
  if (!dateStr) return '';
  // Add Z if not present to tell JS this is UTC
  const utcStr = dateStr.endsWith('Z') ? dateStr : dateStr + 'Z';
  return new Date(utcStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const MessageBubble = ({ message, isMine }) => (
  <div style={{
    display:       'flex',
    justifyContent: isMine ? 'flex-end' : 'flex-start',
    marginBottom:  8,
  }}>
    <div style={{
      maxWidth:     '65%',
      padding:      '10px 14px',
      borderRadius: isMine
        ? '18px 18px 4px 18px'
        : '18px 18px 18px 4px',
      background:   isMine ? 'var(--color-primary)' : 'var(--bg-tertiary)',
      color:        isMine ? '#ffffff' : 'var(--color-secondary)',
      fontSize:     14,
      lineHeight:   1.5,
      wordBreak:    'break-word',
      boxShadow:    'var(--shadow-sm)',
    }}>
      <p style={{ margin: 0 }}>{message.content}</p>
      <p style={{
        margin:     '4px 0 0',
        fontSize:   10,
        color:      isMine ? 'rgba(255,255,255,0.75)' : 'var(--color-tertiary)',
        textAlign:  'right',
      }}>
        {formatTime(message.timestamp)}
        {isMine && (
          <span style={{ marginLeft: 4 }}>
            {message.is_read ? '✓✓' : '✓'}
          </span>
        )}
      </p>
    </div>
  </div>
);

export default MessageBubble;
