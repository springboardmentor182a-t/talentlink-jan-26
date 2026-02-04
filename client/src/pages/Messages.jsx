import React from 'react';

const Messages = () => {
  const contacts = [
    { name: 'Emma Creight', msg: 'Thanks for the update!', time: '5m', active: true },
    { name: 'Alex Roy', msg: 'Can we schedule a call?', time: '1h', active: false },
    { name: 'Maria Smith', msg: 'I have reviewed the designs.', time: '3h', active: false }
  ];

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: 'white' }}>
      {/* Contact List Sidebar */}
      <div style={{ width: '350px', borderRight: '1px solid #E9ECEF', padding: '20px' }}>
        <h2 style={{ marginBottom: '20px' }}>Messages</h2>
        <input type="text" placeholder="Search messages..." style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #E9ECEF', marginBottom: '20px' }} />
        {contacts.map((c, i) => (
          <div key={i} style={{ display: 'flex', padding: '15px', borderRadius: '12px', backgroundColor: c.active ? '#FFF5EE' : 'transparent', marginBottom: '10px', cursor: 'pointer' }}>
            <div style={{ width: '45px', height: '45px', borderRadius: '50%', backgroundColor: '#FF7A1A', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '15px', fontWeight: 'bold' }}>{c.name[0]}</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 'bold' }}>{c.name}</span>
                <span style={{ fontSize: '12px', color: '#6C757D' }}>{c.time}</span>
              </div>
              <p style={{ margin: 0, fontSize: '13px', color: '#6C757D', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.msg}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Chat Window */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#F8F9FA' }}>
        <div style={{ padding: '20px', backgroundColor: 'white', borderBottom: '1px solid #E9ECEF' }}>
          <h3 style={{ margin: 0 }}>Emma Creight</h3>
          <p style={{ margin: 0, fontSize: '12px', color: '#6C757D' }}>Website Redesign Project</p>
        </div>

        <div style={{ flex: 1, padding: '30px', overflowY: 'auto' }}>
          <div style={{ marginBottom: '20px', maxWidth: '70%' }}>
            <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '15px 15px 15px 0', border: '1px solid #E9ECEF' }}>
              Hi! I wanted to check in on the progress of the homepage redesign.
            </div>
            <span style={{ fontSize: '10px', color: '#999', marginLeft: '5px' }}>10:30 AM</span>
          </div>

          <div style={{ marginBottom: '20px', maxWidth: '70%', marginLeft: 'auto' }}>
            <div style={{ backgroundColor: '#FF7A1A', color: 'white', padding: '15px', borderRadius: '15px 15px 0 15px' }}>
              Hello Emma! The homepage is coming along great. I'm about 80% done.
            </div>
            <span style={{ fontSize: '10px', color: '#999', display: 'block', textAlign: 'right', marginRight: '5px' }}>10:35 AM</span>
          </div>
        </div>

        <div style={{ padding: '20px', backgroundColor: 'white', display: 'flex', gap: '15px' }}>
          <input type="text" placeholder="Type your message..." style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid #E9ECEF' }} />
          <button style={{ backgroundColor: '#FF7A1A', color: 'white', border: 'none', padding: '10px 25px', borderRadius: '10px', fontWeight: 'bold' }}>Send</button>
        </div>
      </div>
    </div>
  );
};

export default Messages;