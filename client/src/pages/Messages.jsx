import React, { useState } from 'react';
import { useAuth } from '../features/hooks/useAuth';
import { useMessages } from '../features/hooks/useMessages';
import ConversationsList from '../features/components/ConversationsList';
import ChatArea from '../features/components/ChatArea';
import NewConversation from '../features/components/NewConversation';
import { PenSquare } from 'lucide-react';
import '../assets/theme.css';

const Messages = () => {
  const { user }                              = useAuth();
  const [selectedUserId, setSelectedUserId]   = useState(null);
  const [selectedUser, setSelectedUser]       = useState(null);
  const [showNewChat, setShowNewChat]         = useState(false);

  const {
    conversations,
    messages,
    loadingConversations,
    loadingMessages,
    sendMessage,
  } = useMessages(selectedUserId);

  const handleSelectConversation = (userId) => {
    setSelectedUserId(userId);
    const conv = conversations.find((c) => c.user_id === userId);
    if (conv) setSelectedUser({ id: conv.user_id, username: conv.username, role: conv.role });
  };

  const handleNewConversationSelect = (newUser) => {
    setSelectedUserId(newUser.id);
    setSelectedUser(newUser);
  };

  return (
    <div style={{
      display:    'flex',
      height:     '100vh',
      fontFamily: 'var(--font-text)',
      background: 'var(--bg-secondary)',
    }}>

      {/* Left sidebar */}
      <div style={{ display: 'flex', flexDirection: 'column', width: 320, minWidth: 320, background: 'var(--bg-primary)' }}>

        {/* New conversation button */}
        <div style={{
          display:        'flex',
          justifyContent: 'flex-end',
          padding:        '8px 16px 0',
        }}>
          <button
            onClick={() => setShowNewChat(true)}
            style={{
              display:      'flex',
              alignItems:   'center',
              gap:          6,
              background:   'none',
              border:       '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding:      '6px 12px',
              cursor:       'pointer',
              fontSize:     12,
              color:        'var(--color-primary)',
              fontWeight:   600,
              fontFamily:   'var(--font-text)',
            }}
          >
            <PenSquare size={14} />
            New Chat
          </button>
        </div>

        <ConversationsList
          conversations={conversations}
          selectedUserId={selectedUserId}
          onSelect={handleSelectConversation}
          loading={loadingConversations}
        />
      </div>

      {/* Chat area */}
      <ChatArea
        messages={messages}
        selectedUser={selectedUser}
        currentUserId={user?.id}
        onSend={sendMessage}
        loading={loadingMessages}
      />

      {/* New Conversation Modal */}
      {showNewChat && (
        <NewConversation
          onSelect={handleNewConversationSelect}
          onClose={() => setShowNewChat(false)}
        />
      )}
    </div>
  );
};

export default Messages;
