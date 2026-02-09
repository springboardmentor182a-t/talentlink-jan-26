import React from 'react';
import './Messages.css';

const Messages = () => {
  return (
    <div className="messages-page">
      <div className="messages-container">
        <div className="conversations-list">
          <h2>Conversations</h2>
          <p className="placeholder">Your conversations will appear here.</p>
        </div>

        <div className="chat-window">
          <div className="chat-header">
            <p>Select a conversation to start messaging</p>
          </div>
          <div className="chat-area">
            <p className="placeholder-center">Open a conversation to view messages</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;
