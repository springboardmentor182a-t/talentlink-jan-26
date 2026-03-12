import '../../assets/messages.css';

const AVATAR_COLORS = [
  '#f97316', '#0ea5e9', '#10b981', '#8b5cf6',
  '#f43f5e', '#f59e0b', '#06b6d4', '#84cc16',
];

function getColor(name = '') {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getInitials(name = '') {
  return name
    .split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

const UserAvatar = ({ username = '', size = 38, showOnline = false, isOnline = false }) => {
  const bg = getColor(username);
  const initials = getInitials(username);

  return (
    <div className="user-avatar-wrap">
      {/* width, height, fontSize, background are prop-driven — inline style is intentional */}
      <div
        className="user-avatar"
        style={{ width: size, height: size, fontSize: size * 0.36, background: bg }}
      >
        {initials}
      </div>
      {showOnline && (
        <span
          className="user-avatar-status"
          style={{
            width: size * 0.28,
            height: size * 0.28,
            background: isOnline ? '#22c55e' : '#9ca3af',
          }}
        />
      )}
    </div>
  );
};

export default UserAvatar;
