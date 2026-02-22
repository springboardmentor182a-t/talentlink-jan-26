// client/src/components/Dashboard/RecentActivity.js
import React from "react";

const RecentActivity = ({ activities }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full">
      <h3 className="text-lg font-bold text-gray-800 mb-6">Recent Activity</h3>
      <div className="space-y-6">
        {activities.map((item) => (
          <div key={item.id} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
              <div className="w-0.5 h-full bg-gray-100 mt-2"></div>
            </div>
            <div>
              <p className="text-sm text-gray-800 font-medium">
                {item.description}
              </p>
              <p className="text-xs text-gray-400 mt-1">{item.time_ago}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivity;
