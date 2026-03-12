import '../../assets/messages.css';

function formatTime(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

const MessageBubble = ({ message, isOwn }) => {
  return (
    <div className={isOwn ? 'bubble-row bubble-row--own' : 'bubble-row bubble-row--other'}>
      <div className={isOwn ? 'bubble-col bubble-col--own' : 'bubble-col bubble-col--other'}>
        <div className={isOwn ? 'bubble bubble--own' : 'bubble bubble--other'}>
          {message.content}
        </div>
        <span className={isOwn ? 'bubble-meta bubble-meta--own' : 'bubble-meta bubble-meta--other'}>
          {formatTime(message.timestamp)}
          {isOwn && (
            <span className={message.is_read ? 'bubble-read-tick bubble-read-tick--read' : 'bubble-read-tick bubble-read-tick--unread'}>
              {message.is_read ? '✓✓' : '✓'}
            </span>
          )}
        </span>
      </div>
    </div>
  );
};

export default MessageBubble;
