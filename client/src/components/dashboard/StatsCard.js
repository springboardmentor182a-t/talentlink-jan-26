import React from 'react';

const StatsCard = ({ title, value, icon: Icon, color, bgColor }) => {
  return (
    <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}>
      <div>
        <h4 style={{ margin: '0 0 8px 0', color: 'var(--muted-foreground)', fontSize: '0.875rem' }}>{title}</h4>
        <span style={{ fontSize: '2rem', fontWeight: 'bold' }}>{value}</span>
      </div>
      <div style={{
        backgroundColor: bgColor || 'var(--accent)',
        padding: '12px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {Icon && <Icon size={24} color={color || "var(--primary)"} />}
      </div>
    </div>
  );
};

export default StatsCard;
