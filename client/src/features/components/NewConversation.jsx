import React, { useState, useEffect } from 'react';
import { messageAPI } from '../services/messages';
import UserAvatar from './UserAvatar';
import { X } from 'lucide-react';

const NewConversation = ({ onSelect, onClose }) => {
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');

  useEffect(() => {
    messageAPI.getMessageableUsers()
      .then(setUsers)
      .finally(() => setLoading(false));
  }, []);

  const filtered = users.filter((u) =>
    u.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{
      position:   'fixed',
      inset:      0,
      background: 'rgba(0,0,0,0.4)',
      display:    'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex:     1000,
    }}>
      <div style={{
        background:   'var(--bg-primary)',
        borderRadius: 'var(--radius-lg)',
        width:        420,
        maxHeight:    520,
        display:      'flex',
        flexDirection:'column',
        boxShadow:    'var(--shadow-md)',
      }}>
        {/* Header */}
        <div style={{
          display:       'flex',
          justifyContent:'space-between',
          alignItems:    'center',
          padding:       '16px 20px',
          borderBottom:  '1px solid var(--border-color)',
        }}>
          <h3 style={{ margin: 0, fontFamily: 'var(--font-heading)', fontSize: 16 }}>
            New Conversation
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
            <X size={18} />
          </button>
        </div>

        {/* Search */}
        <div style={{ padding: '12px 20px' }}>
          <input
            autoFocus
            type="text"
            placeholder="Search users…"
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

        {/* Users list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 8px 8px' }}>
          {loading && <p style={{ padding: '16px', color: 'var(--color-tertiary)', fontSize: 13 }}>Loading…</p>}
          {!loading && filtered.length === 0 && (
            <p style={{ padding: '16px', color: 'var(--color-tertiary)', fontSize: 13 }}>No users found.</p>
          )}
          {filtered.map((user) => (
            <div
              key={user.id}
              onClick={() => { onSelect(user); onClose(); }}
              style={{
                display:    'flex',
                alignItems: 'center',
                gap:        12,
                padding:    '10px 12px',
                cursor:     'pointer',
                borderRadius: 'var(--radius-md)',
                transition: '0.15s ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-tertiary)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <UserAvatar username={user.username} size={38} />
              <div>
                <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>{user.username}</p>
                <span style={{
                  fontSize:     11,
                  color:        'var(--color-primary)',
                  fontWeight:   600,
                  textTransform:'capitalize',
                }}>
                  {user.role}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NewConversation;
