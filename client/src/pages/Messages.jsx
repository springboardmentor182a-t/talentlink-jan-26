import React, { useState, useEffect } from 'react';

const Messages = () => {
  // 1. Setup State for our Database Data
  const [contacts, setContacts] = useState([]);
  const [activeContact, setActiveContact] = useState(null);
  const [loading, setLoading] = useState(true);

  // 2. Fetch from Backend on Component Load
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/messages/`);
        
        // If your backend endpoint isn't ready yet, this will safely catch it
        if (response.ok) {
            const data = await response.json();
            setContacts(data);
            if (data.length > 0) setActiveContact(data[0]); // Auto-select the first contact
        } else {
            setContacts([]);
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, []);

  if (loading) {
    return <div style={{ padding: '40px', height: '100vh', backgroundColor: 'white' }}>Loading your messages...</div>;
  }

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: 'white' }}>
      
      {/* Contact List Sidebar */}
      <div style={{ width: '350px', borderRight: '1px solid #E9ECEF', padding: '20px', display: 'flex', flexDirection: 'column' }}>
        <h2 style={{ marginBottom: '20px' }}>Messages</h2>
        <input 
          type="text" 
          placeholder="Search messages..." 
          style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #E9ECEF', marginBottom: '20px', boxSizing: 'border-box' }} 
        />
        
        <div style={{ overflowY: 'auto', flex: 1 }}>
            {contacts.length === 0 ? (
                <p style={{ color: '#6C757D', textAlign: 'center', marginTop: '20px' }}>No messages found.</p>
            ) : (
                contacts.map((c, i) => {
                  const isActive = activeContact?.name === c.name;
                  return (
                    <div 
                        key={i} 
                        onClick={() => setActiveContact(c)}
                        style={{ display: 'flex', padding: '15px', borderRadius: '12px', backgroundColor: isActive ? '#FFF5EE' : 'transparent', marginBottom: '10px', cursor: 'pointer' }}
                    >
                        <div style={{ width: '45px', height: '45px', borderRadius: '50%', backgroundColor: '#FF7A1A', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '15px', fontWeight: 'bold' }}>
                            {c.name ? c.name[0] : '?'}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ fontWeight: 'bold' }}>{c.name || 'Unknown User'}</span>
                                <span style={{ fontSize: '12px', color: '#6C757D' }}>{c.time || ''}</span>
                            </div>
                            <p style={{ margin: 0, fontSize: '13px', color: '#6C757D', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {c.msg || 'No recent messages'}
                            </p>
                        </div>
                    </div>
                  );
                })
            )}
        </div>
      </div>

      {/* Chat Window */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#F8F9FA' }}>
        {activeContact ? (
            <>
                {/* Chat Header */}
                <div style={{ padding: '20px', backgroundColor: 'white', borderBottom: '1px solid #E9ECEF' }}>
                    <h3 style={{ margin: 0 }}>{activeContact.name}</h3>
                    <p style={{ margin: 0, fontSize: '12px', color: '#6C757D' }}>{activeContact.project || 'Project Discussion'}</p>
                </div>

                {/* Chat History */}
                <div style={{ flex: 1, padding: '30px', overflowY: 'auto' }}>
                    
                    {/* Fallback to original dummy messages if the DB doesn't have a 'history' array yet to keep the UI looking nice for the PR */}
                    {(activeContact.history || []).length > 0 ? (
                        activeContact.history.map((msgItem, idx) => (
                            <div key={idx} style={{ marginBottom: '20px', maxWidth: '70%', marginLeft: msgItem.isMine ? 'auto' : '0' }}>
                                <div style={{ backgroundColor: msgItem.isMine ? '#FF7A1A' : 'white', color: msgItem.isMine ? 'white' : 'inherit', padding: '15px', borderRadius: msgItem.isMine ? '15px 15px 0 15px' : '15px 15px 15px 0', border: msgItem.isMine ? 'none' : '1px solid #E9ECEF' }}>
                                    {msgItem.text}
                                </div>
                                <span style={{ fontSize: '10px', color: '#999', marginTop: '5px', display: 'block', textAlign: msgItem.isMine ? 'right' : 'left' }}>{msgItem.time}</span>
                            </div>
                        ))
                    ) : (
                        <>
                            <div style={{ marginBottom: '20px', maxWidth: '70%' }}>
                                <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '15px 15px 15px 0', border: '1px solid #E9ECEF' }}>
                                    Hi! I wanted to check in on the progress of the homepage redesign.
                                </div>
                                <span style={{ fontSize: '10px', color: '#999', margin: '5px 0 0 5px', display: 'inline-block' }}>10:30 AM</span>
                            </div>

                            <div style={{ marginBottom: '20px', maxWidth: '70%', marginLeft: 'auto' }}>
                                <div style={{ backgroundColor: '#FF7A1A', color: 'white', padding: '15px', borderRadius: '15px 15px 0 15px' }}>
                                    Hello {activeContact.name.split(' ')[0]}! The homepage is coming along great. I'm about 80% done.
                                </div>
                                <span style={{ fontSize: '10px', color: '#999', display: 'block', textAlign: 'right', marginTop: '5px' }}>10:35 AM</span>
                            </div>
                        </>
                    )}
                </div>

                {/* Message Input Box */}
                <div style={{ padding: '20px', backgroundColor: 'white', display: 'flex', gap: '15px', borderTop: '1px solid #E9ECEF' }}>
                    <input type="text" placeholder="Type your message..." style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid #E9ECEF' }} />
                    <button style={{ backgroundColor: '#FF7A1A', color: 'white', border: 'none', padding: '10px 25px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>Send</button>
                </div>
            </>
        ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6C757D' }}>
                Select a conversation from the left to start chatting
            </div>
        )}
      </div>

    </div>
  );
};

export default Messages;