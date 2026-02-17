import React from 'react';

const COLORS = [
  '#f97316', '#3b82f6', '#10b981',
  '#8b5cf6', '#ec4899', '#14b8a6',
];

const getColor = (name = '') => COLORS[name.charCodeAt(0) % COLORS.length];

const UserAvatar = ({ username = '', size = 40, online = false }) => {
  const initials = username.slice(0, 2).toUpperCase();
  const bg       = getColor(username);

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <div style={{
        width:           size,
        height:          size,
        borderRadius:    '50%',
        background:      bg,
        color:           '#fff',
        display:         'flex',
        alignItems:      'center',
        justifyContent:  'center',
        fontWeight:      700,
        fontSize:        size * 0.36,
        fontFamily:      'var(--font-text)',
        flexShrink:      0,
      }}>
        {initials}
      </div>
      {online && (
        <span style={{
          position:   'absolute',
          bottom:     1,
          right:      1,
          width:      10,
          height:     10,
          borderRadius: '50%',
          background: '#22c55e',
          border:     '2px solid #fff',
        }} />
      )}
    </div>
  );
};

export default UserAvatar;
