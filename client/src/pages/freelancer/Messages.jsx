import React, { useState, useEffect, useContext, useCallback } from 'react';
import api from '../../utils/api';
import Sidebar from '../../layout/Sidebar';
import Navbar from '../../layout/Navbar';
import { MessageSquare, Send } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import './Dashboard.css';

const Messages = () => {
    const { token, user } = useContext(AuthContext);
    const [selectedChat, setSelectedChat] = useState(null);
    const [newMessage, setNewMessage] = useState("");
    const [conversations, setConversations] = useState([]);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchConversations = useCallback(async () => {
        try {
            const response = await api.get('/messages/conversations');
            setConversations(response.data.map(c => ({
                id: c.other_user_id,
                name: c.other_user_name,
                initial: c.other_user_name.charAt(0).toUpperCase(),
                lastMessage: c.last_message,
                timestamp: new Date(c.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                project: "TalentLink Chat"
            })));
        } catch (error) {
            console.error("Error fetching conversations:", error);
        } finally {
            setLoading(false);
        }
    }, [token]);

    const fetchMessages = useCallback(async (otherUserId) => {
        try {
            const response = await api.get(`/messages/${otherUserId}`);
            setMessages(response.data.map(m => ({
                id: m.id,
                sender: m.sender_id === user.id ? 'me' : 'other',
                text: m.content,
                time: new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            })));
        } catch (error) {
            console.error("Error fetching messages:", error);
        }
    }, [token, user]);

    useEffect(() => {
        if (token) {
            fetchConversations();
        }
    }, [token, fetchConversations]);

    useEffect(() => {
        if (selectedChat) {
            fetchMessages(selectedChat);
            const interval = setInterval(() => fetchMessages(selectedChat), 5000); // Poll for new messages
            return () => clearInterval(interval);
        }
    }, [selectedChat, fetchMessages]);

    const activeChat = conversations.find(c => c.id === selectedChat);

    const handleSendMessage = async (e) => {
        if (e) e.preventDefault();
        if (!newMessage.trim() || !selectedChat) return;

        try {
            const response = await api.post('/messages/', {
                receiver_id: selectedChat,
                content: newMessage
            });
            
            const sentMsg = {
                id: response.data.id,
                sender: 'me',
                text: response.data.content,
                time: new Date(response.data.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            
            setMessages([...messages, sentMsg]);
            setNewMessage("");
            fetchConversations(); // Update snippet in sidebar
        } catch (error) {
            console.error("Error sending message:", error);
        }
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
                                            {activeChat?.initial}
                                        </div>
                                        <div className="chat-header-info">
                                            <div className="chat-header-name">{activeChat?.name}</div>
                                            <div className="chat-header-project">{activeChat?.project}</div>
                                        </div>
                                    </div>

                                    <div className="chat-messages-scroll-area">
                                        {messages.map((msg) => (
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
