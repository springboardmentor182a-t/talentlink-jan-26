// client/src/components/Dashboard/StatsCards.js
import React from "react";
import { DollarSign, Briefcase, Users, Star } from "lucide-react";

const StatsCards = ({ stats }) => {
  const cards = [
    {
      label: "Total Spent",
      value: `$${stats.total_spent.toLocaleString()}`,
      growth: "+18.2%",
      icon: <DollarSign size={24} className="text-white" />,
      bg: "bg-blue-500", // Blue icon background
    },
    {
      label: "Active Projects",
      value: stats.active_projects,
      growth: "+4",
      icon: <Briefcase size={24} className="text-white" />,
      bg: "bg-purple-500", // Purple icon background
    },
    {
      label: "Hired Freelancers",
      value: stats.hired_freelancers,
      growth: "+6",
      icon: <Users size={24} className="text-white" />,
      bg: "bg-orange-500", // Orange icon background
    },
    {
      label: "Avg Rating",
      value: stats.avg_rating,
      growth: "+0.3",
      icon: <Star size={24} className="text-white" />,
      bg: "bg-green-500", // Green icon background
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {cards.map((card, index) => (
        <div
          key={index}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between"
        >
          <div>
            <div
              className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${card.bg}`}
            >
              {card.icon}
            </div>
            <p className="text-gray-500 text-sm font-medium">{card.label}</p>
            <h3 className="text-2xl font-bold text-gray-800 mt-1">
              {card.value}
            </h3>
          </div>
          <span className="text-green-500 text-sm font-semibold bg-green-50 px-2 py-1 rounded-full">
            {card.growth}
          </span>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;
