import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../layout/Sidebar';
import Navbar from '../../layout/Navbar';
import { Search, Clock, DollarSign, ChevronDown, Check } from 'lucide-react';
import { allProjects } from '../../data/mockProjects';
import './Dashboard.css';

const CustomDropdown = ({ label, options, value, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="filter-field" ref={dropdownRef}>
            <label>{label}</label>
            <div className="custom-select-wrapper">
                <div
                    className={`custom-select-trigger ${isOpen ? 'open' : ''}`}
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <span>{value}</span>
                    <ChevronDown size={18} className={`select-icon ${isOpen ? 'rotate' : ''}`} />
                </div>
                {isOpen && (
                    <div className="custom-options-container">
                        {options.map((option) => (
                            <div
                                key={option}
                                className={`custom-option ${value === option ? 'selected' : ''}`}
                                onClick={() => {
                                    onChange(option);
                                    setIsOpen(false);
                                }}
                            >
                                <span>{option}</span>
                                {value === option && <Check size={16} className="check-icon" />}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const BrowseProjects = () => {
    const navigate = useNavigate();
    const [filters, setFilters] = useState({
        search: '',
        budgetRange: 'All Budgets',
        duration: 'All Durations',
        skill: 'All Skills'
    });

    const budgetOptions = ['All Budgets', 'Under $2,000', '$2,000 - $5,000', '$5,000+'];
    const durationOptions = [
        'All Durations', '1-2 weeks', '2-4 weeks', '1-2 months',
        '2-3 months', '3-6 months', '6+ months'
    ];
    const skillOptions = [
        'All Skills', 'React', 'TypeScript', 'Node.js', 'Stripe', 'Figma',
        'UI Design', 'UX Research', 'Mobile Design', 'WordPress', 'PHP',
        'SEO', 'CSS', 'Next.js', 'Tailwind CSS', 'GraphQL', 'Java', 'PostgreSQL', 'Python', 'Pandas', 'Data Visualization', 'SQL', 'React Native', 'Firebase', 'API Integration', 'Mobile UI'
    ];

    const filteredProjects = useMemo(() => {
        return allProjects.filter(project => {
            // Search filter
            const matchesSearch = project.title.toLowerCase().includes(filters.search.toLowerCase()) ||
                project.description.toLowerCase().includes(filters.search.toLowerCase());

            // Skill filter
            const matchesSkill = filters.skill === 'All Skills' || project.skills.includes(filters.skill);

            // Duration filter
            const matchesDuration = filters.duration === 'All Durations' || project.duration === filters.duration;

            // Budget filter
            let matchesBudget = true;
            const numericBudget = project.numericBudget || parseInt(project.budget.replace(/[$,]/g, ''));

            if (filters.budgetRange === 'Under $2,000') {
                matchesBudget = numericBudget < 2000;
            } else if (filters.budgetRange === '$2,000 - $5,000') {
                matchesBudget = numericBudget >= 2000 && numericBudget <= 5000;
            } else if (filters.budgetRange === '$5,000+') {
                matchesBudget = numericBudget > 5000;
            }

            return matchesSearch && matchesSkill && matchesDuration && matchesBudget;
        });
    }, [filters]);

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleSubmitProposal = (projectId) => {
        navigate(`/freelancer/submit-proposal/${projectId}`);
    };

    return (
        <div className="dashboard-layout">
            <Navbar />
            <div className="dashboard-container">
                <Sidebar />
                <div className="main-content scrollable">
                    <div className="browse-projects-header">
                        <h1 className="page-title">Browse Projects</h1>
                        <p className="page-subtitle">Find and apply for projects that match your skills</p>
                    </div>

                    <div className="section-card filters-card">
                        <div className="filters-header">
                            <Search size={20} className="filter-icon" />
                            <span>Filters</span>
                        </div>
                        <div className="filters-grid">
                            <div className="filter-field">
                                <label>Search</label>
                                <div className="search-input-wrapper">
                                    <Search size={18} className="search-icon-inner" />
                                    <input
                                        type="text"
                                        placeholder="Search projects..."
                                        className="filter-input"
                                        value={filters.search}
                                        onChange={(e) => handleFilterChange('search', e.target.value)}
                                    />
                                </div>
                            </div>

                            <CustomDropdown
                                label="Budget Range"
                                options={budgetOptions}
                                value={filters.budgetRange}
                                onChange={(val) => handleFilterChange('budgetRange', val)}
                            />

                            <CustomDropdown
                                label="Duration"
                                options={durationOptions}
                                value={filters.duration}
                                onChange={(val) => handleFilterChange('duration', val)}
                            />

                            <CustomDropdown
                                label="Skill"
                                options={skillOptions}
                                value={filters.skill}
                                onChange={(val) => handleFilterChange('skill', val)}
                            />
                        </div>
                    </div>

                    <div className="projects-found-count">
                        {filteredProjects.length} projects found
                    </div>

                    <div className="projects-list">
                        {filteredProjects.length > 0 ? (
                            filteredProjects.map(project => (
                                <ProjectCard
                                    key={project.id}
                                    project={project}
                                    onApply={() => handleSubmitProposal(project.id)}
                                />
                            ))
                        ) : (
                            <div className="no-projects-found">
                                <p>No projects match your current filters.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const ProjectCard = ({ project, onApply }) => (
    <div className="section-card project-browse-card">
        <div className="project-header">
            <div className="project-title-row">
                <h2 className="project-title">{project.title}</h2>
                <span className="status-badge open">Open</span>
            </div>
            <p className="project-description-browse">{project.description}</p>
            <div className="skills-row">
                {project.skills.map((skill, index) => (
                    <span key={index} className="skill-tag-blue">{skill}</span>
                ))}
            </div>
        </div>
        <div className="project-metrics-grid">
            <div className="metric-item">
                <span className="metric-label">Budget</span>
                <div className="metric-value">
                    <DollarSign size={16} />
                    <span>{project.budget}</span>
                </div>
            </div>
            <div className="metric-item">
                <span className="metric-label">Duration</span>
                <div className="metric-value">
                    <Clock size={16} />
                    <span>{project.duration}</span>
                </div>
            </div>
            <div className="metric-item">
                <span className="metric-label">Proposals</span>
                <div className="metric-value">
                    <span>{project.proposals}</span>
                </div>
            </div>
            <div className="metric-item">
                <span className="metric-label">Posted</span>
                <div className="metric-value">
                    <span>{project.postedDate}</span>
                </div>
            </div>
        </div>
        <div className="project-actions-browse">
            <button className="submit-proposal-btn" onClick={onApply}>Submit Proposal</button>
            <button className="view-details-btn-outline">View Details</button>
        </div>
    </div>
);

export default BrowseProjects;
