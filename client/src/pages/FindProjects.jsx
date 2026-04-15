import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../services/axios';
import ProjectCard from '../components/ProjectCard';
import ProjectFilters from '../components/ProjectFilters';
import '../assets/projects.css';

const BUDGET_RANGES = [
  { label: 'Any Budget',       min: 0,     max: Infinity },
  { label: 'Under $1,000',     min: 0,     max: 1000     },
  { label: '$1,000 – $5,000',  min: 1000,  max: 5000     },
  { label: '$5,000 – $20,000', min: 5000,  max: 20000    },
  { label: '$20,000+',         min: 20000, max: Infinity  },
];

export default function FindProjects() {
  const navigate = useNavigate();

  const [allProjects, setAllProjects]     = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState(null);
  const [searchInput, setSearchInput]     = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [category, setCategory]           = useState('All Categories');
  const [budgetIdx, setBudgetIdx]         = useState(0);
  const [categories, setCategories]       = useState(['All Categories']);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await axiosInstance.get('/projects/');
        const projects = res.data.items ?? res.data;
        setAllProjects(projects);

        // Auto-populate category filter from skills in real project data
        const skillSet = new Set();
        projects.forEach(p => {
          if (p.skills) {
            p.skills.split(',').forEach(s => {
              const trimmed = s.trim();
              if (trimmed) skillSet.add(trimmed);
            });
          }
        });
        setCategories(['All Categories', ...Array.from(skillSet).sort()]);
      } catch (err) {
        setError('Failed to load projects. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const handleSearch  = () => setAppliedSearch(searchInput.trim());
  const handleKeyDown = (e) => { if (e.key === 'Enter') handleSearch(); };

  const filtered = allProjects.filter(p => {
    if (appliedSearch) {
      const q = appliedSearch.toLowerCase();
      if (
        !p.title?.toLowerCase().includes(q) &&
        !p.description?.toLowerCase().includes(q) &&
        !p.skills?.toLowerCase().includes(q)
      ) return false;
    }
    if (category !== 'All Categories') {
      if (!p.skills?.toLowerCase().includes(category.toLowerCase())) return false;
    }
    const range = BUDGET_RANGES[budgetIdx];
    if (range.min > 0 || range.max !== Infinity) {
      const pMin = p.budget_min ?? p.budget_max ?? 0;
      const pMax = p.budget_max ?? p.budget_min ?? 0;
      // Keep project if its budget range overlaps the selected range at all
      if (pMax < range.min) return false;
      if (range.max !== Infinity && pMin > range.max) return false;
    }
    return true;
  });

  return (
    <div className="find-projects-container">
      <div className="find-projects-header">
        <h1>Find Projects</h1>
        <p>
          {loading
            ? 'Loading projects\u2026'
            : `${filtered.length} project${filtered.length !== 1 ? 's' : ''} found`}
        </p>
      </div>

      <ProjectFilters
        searchInput={searchInput}
        onSearchChange={setSearchInput}
        onKeyDown={handleKeyDown}
        categories={categories}
        category={category}
        onCategoryChange={setCategory}
        budgetIdx={budgetIdx}
        onBudgetChange={setBudgetIdx}
        budgetLabels={BUDGET_RANGES.map(r => r.label)}
        onSearch={handleSearch}
      />

      {loading && <p className="find-projects-status">Loading projects...</p>}

      {!loading && error && <p className="find-projects-error">{error}</p>}

      {!loading && !error && filtered.length === 0 && (
        <p className="find-projects-empty">
          No projects match your search. Try adjusting your filters.
        </p>
      )}

      <div className="projects-grid">
        {filtered.map(project => (
          <ProjectCard
            key={project.id}
            project={project}
            onApply={() => navigate(`/projects/${project.id}/apply`)}
          />
        ))}
      </div>
    </div>
  );
}