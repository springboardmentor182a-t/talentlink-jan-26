import { useState, useEffect } from 'react';
import { useAuth } from '../features/hooks/useAuth';
import { useMessages } from '../features/hooks/useMessages';
import ConversationsList from '../features/components/ConversationsList';
import ChatArea from '../features/components/ChatArea';
import NewConversation from '../features/components/NewConversation';

const Messages = () => {
  const { user } = useAuth();
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedUser, setSelectedUser]     = useState(null);
  const [showNewChat, setShowNewChat]       = useState(false);

  const {
    conversations,
    messages,
    onlineUsers,
    loadingMessages,
    wsConnected,
    sendMessage,
    markRead,
    refetch,
  } = useMessages(selectedUserId, user);

  // Keep selectedUser in sync when conversations list updates.
  useEffect(() => {
    if (selectedUserId && conversations.length > 0) {
      const found = conversations.find(c => c.user_id === selectedUserId);
      if (found) setSelectedUser(found);
    }
  }, [conversations, selectedUserId]);

  // Fire the explicit read receipt whenever the messages list changes and a
  // conversation is open. The backend PATCH only fires the DB write when there
  // are actually unread messages, so this is safe to call on every render.
  useEffect(() => {
    if (selectedUserId && messages.length > 0) {
      markRead(selectedUserId);
    }
  }, [selectedUserId, messages, markRead]);

  // Called from ConversationsList sidebar.
  const handleSelectFromList = (userId) => {
    setSelectedUserId(userId);
    const found = conversations.find(c => c.user_id === userId);
    if (found) setSelectedUser(found);
    // No setTimeout hack — markRead fires naturally in the useEffect above
    // after messages load and render.
  };

  // Called from NewConversation modal.
  // Modal gives shape { id, username, role }; normalise to { user_id, ... }
  // so the rest of the UI always sees one consistent shape.
  const handleSelectFromModal = (userId, userObj) => {
    setSelectedUserId(userId);
    setSelectedUser({
      user_id:  userObj.id ?? userObj.user_id,
      username: userObj.username,
      role:     userObj.role,
    });
    setShowNewChat(false);
  };

  return (
    <div style={styles.page}>
      {/* Connection indicator — only visible while WS is establishing */}
      {!wsConnected && (
        <div style={styles.offlineBanner}>
          ⚡ Connecting to real-time chat…
        </div>
      )}

      <div style={styles.chatShell}>
        <ConversationsList
          conversations={conversations}
          selectedUserId={selectedUserId}
          onSelect={handleSelectFromList}
          onNewChat={() => setShowNewChat(true)}
          onlineUsers={onlineUsers}
        />
        <ChatArea
          messages={messages}
          selectedUser={selectedUser}
          currentUser={user}
          onSend={sendMessage}
          loading={loadingMessages}
          isOnline={selectedUser ? !!onlineUsers[selectedUser.user_id] : false}
        />
      </div>

      {showNewChat && (
        <NewConversation
          onClose={() => setShowNewChat(false)}
          onSelectUser={handleSelectFromModal}
        />
      )}
    </div>
  );
};

const styles = {
  page: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    background: '#f9fafb',
    padding: 20,
    overflow: 'hidden',
    minWidth: 0,
  },
  chatShell: {
    flex: 1,
    display: 'flex',
    background: '#fff',
    borderRadius: 14,
    border: '1px solid #e5e7eb',
    boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
    overflow: 'hidden',
    minHeight: 0,
  },
  offlineBanner: {
    background: '#fff7ed',
    color: '#c2410c',
    fontSize: 12,
    fontFamily: 'Inter, sans-serif',
    textAlign: 'center',
    padding: '6px 0',
    borderRadius: 8,
    marginBottom: 8,
    border: '1px solid #fed7aa',
  },
};

export default Messages;
