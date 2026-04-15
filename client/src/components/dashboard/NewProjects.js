import React from 'react';

const NewProjects = ({ jobs }) => {
    // Demo data to match the image if no real data
    const demoJobs = [
        { id: 101, title: 'Build a React E-commerce Platform', budget: '8,000', duration: '2-3 months' },
        { id: 102, title: 'Python Data Analysis Tool', budget: '4,500', duration: '1-2 months' },
        { id: 103, title: 'Mobile App Development (iOS & Android)', budget: '12,000', duration: '3-6 months' },
    ];

    const displayJobs = jobs.length > 0 ? jobs : demoJobs;

    return (
        <div className="section-card">
            <div className="section-header">
                <h2>New Projects</h2>
                <p>Recently posted opportunities</p>
            </div>

            <div className="projects-list">
                {displayJobs.map(job => (
                    <div key={job.id} className="list-item">
                        <span className="item-title" style={{ fontWeight: 600, fontSize: '15px', marginBottom: '8px', display: 'block' }}>{job.title}</span>
                        <div className="item-details" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#6b7280' }}>
                            <span className="budget" style={{ fontWeight: 500 }}>${typeof job.budget === 'number' ? job.budget.toLocaleString() : job.budget}</span>
                            <span className="duration">{job.duration || "1-3 months"}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default NewProjects;
