import { useState, useEffect } from 'react';
import { useAuth } from '../features/hooks/useAuth';
import { useMessages } from '../features/hooks/useMessages';
import ConversationsList from '../features/components/ConversationsList';
import ChatArea from '../features/components/ChatArea';
import NewConversation from '../features/components/NewConversation';

const Messages = () => {
  const { user } = useAuth();
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showNewChat, setShowNewChat] = useState(false);

  const {
    conversations,
    messages,
    loadingMessages,
    sendMessage,
  } = useMessages(selectedUserId);

  // Keep selectedUser in sync when conversations load/update
  useEffect(() => {
    if (selectedUserId && conversations.length > 0) {
      const found = conversations.find(c => c.user_id === selectedUserId);
      if (found) setSelectedUser(found);
    }
  }, [conversations, selectedUserId]);

  // Called from ConversationsList — user object already in conversations
  const handleSelectFromList = (userId) => {
    setSelectedUserId(userId);
    const found = conversations.find(c => c.user_id === userId);
    if (found) setSelectedUser(found);
  };

  // Called from NewConversation modal — pass full user object directly
  const handleSelectFromModal = (userId, user) => {
    setSelectedUserId(userId);
    setSelectedUser(user);
    setShowNewChat(false);
  };

  return (
    <div style={styles.page}>
      <div style={styles.chatShell}>
        <ConversationsList
          conversations={conversations}
          selectedUserId={selectedUserId}
          onSelect={handleSelectFromList}
          onNewChat={() => setShowNewChat(true)}
        />
        <ChatArea
          messages={messages}
          selectedUser={selectedUser}
          currentUser={user}
          onSend={sendMessage}
          loading={loadingMessages}
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
};

export default Messages;
