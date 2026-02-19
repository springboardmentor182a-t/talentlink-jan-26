function formatTime(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

const MessageBubble = ({ message, isOwn }) => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: isOwn ? 'flex-end' : 'flex-start',
        marginBottom: 4,
        padding: '2px 0',
      }}
    >
      <div
        style={{
          maxWidth: '62%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: isOwn ? 'flex-end' : 'flex-start',
          gap: 4,
        }}
      >
        <div
          style={{
            padding: '10px 14px',
            borderRadius: isOwn ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
            background: isOwn ? '#f97316' : '#f3f4f6',
            color: isOwn ? '#fff' : '#111827',
            fontSize: 14,
            fontFamily: 'Inter, sans-serif',
            lineHeight: 1.5,
            wordBreak: 'break-word',
            boxShadow: isOwn
              ? '0 2px 8px rgba(249,115,22,0.2)'
              : '0 1px 4px rgba(0,0,0,0.06)',
          }}
        >
          {message.content}
        </div>
        <span
          style={{
            fontSize: 11,
            color: '#9ca3af',
            fontFamily: 'Inter, sans-serif',
            paddingLeft: isOwn ? 0 : 2,
            paddingRight: isOwn ? 2 : 0,
          }}
        >
          {formatTime(message.timestamp)}
          {isOwn && (
            <span style={{ marginLeft: 5, color: message.is_read ? '#f97316' : '#d1d5db' }}>
              {message.is_read ? '✓✓' : '✓'}
            </span>
          )}
        </span>
      </div>
    </div>
  );
};

export default MessageBubble;
