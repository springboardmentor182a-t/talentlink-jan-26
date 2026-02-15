import React, { useState } from 'react';
import Sidebar from '../../layout/Sidebar';
import Navbar from '../../layout/Navbar';
import { Star, Briefcase, Edit2, X, Plus, Save } from 'lucide-react';
import './Dashboard.css';

const FreelancerProfile = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [newSkill, setNewSkill] = useState('');
    const [profileData, setProfileData] = useState({
        fullName: 'Alex Morgan',
        professionalTitle: 'Full Stack Developer',
        hourlyRate: '75',
        location: 'New York, NY',
        experience: '5+ years',
        email: 'demo-google@talentlink.com',
        bio: 'Experienced full-stack developer with 5+ years building modern web applications using React, Node.js, and cloud technologies.',
        skills: ['React', 'TypeScript', 'Node.js', 'Python', 'AWS', 'PostgreSQL']
    });

    const portfolio = [
        {
            title: 'E-commerce Platform',
            description: 'Built a scalable e-commerce platform handling 10k+ daily users'
        }
    ];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddSkill = () => {
        if (newSkill.trim() && !profileData.skills.includes(newSkill.trim())) {
            setProfileData(prev => ({
                ...prev,
                skills: [...prev.skills, newSkill.trim()]
            }));
            setNewSkill('');
        }
    };

    const handleRemoveSkill = (skillToRemove) => {
        setProfileData(prev => ({
            ...prev,
            skills: prev.skills.filter(skill => skill !== skillToRemove)
        }));
    };

    const handleSave = () => {
        setIsEditing(false);
    };

    const handleCancel = () => {
        setIsEditing(false);
    };

    return (
        <div className="dashboard-layout">
            <Navbar />
            <div className="dashboard-container">
                <Sidebar />
                <div className={`main-content scrollable ${isEditing ? 'with-footer' : ''}`}>
                    <div className="profile-content-wrapper">

                        {/* Alex Morgan Header Card */}
                        <div className="section-card profile-header-card">
                            <div className="profile-avatar-circle">
                                <span>{profileData.fullName.charAt(0)}</span>
                            </div>
                            <div className="profile-header-content">
                                <div className="profile-header-info">
                                    <h1 className="profile-name">{profileData.fullName}</h1>
                                    <p className="profile-title">{profileData.professionalTitle}</p>
                                    <div className="profile-stats-row">
                                        <div className="stat-item">
                                            <Star size={16} fill="#fbbf24" color="#fbbf24" />
                                            <span>4.8</span>
                                        </div>
                                        <div className="stat-item">
                                            <Briefcase size={16} />
                                            <span>15 projects</span>
                                        </div>
                                        <div className="stat-item">
                                            <span>${profileData.hourlyRate}/hr</span>
                                        </div>
                                    </div>
                                </div>
                                {!isEditing && (
                                    <div className="profile-header-actions">
                                        <button className="edit-profile-btn" onClick={() => setIsEditing(true)}>
                                            <Edit2 size={16} />
                                            <span>Edit Profile</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Basic Information Section */}
                        <div className="section-card">
                            <div className="section-header">
                                <h2>Basic Information</h2>
                            </div>

                            <div className="basic-info-grid">
                                <div className="info-field">
                                    <label>Full Name</label>
                                    <input
                                        type="text"
                                        name="fullName"
                                        value={profileData.fullName}
                                        onChange={handleInputChange}
                                        readOnly={!isEditing}
                                        className={`profile-input ${!isEditing ? 'readonly' : 'editable'}`}
                                    />
                                </div>
                                <div className="info-field">
                                    <label>Professional Title</label>
                                    <input
                                        type="text"
                                        name="professionalTitle"
                                        value={profileData.professionalTitle}
                                        onChange={handleInputChange}
                                        readOnly={!isEditing}
                                        className={`profile-input ${!isEditing ? 'readonly' : 'editable'}`}
                                    />
                                </div>
                                <div className="info-field">
                                    <label>Hourly Rate ($)</label>
                                    <input
                                        type="text"
                                        name="hourlyRate"
                                        value={profileData.hourlyRate}
                                        onChange={handleInputChange}
                                        readOnly={!isEditing}
                                        className={`profile-input ${!isEditing ? 'readonly' : 'editable'}`}
                                    />
                                </div>
                                <div className="info-field">
                                    <label>Location</label>
                                    <input
                                        type="text"
                                        name="location"
                                        value={profileData.location}
                                        onChange={handleInputChange}
                                        readOnly={!isEditing}
                                        className={`profile-input ${!isEditing ? 'readonly' : 'editable'}`}
                                    />
                                </div>
                                <div className="info-field">
                                    <label>Years of Experience</label>
                                    <input
                                        type="text"
                                        name="experience"
                                        value={profileData.experience}
                                        onChange={handleInputChange}
                                        readOnly={!isEditing}
                                        className={`profile-input ${!isEditing ? 'readonly' : 'editable'}`}
                                    />
                                </div>
                                <div className="info-field">
                                    <label>Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={profileData.email}
                                        onChange={handleInputChange}
                                        readOnly={!isEditing}
                                        className={`profile-input ${!isEditing ? 'readonly' : 'editable'}`}
                                    />
                                </div>
                            </div>

                            <div className="info-field bio-field">
                                <label>Bio</label>
                                {isEditing ? (
                                    <textarea
                                        name="bio"
                                        value={profileData.bio}
                                        onChange={handleInputChange}
                                        className="profile-textarea editable"
                                        rows="4"
                                    />
                                ) : (
                                    <div className="bio-container">
                                        <p className="bio-text">{profileData.bio}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Skills Section */}
                        <div className="section-card">
                            <div className="section-header">
                                <h2>Skills</h2>
                                <p>Add skills to help clients find you</p>
                            </div>

                            {isEditing && (
                                <div className="add-skill-row">
                                    <input
                                        type="text"
                                        placeholder="Add a skill"
                                        value={newSkill}
                                        onChange={(e) => setNewSkill(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                                        className="profile-input editable"
                                    />
                                    <button className="add-skill-btn" onClick={handleAddSkill}>
                                        <Plus size={18} />
                                    </button>
                                </div>
                            )}

                            <div className="skills-grid">
                                {profileData.skills.map((skill, index) => (
                                    <span key={index} className={`skill-tag ${isEditing ? 'editing' : ''}`}>
                                        {skill}
                                        {isEditing && (
                                            <button className="remove-skill-btn" onClick={() => handleRemoveSkill(skill)}>
                                                <X size={12} />
                                            </button>
                                        )}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Portfolio Section */}
                        <div className="section-card">
                            <div className="section-header flex-between">
                                <div>
                                    <h2>Portfolio</h2>
                                    <p>Showcase your best work</p>
                                </div>
                                {isEditing && (
                                    <button className="add-project-btn">
                                        <Plus size={16} />
                                        <span>Add Project</span>
                                    </button>
                                )}
                            </div>
                            <div className="portfolio-wrapper">
                                {portfolio.map((project, index) => (
                                    <div key={index} className="portfolio-project-card">
                                        <h3>{project.title}</h3>
                                        <p>{project.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>

                {/* Action Footer */}
                {isEditing && (
                    <div className="profile-action-footer">
                        <button className="save-changes-btn" onClick={handleSave}>
                            <Save size={18} />
                            <span>Save Changes</span>
                        </button>
                        <button className="cancel-btn" onClick={handleCancel}>
                            <span>Cancel</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FreelancerProfile;
