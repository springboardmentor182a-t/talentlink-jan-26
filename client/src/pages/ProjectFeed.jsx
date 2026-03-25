import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/axios";

export default function ProjectFeed() {
  const navigate = useNavigate();
  
  const [projects, setProjects] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [minBudget, setMinBudget] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;

  // Debounced Filter States (The values actually sent to API)
  const [apiSearch, setApiSearch] = useState("");
  const [apiMinBudget, setApiMinBudget] = useState("");

  // 1. Debounce Effect
  useEffect(() => {
    const timerId = setTimeout(() => {
      setApiSearch(searchQuery);
      setApiMinBudget(minBudget);
      setPage(1); // Reset to page 1 when filters change
    }, 500);

    return () => clearTimeout(timerId);
  }, [searchQuery, minBudget]);

  // 2. Fetch Projects Effect
  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      setError("");
      try {
        const skip = (page - 1) * limit;
        let url = `/projects/?skip=${skip}&limit=${limit}`;
        
        if (apiSearch) {
          url += `&search=${encodeURIComponent(apiSearch)}`;
        }
        if (apiMinBudget && !isNaN(apiMinBudget)) {
          url += `&min_budget=${encodeURIComponent(apiMinBudget)}`;
        }

        const response = await api.get(url);
        setProjects(response.data.items);
        setTotalCount(response.data.total_count);
      } catch (err) {
        console.error("Failed to fetch projects:", err);
        setError("Failed to load projects. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [apiSearch, apiMinBudget, page]);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      
      {/* HEADER & CONTROLS */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight sm:text-4xl mb-4">
          Discover Projects
        </h1>
        <p className="text-lg text-gray-500 mb-6">
          Find the perfect freelance opportunity from our verified clients.
        </p>

        {/* Filter Bar */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col sm:flex-row gap-4">
          <div className="flex-grow">
            <label className="block text-sm font-medium text-gray-700 mb-1">Search Keywords</label>
            <input 
               type="text" 
               placeholder="e.g. React, Python, E-commerce..." 
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition"
            />
          </div>
          <div className="w-full sm:w-48">
             <label className="block text-sm font-medium text-gray-700 mb-1">Min Budget ($)</label>
             <input 
               type="number" 
               placeholder="e.g. 500" 
               value={minBudget}
               onChange={(e) => setMinBudget(e.target.value)}
               className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition"
            />
          </div>
        </div>
      </div>

      {/* ERROR BANNER */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-md mb-8">
          {error}
        </div>
      )}

      {/* CONTENT GRID */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <svg className="animate-spin h-10 w-10 text-orange-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
           <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No projects found</h3>
          <p className="mt-1 text-sm text-gray-500">Try adjusting your search criteria or checking back later.</p>
            <button 
             onClick={() => { setSearchQuery(""); setMinBudget(""); }}
             className="mt-4 px-4 py-2 bg-orange-50 text-orange-700 rounded-md hover:bg-orange-100 transition text-sm font-medium"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <div key={project.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col hover:shadow-md transition">
               <div className="flex justify-between items-start mb-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                    Active
                  </span>
                  <span className="text-lg font-bold text-gray-900">${project.budget}</span>
               </div>
               
               <h2 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                 {project.title}
               </h2>
               
               <p className="text-gray-600 text-sm mb-6 flex-grow line-clamp-3">
                 {project.description}
               </p>
               
               <div className="pt-4 border-t border-gray-100 flex items-center justify-between mt-auto">
                 <span className="text-xs text-gray-500">
                   Posted {new Date(project.created_at).toLocaleDateString()}
                 </span>
                 <button 
                   onClick={() => navigate(`/projects/${project.id}/apply`)}
                   className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition shadow-sm"
                 >
                   Apply Now
                 </button>
               </div>
            </div>
          ))}
        </div>
      )}

      {/* PAGINATION CONTROLS */}
      {!loading && totalCount > limit && (
        <div className="mt-8 flex justify-center items-center gap-4">
          <button 
             onClick={() => setPage(p => Math.max(1, p - 1))}
             disabled={page === 1}
             className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
             Previous
          </button>
          <span className="text-sm text-gray-600 font-medium">
             Page {page} of {Math.ceil(totalCount / limit)}
          </span>
          <button 
             onClick={() => setPage(p => p + 1)}
             disabled={page >= Math.ceil(totalCount / limit)}
             className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
             Next
          </button>
        </div>
      )}

    </div>
  );
}
