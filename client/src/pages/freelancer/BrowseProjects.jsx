<<<<<<< Group-A-feature/freelancer-dashboard-adwaith
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../layout/Sidebar';
import Navbar from '../../layout/Navbar';
import { Search, Clock, DollarSign, ChevronDown, Check } from 'lucide-react';
import api from '../../utils/api';
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
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        search: '',
        budgetRange: 'All Budgets',
        duration: 'All Durations',
        skill: 'All Skills'
    });

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const res = await api.get('/jobs/');
                const mappedProjects = res.data.map(job => ({
                    id: job.id,
                    title: job.title,
                    description: job.description,
                    clientId: job.client_id,
                    skills: [],
                    budget: `$${job.budget.toLocaleString()}`,
                    numericBudget: job.budget,
                    duration: "Not specified",
                    proposals: 0,
                    postedDate: new Date(job.created_at).toLocaleDateString()
                }));
                mappedProjects.sort((a, b) => new Date(b.postedDate) - new Date(a.postedDate));
                setProjects(mappedProjects);
            } catch (err) {
                console.error("Error fetching jobs:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProjects();
    }, []);

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
        return projects.filter(project => {
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
    }, [filters, projects]);

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleSubmitProposal = (projectId) => {
        navigate(`/freelancer/submit-proposal/${projectId}`);
    };

    const handleMessageClient = (clientId) => {
        navigate(`/freelancer/messages?userId=${clientId}`);
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
                        {loading ? "Loading projects..." : `${filteredProjects.length} projects found`}
                    </div>

                    <div className="projects-list">
                        {loading ? (
                            <div className="loading-projects">
                                <p>Loading projects from backend...</p>
                            </div>
                        ) : filteredProjects.length > 0 ? (
                            filteredProjects.map(project => (
                                <ProjectCard
                                    key={project.id}
                                    project={project}
                                    onApply={() => handleSubmitProposal(project.id)}
                                    onMessage={() => handleMessageClient(project.clientId)}
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

const ProjectCard = ({ project, onApply, onMessage }) => (
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
            <button className="view-details-btn-outline" onClick={onMessage}>Message Client</button>
        </div>
    </div>
);

export default BrowseProjects;
=======
import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";
import { AuthContext } from "../../context/AuthContext";

export default function BrowseProjects() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [projects, setProjects]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [budget, setBudget]         = useState("all");
  const [skillInput, setSkillInput] = useState("");
  const [selected, setSelected]     = useState(null);

  useEffect(() => { fetchProjects(); }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await api.get("/projects/open/");
      setProjects(res.data);
    } catch (err) { console.error("Error fetching projects:", err.message); }
    finally { setLoading(false); }
  };

  const filtered = projects.filter(p => {
    const s = search.trim().toLowerCase();
    const matchSearch = s === "" || p.title?.toLowerCase().includes(s) || p.description?.toLowerCase().includes(s);
    const b = Number(p.budget);
    const matchBudget = budget === "all" ? true : budget === "low" ? b < 1000 : budget === "medium" ? b >= 1000 && b <= 5000 : b > 5000;
    const sk = skillInput.trim().toLowerCase();
    const matchSkill = sk === "" || p.skills?.toLowerCase().includes(sk) || p.title?.toLowerCase().includes(sk);
    return matchSearch && matchBudget && matchSkill;
  });

  const clearFilters = () => { setSearch(""); setBudget("all"); setSkillInput(""); };

  return (
    <div style={{ fontFamily:"'Segoe UI',sans-serif", backgroundColor:"#f8fafc", minHeight:"100vh" }}>

      {/* Hero */}
      <div style={{ background:"linear-gradient(135deg,#3b0764 0%,#7c3aed 40%,#a855f7 100%)", padding:"32px 32px", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:-40, right:-40, width:180, height:180, borderRadius:"50%", background:"rgba(255,255,255,0.05)" }} />
        <div style={{ position:"absolute", bottom:-20, left:200, width:120, height:120, borderRadius:"50%", background:"rgba(255,255,255,0.05)" }} />
        <div style={{ display:"inline-flex", alignItems:"center", gap:8, backgroundColor:"rgba(255,255,255,0.15)", borderRadius:20, padding:"4px 14px", fontSize:12, color:"white", fontWeight:600, marginBottom:10 }}>
          🔍 Browse Projects
        </div>
        <h1 style={{ fontSize:28, fontWeight:800, color:"white", margin:"0 0 6px", letterSpacing:"-0.5px" }}>Browse Projects</h1>
        <p style={{ fontSize:14, color:"rgba(255,255,255,0.75)", margin:0 }}>Find and apply for projects that match your skills</p>
      </div>

      <div style={{ padding:32 }}>

        {/* Filters — 3 columns, no Duration */}
        <div style={{ backgroundColor:"#fff", borderRadius:16, padding:"20px 24px", marginBottom:24, boxShadow:"0 1px 3px rgba(0,0,0,0.06)", border:"1px solid #e2e8f0" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
            <span style={{ fontSize:15, fontWeight:700, color:"#111827" }}>🔽 Filters</span>
            <button onClick={clearFilters}
              style={{ fontSize:13, color:"#7c3aed", background:"none", border:"none", cursor:"pointer", fontFamily:"inherit", fontWeight:600 }}>
              Clear all
            </button>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:16 }}>
            <div>
              <label style={lbl}>Search</label>
              <div style={{ position:"relative" }}>
                <span style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:"#9ca3af" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                </span>
                <input type="text" placeholder="Search projects..."
                  value={search} onChange={e => setSearch(e.target.value)}
                  style={{ ...inp, paddingLeft:30 }} />
              </div>
            </div>
            <div>
              <label style={lbl}>Budget Range</label>
              <select value={budget} onChange={e => setBudget(e.target.value)} style={inp}>
                <option value="all">All Budgets</option>
                <option value="low">Under $1,000</option>
                <option value="medium">$1,000 – $5,000</option>
                <option value="high">Over $5,000</option>
              </select>
            </div>
            <div>
              <label style={lbl}>Skill</label>
              <input type="text" placeholder="e.g. React, Python..."
                value={skillInput} onChange={e => setSkillInput(e.target.value)}
                style={inp} />
            </div>
          </div>
        </div>

        {!loading && (
          <p style={{ fontSize:14, color:"#64748b", marginBottom:16 }}>
            {filtered.length} project{filtered.length !== 1 ? "s" : ""} found
          </p>
        )}
        {loading && <p style={{ color:"#64748b" }}>Loading projects...</p>}

        {!loading && filtered.length === 0 && (
          <div style={{ backgroundColor:"#fff", borderRadius:16, padding:"60px 32px", textAlign:"center", boxShadow:"0 1px 3px rgba(0,0,0,0.06)", border:"1px solid #e2e8f0" }}>
            <div style={{ fontSize:56, marginBottom:16 }}>🔍</div>
            <h3 style={{ fontSize:18, fontWeight:700, color:"#111827", marginBottom:8 }}>No projects found</h3>
            <p style={{ color:"#64748b", fontSize:14, marginBottom:16 }}>Try adjusting your filters to find more projects.</p>
            <button onClick={clearFilters}
              style={{ padding:"10px 24px", background:"linear-gradient(135deg,#7c3aed,#a855f7)", color:"white", border:"none", borderRadius:8, cursor:"pointer", fontWeight:600, fontSize:14 }}>
              Clear Filters
            </button>
          </div>
        )}

        {filtered.map(p => (
          <div key={p.id} style={{ backgroundColor:"#fff", borderRadius:16, padding:24, marginBottom:16, boxShadow:"0 1px 3px rgba(0,0,0,0.06)", border:"1px solid #e2e8f0" }}
            onMouseEnter={e => e.currentTarget.style.boxShadow="0 4px 16px rgba(0,0,0,0.1)"}
            onMouseLeave={e => e.currentTarget.style.boxShadow="0 1px 3px rgba(0,0,0,0.06)"}>

            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
              <div style={{ flex:1 }}>
                <h3 style={{ fontSize:18, fontWeight:700, color:"#111827", margin:"0 0 6px" }}>{p.title}</h3>
                <p style={{ fontSize:14, color:"#64748b", lineHeight:1.7, margin:0 }}>
                  {p.description?.length > 180 ? p.description.slice(0,180) + "..." : p.description}
                </p>
              </div>
              <span style={{ padding:"6px 16px", borderRadius:20, fontSize:12, fontWeight:700, background:"linear-gradient(135deg,#7c3aed,#a855f7)", color:"white", whiteSpace:"nowrap", marginLeft:16 }}>
                Open
              </span>
            </div>

            {p.skills && (
              <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:16 }}>
                {p.skills.split(",").map(s => (
                  <span key={s} style={{ padding:"4px 12px", background:"linear-gradient(135deg,#f5f3ff,#ede9fe)", color:"#a855f7", borderRadius:20, fontSize:12, fontWeight:600, border:"1px solid #ddd6fe" }}>
                    {s.trim()}
                  </span>
                ))}
              </div>
            )}

            <div style={{ display:"flex", gap:24, paddingTop:16, borderTop:"1px solid #f1f5f9", marginBottom:16 }}>
              <div>
                <span style={{ display:"block", fontSize:11, textTransform:"uppercase", letterSpacing:"0.5px", color:"#64748b", marginBottom:2 }}>Budget</span>
                <strong style={{ color:"#111827", fontSize:15 }}>${Number(p.budget).toLocaleString()}</strong>
              </div>
              <div>
                <span style={{ display:"block", fontSize:11, textTransform:"uppercase", letterSpacing:"0.5px", color:"#64748b", marginBottom:2 }}>Deadline</span>
                <strong style={{ color:"#111827", fontSize:15 }}>{p.deadline || "—"}</strong>
              </div>
              <div>
                <span style={{ display:"block", fontSize:11, textTransform:"uppercase", letterSpacing:"0.5px", color:"#64748b", marginBottom:2 }}>Posted</span>
                <strong style={{ color:"#111827", fontSize:15 }}>{new Date(p.created_at).toLocaleDateString()}</strong>
              </div>
            </div>

            <div style={{ display:"flex", gap:12 }}>
              <button onClick={() => navigate(`/submit-proposal/${p.id}`)}
                style={{ padding:"10px 24px", background:"linear-gradient(135deg,#7c3aed,#a855f7)", color:"white", border:"none", borderRadius:8, cursor:"pointer", fontWeight:600, fontSize:14, boxShadow:"0 2px 8px rgba(124,58,237,0.3)" }}>
                🚀 Submit Proposal
              </button>
              <button onClick={() => setSelected(p)}
                style={{ padding:"10px 24px", backgroundColor:"#fff", color:"#374151", border:"1.5px solid #e2e8f0", borderRadius:8, cursor:"pointer", fontWeight:600, fontSize:14 }}>
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* View Details Modal */}
      {selected && (
        <div onClick={() => setSelected(null)}
          style={{ position:"fixed", inset:0, backgroundColor:"rgba(15,23,42,0.6)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:24, backdropFilter:"blur(4px)" }}>
          <div onClick={e => e.stopPropagation()}
            style={{ backgroundColor:"#fff", borderRadius:20, padding:32, maxWidth:600, width:"100%", maxHeight:"80vh", overflowY:"auto", boxShadow:"0 20px 60px rgba(0,0,0,0.3)", border:"1px solid #e2e8f0" }}>

            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20 }}>
              <div>
                <h2 style={{ fontSize:22, fontWeight:800, color:"#111827", margin:"0 0 8px", letterSpacing:"-0.5px" }}>{selected.title}</h2>
                <span style={{ padding:"6px 16px", borderRadius:20, fontSize:12, fontWeight:700, background:"linear-gradient(135deg,#7c3aed,#a855f7)", color:"white" }}>Open</span>
              </div>
              <button onClick={() => setSelected(null)}
                style={{ background:"#f1f5f9", border:"none", width:32, height:32, borderRadius:"50%", cursor:"pointer", color:"#64748b", fontSize:16, display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
            </div>

            <div style={{ marginBottom:20 }}>
              <label style={{ fontSize:11, fontWeight:700, color:"#64748b", textTransform:"uppercase", letterSpacing:"0.5px", display:"block", marginBottom:8 }}>Description</label>
              <p style={{ fontSize:14, color:"#374151", lineHeight:1.8, margin:0, backgroundColor:"#f8fafc", padding:"14px 16px", borderRadius:10, border:"1px solid #e2e8f0" }}>{selected.description}</p>
            </div>

            {selected.skills && (
              <div style={{ marginBottom:20 }}>
                <label style={{ fontSize:11, fontWeight:700, color:"#64748b", textTransform:"uppercase", letterSpacing:"0.5px", display:"block", marginBottom:8 }}>Required Skills</label>
                <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                  {selected.skills.split(",").map(s => (
                    <span key={s} style={{ padding:"4px 12px", background:"linear-gradient(135deg,#f5f3ff,#ede9fe)", color:"#7c3aed", borderRadius:20, fontSize:12, fontWeight:600, border:"1px solid #ddd6fe" }}>
                      {s.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:16, marginBottom:24, backgroundColor:"#f8fafc", borderRadius:12, padding:16, border:"1px solid #e2e8f0" }}>
              <div>
                <div style={{ fontSize:11, color:"#64748b", textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:4 }}>Budget</div>
                <div style={{ fontSize:20, fontWeight:800, color:"#111827" }}>${Number(selected.budget).toLocaleString()}</div>
              </div>
              <div>
                <div style={{ fontSize:11, color:"#64748b", textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:4 }}>Deadline</div>
                <div style={{ fontSize:16, fontWeight:700, color:"#111827" }}>{selected.deadline || "—"}</div>
              </div>
              <div>
                <div style={{ fontSize:11, color:"#64748b", textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:4 }}>Posted</div>
                <div style={{ fontSize:14, fontWeight:600, color:"#111827" }}>{new Date(selected.created_at).toLocaleDateString()}</div>
              </div>
            </div>

            <div style={{ display:"flex", gap:12 }}>
              <button onClick={() => { setSelected(null); navigate(`/submit-proposal/${selected.id}`); }}
                style={{ flex:1, padding:13, background:"linear-gradient(135deg,#7c3aed,#a855f7)", color:"white", border:"none", borderRadius:10, cursor:"pointer", fontWeight:700, fontSize:15, boxShadow:"0 4px 12px rgba(124,58,237,0.3)" }}>
                🚀 Submit Proposal
              </button>
              <button onClick={() => setSelected(null)}
                style={{ padding:"13px 24px", backgroundColor:"#fff", color:"#64748b", border:"1.5px solid #e2e8f0", borderRadius:10, cursor:"pointer", fontWeight:600, fontSize:14 }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const lbl = { display:"block", fontSize:13, fontWeight:500, color:"#374151", marginBottom:6 };
const inp = { width:"100%", padding:"10px 12px", border:"1.5px solid #e2e8f0", borderRadius:8, fontSize:14, outline:"none", fontFamily:"inherit", backgroundColor:"#f9fafb", boxSizing:"border-box" };
>>>>>>> main-group-A
