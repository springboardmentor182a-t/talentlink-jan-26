import React from 'react';

const JobCard = ({ job, onApply }) => {
  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-4 hover:shadow-lg transition-shadow duration-300">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">{job.title}</h3>
          <p className="text-gray-600 mb-4 line-clamp-3">{job.description}</p>
        </div>
        <div className="text-right">
          <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-semibold uppercase tracking-wide">
            {job.status}
          </span>
          <p className="mt-2 text-lg font-bold text-gray-900">${job.budget}</p>
        </div>
      </div>
      <div className="flex justify-between items-center mt-4 border-t pt-4">
        <span className="text-sm text-gray-500">Posted on {new Date(job.created_at).toLocaleDateString()}</span>
        <button
          onClick={() => onApply(job.id)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200"
        >
          Apply Now
        </button>
      </div>
    </div>
  );
};

export default JobCard;
