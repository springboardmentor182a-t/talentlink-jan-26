import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Chat() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const navigate = useNavigate();

    // Mock current user (In real app, get from Auth context)
    const currentUserId = 1;

    // Mock list of users to chat with
    const users = [
        { id: 2, name: 'Freelancer Bob', role: 'freelancer' },
        { id: 3, name: 'Client Alice', role: 'client' },
    ];

    useEffect(() => {
        if (selectedUser) {
            fetchMessages();
        }
    }, [selectedUser]);

    const fetchMessages = async () => {
        try {
            // Fetch messages between current user and selected user
            // Note: Backend endpoint mock is /messages/{user_id}?other_user_id={other_id}
            const response = await fetch(`http://localhost:8000/messages/${currentUserId}?other_user_id=${selectedUser.id}`);
            if (response.ok) {
                const data = await response.json();
                setMessages(data);
            }
        } catch (error) {
            console.error("Error fetching messages:", error);
        }
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim() || !selectedUser) return;

        try {
            const response = await fetch('http://localhost:8000/messages/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    sender_id: currentUserId,
                    receiver_id: selectedUser.id,
                    content: input,
                }),
            });

            if (response.ok) {
                setInput('');
                fetchMessages(); // Refresh messages
            }
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    return (
        <div style={{ display: 'flex', height: '100vh' }}>
            {/* Sidebar - User List */}
            <div style={{ width: '25%', borderRight: '1px solid #ccc', padding: '10px' }}>
                <h3>Contacts</h3>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                    {users.map(user => (
                        <li
                            key={user.id}
                            onClick={() => setSelectedUser(user)}
                            style={{
                                padding: '10px',
                                cursor: 'pointer',
                                background: selectedUser?.id === user.id ? '#f0f0f0' : 'transparent'
                            }}
                        >
                            {user.name} ({user.role})
                        </li>
                    ))}
                </ul>
            </div>

            {/* Main Chat Area */}
            <div style={{ width: '75%', display: 'flex', flexDirection: 'column' }}>
                {selectedUser ? (
                    <>
                        <div style={{ padding: '10px', borderBottom: '1px solid #ccc' }}>
                            <h3>Chat with {selectedUser.name}</h3>
                        </div>

                        <div style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
                            {messages.map((msg, index) => (
                                <div
                                    key={index}
                                    style={{
                                        textAlign: msg.sender_id === currentUserId ? 'right' : 'left',
                                        margin: '5px 0'
                                    }}
                                >
                                    <span style={{
                                        background: msg.sender_id === currentUserId ? '#007bff' : '#e9ecef',
                                        color: msg.sender_id === currentUserId ? 'white' : 'black',
                                        padding: '8px 12px',
                                        borderRadius: '15px',
                                        display: 'inline-block'
                                    }}>
                                        {msg.content}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <form onSubmit={sendMessage} style={{ padding: '20px', borderTop: '1px solid #ccc' }}>
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Type a message..."
                                style={{ width: '80%', padding: '10px' }}
                            />
                            <button type="submit" style={{ width: '15%', padding: '10px', marginLeft: '2%' }}>Send</button>
                        </form>
                    </>
                ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                        <p>Select a user to start chatting</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Chat;
