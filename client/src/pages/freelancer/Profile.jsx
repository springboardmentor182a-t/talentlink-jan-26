import React, { useState, useContext, useEffect } from 'react';
import api from '../../utils/api';
import Sidebar from '../../layout/Sidebar';
import Navbar from '../../layout/Navbar';
import { Star, Briefcase, Edit2, X, Plus, Save } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import './Dashboard.css';

const FreelancerProfile = () => {
    const { user, token } = useContext(AuthContext);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [newSkill, setNewSkill] = useState('');
    const [profileData, setProfileData] = useState({
        fullName: '',
        professionalTitle: '',
        hourlyRate: '0',
        location: '',
        experience: 'Less than 1 year',
        email: '',
        bio: '',
        skills: []
    });
    const [portfolio, setPortfolio] = useState([]);
    const [isAddingProject, setIsAddingProject] = useState(false);
    const [newProject, setNewProject] = useState({
        title: '',
        description: '',
        link: '',
        image_url: ''
    });

    const fetchPortfolio = async () => {
        try {
            const response = await api.get('/portfolio/');
            setPortfolio(response.data);
        } catch (error) {
            console.error("Error fetching portfolio:", error);
        }
    };

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await api.get('/auth/profile');
                setProfileData(response.data);
            } catch (error) {
                console.error("Error fetching profile:", error);
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchProfile();
            fetchPortfolio();
        }
    }, [token]);

    const handleAddProject = async () => {
        if (!newProject.title.trim()) return;
        try {
            const response = await api.post('/portfolio/', newProject);
            setPortfolio([...portfolio, response.data]);
            setIsAddingProject(false);
            setNewProject({ title: '', description: '', link: '', image_url: '' });
        } catch (error) {
            console.error("Error adding portfolio project:", error);
        }
    };

    const handleDeleteProject = async (id) => {
        try {
            await api.delete(`/portfolio/${id}`);
            setPortfolio(portfolio.filter(p => p.id !== id));
        } catch (error) {
            console.error("Error deleting portfolio project:", error);
        }
    };

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

    const handleSave = async () => {
        try {
            const response = await api.put('/auth/profile', profileData);
            setProfileData(response.data);
            setIsEditing(false);
        } catch (error) {
            console.error("Error updating profile:", error);
            alert("Failed to save changes. Please try again.");
        }
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
                    {loading ? (
                        <div className="loading-container">Loading profile...</div>
                    ) : (
                        <div className="profile-content-wrapper">

                            {/* Alex Morgan Header Card */}
                            <div className="section-card profile-header-card">
                                <div className="profile-avatar-circle">
                                    <span>{(profileData.fullName || 'U').charAt(0)}</span>
                                </div>
                                <div className="profile-header-content">
                                    <div className="profile-header-info">
                                        <h1 className="profile-name">{profileData.fullName}</h1>
                                        <p className="profile-title">{profileData.professionalTitle}</p>
                                        <div className="profile-stats-row">
                                            <div className="stat-item">
                                                <Star size={16} fill="#fbbf24" color="#fbbf24" />
                                                <span>0.0</span>
                                            </div>
                                            <div className="stat-item">
                                                <Briefcase size={16} />
                                                <span>0 projects</span>
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
                                            value={profileData.professionalTitle || ''}
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
                                            value={profileData.location || ''}
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
                                            value={profileData.bio || ''}
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
                                    {profileData.skills && profileData.skills.length > 0 ? (
                                        profileData.skills.map((skill, index) => (
                                            <span key={index} className={`skill-tag ${isEditing ? 'editing' : ''}`}>
                                                {skill}
                                                {isEditing && (
                                                    <button className="remove-skill-btn" onClick={() => handleRemoveSkill(skill)}>
                                                        <X size={12} />
                                                    </button>
                                                )}
                                            </span>
                                        ))
                                    ) : (
                                        !isEditing && <p className="no-skills">No skills added yet.</p>
                                    )}
                                </div>
                            </div>

                            <div className="section-card">
                                <div className="section-header flex-between">
                                    <div>
                                        <h2>Portfolio</h2>
                                        <p>Showcase your best work</p>
                                    </div>
                                    {!isAddingProject && isEditing && (
                                        <button className="add-project-btn" onClick={() => setIsAddingProject(true)}>
                                            <Plus size={16} />
                                            <span>Add Project</span>
                                        </button>
                                    )}
                                </div>

                                {isAddingProject && (
                                    <div className="add-project-form mt-24">
                                        <div className="info-field">
                                            <label>Project Title *</label>
                                            <input
                                                type="text"
                                                className="profile-input editable"
                                                value={newProject.title}
                                                onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                                            />
                                        </div>
                                        <div className="info-field mt-16">
                                            <label>Description</label>
                                            <textarea
                                                className="profile-textarea editable"
                                                rows="3"
                                                value={newProject.description}
                                                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                                            />
                                        </div>
                                        <div className="info-field mt-16">
                                            <label>Project Link (URL)</label>
                                            <input
                                                type="text"
                                                className="profile-input editable"
                                                value={newProject.link}
                                                onChange={(e) => setNewProject({ ...newProject, link: e.target.value })}
                                            />
                                        </div>
                                        <div className="edit-actions mt-24">
                                            <button className="save-changes-btn" onClick={handleAddProject}>Add to Portfolio</button>
                                            <button className="cancel-btn" onClick={() => setIsAddingProject(false)}>Cancel</button>
                                        </div>
                                    </div>
                                )}

                                <div className="portfolio-wrapper">
                                    {portfolio.length > 0 ? (
                                        <div className="portfolio-grid-flex">
                                            {portfolio.map((project) => (
                                                <div key={project.id} className="portfolio-project-card">
                                                    <div className="flex-between">
                                                        <h3>{project.title}</h3>
                                                        {isEditing && (
                                                            <button className="remove-skill-btn" onClick={() => handleDeleteProject(project.id)}>
                                                                <X size={16} />
                                                            </button>
                                                        )}
                                                    </div>
                                                    <p>{project.description}</p>
                                                    {project.link && (
                                                        <a href={project.link} target="_blank" rel="noopener noreferrer" className="project-link-text">
                                                            View Project External
                                                        </a>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        !isAddingProject && <p className="no-portfolio">No portfolio projects added yet.</p>
                                    )}
                                </div>
                            </div>

                        </div>
                    )}
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
