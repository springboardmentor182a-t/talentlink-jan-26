import { useState, useEffect, useRef } from 'react';
import { messageAPI } from '../services/messages';
import UserAvatar from './UserAvatar';
import '../../assets/messages.css';

/**
 * NewConversation modal
 *
 * Uses search-as-you-type: results only load after 2+ chars,
 * matching the backend's minimum query length requirement.
 */
const NewConversation = ({ onClose, onSelectUser }) => {
  const [users, setUsers]       = useState([]);
  const [search, setSearch]     = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);
  const debounceRef             = useRef(null);

  // Search with 300 ms debounce so we don't fire on every keystroke
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (search.trim().length < 2) {
      setUsers([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    debounceRef.current = setTimeout(async () => {
      try {
        const data = await messageAPI.searchUsers(search);
        setUsers(data);
      } catch {
        setError('Failed to search users');
        setUsers([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(debounceRef.current);
  }, [search]);

  const showHint  = search.trim().length < 2;
  const showEmpty = !loading && !showHint && users.length === 0 && !error;

  return (
    <div className="new-conv-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="new-conv-modal">
        {/* Header */}
        <div className="new-conv-header">
          <div>
            <h3 className="new-conv-title">New Conversation</h3>
            <p className="new-conv-subtitle">Search for someone to message</p>
          </div>
          <button onClick={onClose} className="new-conv-close-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Search */}
        <div className="new-conv-search-wrap">
          <svg className="new-conv-search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder="Type a name (min. 2 characters)..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            autoFocus
            className="new-conv-search-input"
          />
          {search && (
            <button onClick={() => setSearch('')} className="new-conv-clear-btn">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18M6 6l12 12"/>
              </svg>
            </button>
          )}
        </div>

        {/* User List */}
        <div className="new-conv-user-list">
          {showHint && (
            <div className="new-conv-state-msg">Type at least 2 characters to search</div>
          )}
          {loading && (
            <div className="new-conv-state-msg">Searching...</div>
          )}
          {error && (
            <div className="new-conv-state-msg new-conv-state-msg--error">{error}</div>
          )}
          {showEmpty && (
            <div className="new-conv-state-msg">No users found for &ldquo;{search}&rdquo;</div>
          )}
          {!loading && users.map(user => (
            <button
              key={user.id}
              onClick={() => onSelectUser(user.id, user)}
              className="new-conv-user-item"
            >
              <UserAvatar username={user.username} size={40} />
              <div className="new-conv-user-info">
                <span className="new-conv-user-name">{user.username}</span>
                {user.role && (
                  // role badge colours are dynamic — inline style is intentional here
                  <span style={{
                    fontSize: 11,
                    fontWeight: 500,
                    padding: '2px 8px',
                    borderRadius: 999,
                    fontFamily: 'Inter, sans-serif',
                    textTransform: 'capitalize',
                    background: user.role === 'client' ? '#fff7ed' : '#f0fdf4',
                    color:      user.role === 'client' ? '#ea580c' : '#16a34a',
                    border:     `1px solid ${user.role === 'client' ? '#fed7aa' : '#bbf7d0'}`,
                  }}>
                    {user.role}
                  </span>
                )}
              </div>
              <svg className="new-conv-arrow-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 18 6-6-6-6"/>
              </svg>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NewConversation;
