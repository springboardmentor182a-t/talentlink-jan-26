import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from '../../layout/Sidebar';
import Navbar from '../../layout/Navbar';
import { MessageSquare, Send } from 'lucide-react';
import api from '../../utils/api';
import './Dashboard.css';

const Messages = () => {
    const { search } = useLocation();
    const queryParams = new URLSearchParams(search);
    const userIdFromQuery = queryParams.get('userId');

    const [selectedChat, setSelectedChat] = useState(null);
    const [newMessage, setNewMessage] = useState("");
    const [conversations, setConversations] = useState([]);

    useEffect(() => {
        fetchConversations();
    }, []);

    useEffect(() => {
        if (userIdFromQuery && conversations.length > 0) {
            const userId = parseInt(userIdFromQuery);
            if (conversations.find(c => c.id === userId)) {
                setSelectedChat(userId);
            }
        }
    }, [userIdFromQuery, conversations]);

    const fetchConversations = async () => {
        try {
            const res = await api.get('/messages/conversations');
            setConversations(res.data);
        } catch (error) {
            console.error("Error fetching conversations:", error);
        }
    };

    const activeChat = conversations.find(c => c.id === selectedChat);

    useEffect(() => {
        if (selectedChat) {
            markRead(selectedChat);
        }
    }, [selectedChat]);

    const markRead = async (otherUserId) => {
        try {
            await api.post(`/messages/read/${otherUserId}`);
            // Optionally refresh conversations if we want the unread dot to disappear immediately
            // but it's often better to just update the local state if it's already selected.
            setConversations(prev => prev.map(c => 
                c.id === otherUserId ? { ...c, unread: false } : c
            ));
        } catch (error) {
            console.error("Error marking messages as read:", error);
        }
    };

    const handleSendMessage = async (e) => {
        if (e) e.preventDefault();
        if (!newMessage.trim() || !selectedChat) return;

        const textToSend = newMessage;
        setNewMessage("");

        try {
            await api.post('/messages', {
                receiver_id: selectedChat,
                content: textToSend
            });
            fetchConversations();
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
