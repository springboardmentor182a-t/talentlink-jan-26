import React, { useState } from 'react';
import Sidebar from '../../layout/Sidebar';
import Navbar from '../../layout/Navbar';
import { MessageSquare, Send } from 'lucide-react';
import './Dashboard.css';

const Messages = () => {
    const [selectedChat, setSelectedChat] = useState(null);
    const [newMessage, setNewMessage] = useState("");

    const [conversations, setConversations] = useState([
        {
            id: 1,
            name: "Tech Solutions Inc.",
            project: "Build a React E-commerce Platform",
            lastMessage: "I have started working on the initial setup.",
            initial: "T",
            timestamp: "2h ago",
            unread: false,
            messages: [
                { id: 1, sender: 'client', text: "Hello Alex, glad to have you on board.", time: "08:30" },
                { id: 2, sender: 'me', text: "I have started working on the initial setup.", time: "09:00" }
            ]
        }
    ]);

    const activeChat = conversations.find(c => c.id === selectedChat);

    const handleSendMessage = (e) => {
        if (e) e.preventDefault();
        if (!newMessage.trim() || !selectedChat) return;

        const now = new Date();
        const currentTime = now.getHours().toString().padStart(2, '0') + ":" +
            now.getMinutes().toString().padStart(2, '0');

        const updatedConversations = conversations.map(chat => {
            if (chat.id === selectedChat) {
                return {
                    ...chat,
                    lastMessage: newMessage,
                    timestamp: "Just now",
                    messages: [
                        ...chat.messages,
                        {
                            id: Date.now(),
                            sender: 'me',
                            text: newMessage,
                            time: currentTime
                        }
                    ]
                };
            }
            return chat;
        });

        setConversations(updatedConversations);
        setNewMessage("");
    };

    return (
        <div className="dashboard-layout">
            <Navbar />
            <div className="dashboard-container">
                <Sidebar />
                <div className="main-content scrollable">
                    <div className="messages-header">
                        <h1 className="page-title">Messages</h1>
                        <p className="page-subtitle">Communicate securely with your contacts</p>
                    </div>

                    <div className="messages-container-panel">
                        <div className="conversations-sidebar">
                            <div className="conversations-header-row">
                                <h2 className="conversations-title">Conversations</h2>
                            </div>

                            <div className="conversations-list">
                                {conversations.map((chat) => (
                                    <div
                                        key={chat.id}
                                        className={`conversation-item ${selectedChat === chat.id ? 'active' : ''}`}
                                        onClick={() => setSelectedChat(chat.id)}
                                    >
                                        <div className="chat-avatar-circle">
                                            {chat.initial}
                                        </div>
                                        <div className="chat-info">
                                            <div className="chat-name-row">
                                                <span className="chat-name">{chat.name}</span>
                                            </div>
                                            <div className="chat-project-title">{chat.project}</div>
                                            <div className="chat-snippet">{chat.lastMessage}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="chat-main-area">
                            {!selectedChat ? (
                                <div className="chat-empty-state">
                                    <MessageSquare size={64} className="empty-chat-icon" strokeWidth={1} />
                                    <p className="empty-chat-text">Select a conversation to start messaging</p>
                                </div>
                            ) : (
                                <div className="chat-active-window">
                                    <div className="chat-window-header">
                                        <div className="chat-avatar-circle mini">
                                            {activeChat.initial}
                                        </div>
                                        <div className="chat-header-info">
                                            <div className="chat-header-name">{activeChat.name}</div>
                                            <div className="chat-header-project">{activeChat.project}</div>
                                        </div>
                                    </div>

                                    <div className="chat-messages-scroll-area">
                                        {activeChat.messages.map((msg) => (
                                            <div key={msg.id} className={`message-bubble-row ${msg.sender === 'me' ? 'right' : 'left'}`}>
                                                <div className={`message-bubble ${msg.sender === 'me' ? 'me' : 'client'}`}>
                                                    <div className="message-text">{msg.text}</div>
                                                    <div className="message-time">{msg.time}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <form className="chat-input-area" onSubmit={handleSendMessage}>
                                        <input
                                            type="text"
                                            className="chat-input-field"
                                            placeholder="Type your message..."
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                        />
                                        <button type="submit" className="chat-send-btn">
                                            <Send size={18} />
                                        </button>
                                    </form>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Messages;
