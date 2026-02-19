import React from 'react';

const Contracts = () => {
  const contracts = [
    { id: 'CT-2024-001', title: 'Website Redesign Project', client: 'Emma Creight', budget: '$12,000', status: 'Active', color: '#28A745' },
    { id: 'CT-2024-002', title: 'Mobile App Development', client: 'Alexander Roy', budget: '$25,000', status: 'Pending Sign', color: '#FF7A1A' },
    { id: 'CT-2024-003', title: 'Brand Identity Design', client: 'Evelyn Stanley', budget: '$9,500', status: 'Draft', color: '#6C757D' }
  ];

  return (
    <div style={{ padding: '40px', backgroundColor: '#F8F9FA', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>Contracts</h1>
        <button style={{ backgroundColor: '#FF7A1A', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold' }}>+ New Contract</button>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '30px' }}>
        {['All', 'Active', 'Draft', 'Pending', 'Completed'].map((tab) => (
          <button key={tab} style={{ padding: '8px 20px', borderRadius: '20px', border: '1px solid #E9ECEF', backgroundColor: tab === 'All' ? '#FF7A1A' : 'white', color: tab === 'All' ? 'white' : '#6C757D', cursor: 'pointer' }}>{tab}</button>
        ))}
      </div>

      {/* Contracts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '25px' }}>
        {contracts.map((item) => (
          <div key={item.id} style={{ backgroundColor: 'white', padding: '25px', borderRadius: '15px', border: '1px solid #E9ECEF', position: 'relative' }}>
            <span style={{ position: 'absolute', top: '20px', right: '20px', fontSize: '12px', padding: '4px 10px', borderRadius: '5px', backgroundColor: '#F8F9FA', color: item.color, border: `1px solid ${item.color}` }}>{item.status}</span>
            <h4 style={{ margin: '0 0 10px 0' }}>{item.title}</h4>
            <p style={{ fontSize: '12px', color: '#6C757D' }}>{item.id}</p>
            <hr style={{ border: 'none', borderTop: '1px solid #EEE', margin: '20px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '20px' }}>
              <span style={{ color: '#6C757D' }}>Budget:</span>
              <span style={{ fontWeight: 'bold' }}>{item.budget}</span>
            </div>
            <button style={{ width: '100%', padding: '10px', border: '1px solid #FF7A1A', color: '#FF7A1A', backgroundColor: 'transparent', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>View Details →</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Contracts;