import React from 'react';
import { Briefcase, FileText, DollarSign, Star } from 'lucide-react';

const StatsCard = ({ title, value, icon, colorClass }) => {
    const getIcon = () => {
        switch (icon) {
            case '💼': return <Briefcase size={24} />;
            case '📄': return <FileText size={24} />;
            case 'USD': return <DollarSign size={24} />;
            case '⭐': return <Star size={24} />;
            default: return icon;
        }
    };

    return (
        <div className="stats-card">
            <div className="stats-info">
                <h3>{title}</h3>
                <p className="stats-value">{value}</p>
            </div>
            <div className={`stats-icon-circle ${colorClass}`}>
                {getIcon()}
            </div>
        </div>
    );
};

export default StatsCard;
