import React, { useState, useEffect, useRef, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Sidebar from '../../layout/Sidebar';
import Navbar from '../../layout/Navbar';
import {
    ChevronLeft,
    Send,
    ChevronDown,
    Check
} from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../utils/api';
import './Dashboard.css';

const CustomDropdown = ({ label, options, value, onChange, placeholder = "Select option" }) => {
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
            <label className="filter-label">{label}</label>
            <div className="custom-select-wrapper">
                <div
                    className={`custom-select-trigger ${isOpen ? 'open' : ''} ${value ? 'has-value' : 'placeholder'}`}
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <span>{value || placeholder}</span>
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

const SubmitProposal = () => {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const { token } = useContext(AuthContext);

    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchJob = async () => {
            try {
                const response = await api.get(`/jobs/${projectId}`);
                const data = response.data;
                setProject({
                        ...data,
                        budgetFormatted: `$${data.budget.toLocaleString()}`,
                        duration: 'Flexible',
                        skills: [],
                        proposalsCount: 0
                    });
            } catch (err) {
                console.error("Failed to fetch job", err);
            } finally {
                setLoading(false);
            }
        };
        if (token && projectId) {
            fetchJob();
        }
    }, [token, projectId]);

    const [proposalData, setProposalData] = useState({
        proposedBudget: "",
        deliveryTime: "",
        coverLetter: ""
    });

    useEffect(() => {
        if (project) {
            setProposalData(prev => ({
                ...prev,
                proposedBudget: project.budget.toString()
            }));
        }
    }, [project]);

    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const deliveryOptions = [
        'Less than 1 week',
        '1-2 weeks',
        '2-4 weeks',
        '1-2 months',
        '2-3 months',
        '3+ months'
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!proposalData.proposedBudget || !proposalData.deliveryTime || !proposalData.coverLetter.trim()) {
            setError("All fields marked with * are required. Please fill them in before submitting.");
            return;
        }

        setSubmitting(true);
        setError("");

        try {
            await api.post('/proposals/', {
                job_id: parseInt(projectId),
                cover_letter: proposalData.coverLetter,
                bid_amount: parseInt(proposalData.proposedBudget),
                delivery_time: proposalData.deliveryTime
            });

            navigate('/freelancer/proposals');
        } catch (err) {
            setError(err.response?.data?.detail || "An error occurred. Please try again.");
            console.error("Proposal submission error", err);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="dashboard-layout">
            <Navbar />
            <div className="dashboard-container">
                <Sidebar />
                <div className="main-content scrollable">
                    {loading ? (
                        <div className="loading-state">
                            <div className="spinner">Loading project details...</div>
                        </div>
                    ) : !project ? (
                        <div className="error-container">
                            <h2 className="project-not-found">Project not found</h2>
                            <Link to="/freelancer/browse" className="back-link">Return to Browse Projects</Link>
                        </div>
                    ) : (
                        <>
                            <div className="back-link-container">
                                <Link to="/freelancer/browse" className="back-to-projects">
                                    <ChevronLeft size={20} />
                                    <span>Back to Projects</span>
                                </Link>
                            </div>

                            <div className="submit-proposal-header">
                                <h1 className="page-title">Submit Proposal</h1>
                                <p className="page-subtitle">Create a compelling proposal to win this project</p>
                            </div>

                            {/* Project Context Card */}
                            <div className="section-card project-context-card">
                                <h2 className="project-context-title">Project: {project.title}</h2>
                                <p className="project-description-context">{project.description}</p>

                                <div className="project-metrics-row-flex">
                                    <div className="metric-context-item">
                                        <span className="metric-label">Client Budget</span>
                                        <span className="metric-context-value">{project.budgetFormatted}</span>
                                    </div>
                                    <div className="metric-context-item">
                                        <span className="metric-label">Duration</span>
                                        <span className="metric-context-value">{project.duration}</span>
                                    </div>
                                    <div className="metric-context-item">
                                        <span className="metric-label">Required Skills</span>
                                        <div className="skills-row-mini">
                                            {project.skills.slice(0, 2).map((skill, i) => (
                                                <span key={i} className="skill-pill-blue">{skill}</span>
                                            ))}
                                            {project.skills.length > 2 && (
                                                <span className="skill-count-more">+{project.skills.length - 2}</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="metric-context-item">
                                        <span className="metric-label">Proposals</span>
                                        <span className="metric-context-value">{project.proposalsCount}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Your Proposal Card */}
                            <div className="section-card proposal-form-card">
                                <div className="form-section-header">
                                    <h2 className="section-card-title">Your Proposal</h2>
                                    <p className="section-subtitle">Stand out by providing detailed information</p>
                                </div>

                                <form onSubmit={handleSubmit} className="proposal-form">
                                    <div className="form-row-grid">
                                        <div className="form-group">
                                            <label className="field-label">Your Proposed Budget (USD) *</label>
                                            <input
                                                type="number"
                                                className="proposal-input-grey"
                                                value={proposalData.proposedBudget}
                                                onChange={(e) => {
                                                    setProposalData({ ...proposalData, proposedBudget: e.target.value });
                                                    if (error) setError("");
                                                }}
                                            />
                                            <span className="field-helper-text">Client's budget: {project.budgetFormatted}</span>
                                        </div>
                                        <div className="form-group">
                                            <CustomDropdown
                                                label="Estimated Delivery Time *"
                                                options={deliveryOptions}
                                                value={proposalData.deliveryTime}
                                                onChange={(val) => {
                                                    setProposalData({ ...proposalData, deliveryTime: val });
                                                    if (error) setError("");
                                                }}
                                                placeholder="Select timeframe"
                                            />
                                        </div>
                                    </div>

                                    <div className="form-group mt-32">
                                        <label className="field-label">Cover Letter *</label>
                                        <textarea
                                            className="proposal-textarea-grey"
                                            placeholder="Introduce yourself and explain why you're the best fit for this project. Include relevant experience, your approach, and what makes you stand out..."
                                            value={proposalData.coverLetter}
                                            maxLength={1000}
                                            onChange={(e) => {
                                                setProposalData({ ...proposalData, coverLetter: e.target.value });
                                                if (error) setError("");
                                            }}
                                        />
                                        <div className="character-counter-text">
                                            {proposalData.coverLetter.length} / 1000 characters
                                        </div>
                                    </div>

                                    {/* Tips Card */}
                                    <div className="proposal-tips-alert">
                                        <h3 className="tips-card-title">Tips for a Great Proposal</h3>
                                        <ul className="tips-bullet-list">
                                            <li>Personalize your proposal to the specific project</li>
                                            <li>Highlight relevant experience and past work</li>
                                            <li>Be clear about your approach and timeline</li>
                                            <li>Show enthusiasm and professionalism</li>
                                            <li>Proofread for grammar and spelling</li>
                                        </ul>
                                    </div>

                                    {error && (
                                        <div className="proposal-error-alert">
                                            <span>{error}</span>
                                        </div>
                                    )}

                                    <div className="proposal-form-actions">
                                        <button type="submit" className="btn-black-submit" disabled={submitting}>
                                            <Send size={18} />
                                            <span>{submitting ? "Submitting..." : "Submit Proposal"}</span>
                                        </button>
                                        <button
                                            type="button"
                                            className="btn-outline-cancel"
                                            onClick={() => navigate('/freelancer/browse')}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SubmitProposal;
