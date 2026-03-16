import React from 'react';

const RecentProjects = ({ projects }) => {
    const getStatusStyle = (status) => {
        switch (status) {
            case 'open':
                return { backgroundColor: '#dcfce7', color: '#166534' }; // Green
            case 'in progress':
                return { backgroundColor: '#dbeafe', color: '#1e40af' }; // Blue
            case 'completed':
                return { backgroundColor: '#f3f4f6', color: '#374151' }; // Gray
            default:
                return { backgroundColor: '#f3f4f6', color: '#374151' };
        }
    };

    return (
        <div className="card">
            <h3 style={{ marginTop: 0 }}>Recent Projects</h3>
            <p style={{ color: 'var(--muted-foreground)', marginBottom: '20px' }}>Your most recently posted projects</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {projects.map((project) => (
                    <div key={project.id} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderBottom: '1px solid var(--border)',
                        paddingBottom: '16px'
                    }}>
                        <div>
                            <h4 style={{ margin: '0 0 4px 0' }}>{project.title}</h4>
                            <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>{project.category}</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ marginBottom: '4px', fontWeight: 'bold' }}>{project.budget}</div>
                            <span style={{
                                padding: '4px 8px',
                                borderRadius: '12px',
                                fontSize: '0.75rem',
                                textTransform: 'capitalize',
                                ...getStatusStyle(project.status)
                            }}>
                                {project.status}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RecentProjects;
