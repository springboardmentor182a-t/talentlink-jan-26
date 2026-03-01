import React, { useEffect, useState, useRef } from 'react';
import './Messages.css';
import { getConversations, getMessages, sendMessage } from '../../../features/messages/service';

const Messages = () => {
  const [conversations, setConversations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    getConversations().then((data) => {
      if (!mounted) return;
      setConversations(data);
      if (data.length) setSelected(data[0].id);
    });
    return () => (mounted = false);
  }, []);

  useEffect(() => {
    if (selected == null) return;
    let mounted = true;
    getMessages(selected).then((data) => {
      if (!mounted) return;
      setMessages(data);
      scrollToBottom();
    });
    return () => (mounted = false);
  }, [selected]);

  const scrollToBottom = () => {
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  };

  const handleSend = async () => {
    if (!input.trim() || !selected || sending) return;
    
    setSending(true);
    const messageText = input.trim();
    setInput('');
    
    // Optimistic update
    const newMsg = {
      id: `m-${Date.now()}`,
      sender: 'me',
      text: messageText,
      timestamp: new Date().toISOString(),
    };
    setMessages((m) => [...m, newMsg]);
    scrollToBottom();
    
    // Send to backend
    try {
      await sendMessage(selected, messageText);
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="messages-page">
      <div className="messages-container">
        <div className="conversations-list">
          <h2>Messages</h2>
          {conversations.length === 0 && <p className="placeholder">No conversations yet.</p>}
          {conversations.map((c) => (
            <div
              key={c.id}
              className={`conversation-item ${selected === c.id ? 'active' : ''}`}
              onClick={() => setSelected(c.id)}
            >
              <div className="conv-left">
                <div className="avatar" />
                <div>
                  <div className="conv-name">{c.name}</div>
                  <div className="conv-sub">{c.lastMessage}</div>
                </div>
              </div>
              <div className="conv-right">{c.unread > 0 ? <span className="badge">{c.unread}</span> : null}</div>
            </div>
          ))}
        </div>

        <div className="chat-window">
          <div className="chat-header">
            <p>{conversations.find((x) => x.id === selected)?.name || 'Select a conversation'}</p>
          </div>

          <div className="chat-area">
            {selected == null ? (
              <p className="placeholder-center">Open a conversation to view messages</p>
            ) : (
              <div className="messages-list">
                {messages.map((m) => (
                  <div key={m.id} className={`message-row ${m.sender === 'me' ? 'sent' : 'received'}`}>
                    <div className="message-bubble">{m.text}</div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          <div className="chat-input">
            <input
              type="text"
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <button onClick={handleSend} className="send-btn">Send</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;
