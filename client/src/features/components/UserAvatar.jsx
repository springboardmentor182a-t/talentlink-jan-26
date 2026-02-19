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
    <div style={{ position: 'relative', display: 'inline-flex', flexShrink: 0 }}>
      <div
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          background: bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontSize: size * 0.36,
          fontWeight: 600,
          fontFamily: 'Poppins, sans-serif',
          letterSpacing: '0.03em',
          flexShrink: 0,
          userSelect: 'none',
        }}
      >
        {initials}
      </div>
      {showOnline && (
        <span
          style={{
            position: 'absolute',
            bottom: 1,
            right: 1,
            width: size * 0.28,
            height: size * 0.28,
            borderRadius: '50%',
            background: isOnline ? '#22c55e' : '#9ca3af',
            border: '2px solid #fff',
          }}
        />
      )}
    </div>
  );
};

export default UserAvatar;
