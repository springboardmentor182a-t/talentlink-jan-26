import React, { useState, useEffect } from 'react';

const Contracts = () => {
  // 1. Set up state for database data
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);

  // 2. Fetch data from backend when component loads
  useEffect(() => {
    const fetchContracts = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/contracts/`);
        const data = await response.json();
        setContracts(data);
      } catch (error) {
        console.error("Error fetching contracts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchContracts();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '40px', backgroundColor: '#F8F9FA', minHeight: '100vh' }}>
        Loading contracts...
      </div>
    );
  }

  return (
    <div style={{ padding: '40px', backgroundColor: '#F8F9FA', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>Contracts</h1>
        <button style={{ backgroundColor: '#FF7A1A', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold' }}>
          + New Contract
        </button>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '30px' }}>
        {['All', 'Active', 'Draft', 'Pending', 'Completed'].map((tab) => (
          <button 
            key={tab} 
            style={{ 
              padding: '8px 20px', 
              borderRadius: '20px', 
              border: '1px solid #E9ECEF', 
              backgroundColor: tab === 'All' ? '#FF7A1A' : 'white', 
              color: tab === 'All' ? 'white' : '#6C757D', 
              cursor: 'pointer' 
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Contracts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '25px' }}>
        {contracts.map((item, index) => {
          // Fallbacks to keep the UI looking good even if DB is missing some fields right now
          const statusColor = item.color || '#28A745';
          const displayId = item.id || `CT-2024-00${index + 1}`;
          const displayStatus = item.status || 'Active';
          const displayBudget = item.budget || 'TBD';

          return (
            <div key={displayId} style={{ backgroundColor: 'white', padding: '25px', borderRadius: '15px', border: '1px solid #E9ECEF', position: 'relative' }}>
              
              <span style={{ position: 'absolute', top: '20px', right: '20px', fontSize: '12px', padding: '4px 10px', borderRadius: '5px', backgroundColor: '#F8F9FA', color: statusColor, border: `1px solid ${statusColor}` }}>
                {displayStatus}
              </span>
              
              <h4 style={{ margin: '0 0 10px 0' }}>{item.title}</h4>
              <p style={{ fontSize: '12px', color: '#6C757D', margin: 0 }}>{displayId}</p>
              
              <hr style={{ border: 'none', borderTop: '1px solid #EEE', margin: '20px 0' }} />
              
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '20px' }}>
                <span style={{ color: '#6C757D' }}>Budget:</span>
                <span style={{ fontWeight: 'bold' }}>{displayBudget}</span>
              </div>
              
              <button style={{ width: '100%', padding: '10px', border: '1px solid #FF7A1A', color: '#FF7A1A', backgroundColor: 'transparent', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                View Details -&gt;
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Contracts;