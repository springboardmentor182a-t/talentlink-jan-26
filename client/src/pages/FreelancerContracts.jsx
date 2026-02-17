import { useState, useEffect } from "react";
import { getMyProposals } from "../services/api";
// Importing the X icon for our close button
import { X } from "lucide-react"; 

export default function FreelancerContracts() {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // NEW: State to track which proposal is being viewed in the popup
  const [selectedProposal, setSelectedProposal] = useState(null);

  useEffect(() => {
    const fetchProposals = async () => {
      try {
        const userId = 1; // Hardcoded for now
        const data = await getMyProposals(userId);
        setProposals(data);
      } catch (err) {
        setError("Failed to load proposals.");
      } finally {
        setLoading(false);
      }
    };

    fetchProposals();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8 w-full relative">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Contracts</h1>
            <p className="text-gray-500 mt-1">Manage your ongoing projects and proposals</p>
          </div>
        </div>

        {/* TABS (Visual only for now) */}
        <div className="flex gap-2 mb-8">
          {["All", "Active", "Draft", "Pending", "Completed"].map((tab, index) => (
            <button 
              key={tab}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition ${
                index === 0 
                  ? "bg-orange-500 text-white border-orange-500" 
                  : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* LOADING / ERROR STATES */}
        {loading && <p className="text-gray-500">Loading your proposals...</p>}
        {error && <p className="text-red-500 bg-red-50 p-3 rounded-lg">{error}</p>}
        {!loading && proposals.length === 0 && (
          <p className="text-gray-500 bg-white p-8 rounded-xl border border-gray-200 text-center">
            You haven't submitted any proposals yet.
          </p>
        )}

        {/* PROPOSALS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {proposals.map((proposal) => (
            <div key={proposal.id} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition">
              
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold text-lg text-gray-900">Project #{proposal.project_id}</h3>
                <span className="px-2.5 py-1 bg-orange-50 text-orange-600 text-xs font-semibold rounded-md uppercase tracking-wider">
                  {proposal.status}
                </span>
              </div>

              <div className="space-y-2 mb-6 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Your Bid:</span>
                  <span className="font-semibold text-gray-900">${proposal.bid_amount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Est. Duration:</span>
                  <span className="font-semibold text-gray-900">{proposal.estimated_days} Days</span>
                </div>
              </div>

              {/* NEW: OnClick handler to open the modal */}
              <button 
                onClick={() => setSelectedProposal(proposal)}
                className="w-full py-2 border border-orange-200 text-orange-600 rounded-lg font-medium hover:bg-orange-50 transition"
              >
                View Details &rarr;
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* NEW: POPUP MODAL */}
      {selectedProposal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-bold text-gray-800">Proposal Details</h2>
              <button 
                onClick={() => setSelectedProposal(null)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              
              <div className="grid grid-cols-2 gap-4 bg-orange-50 p-4 rounded-xl">
                <div>
                  <p className="text-sm text-orange-600/80 mb-1">Proposed Bid</p>
                  <p className="text-xl font-bold text-orange-700">${selectedProposal.bid_amount}</p>
                </div>
                <div>
                  <p className="text-sm text-orange-600/80 mb-1">Timeline</p>
                  <p className="text-xl font-bold text-orange-700">{selectedProposal.estimated_days} Days</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Cover Letter</h3>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-gray-700 whitespace-pre-wrap min-h-[120px]">
                  {selectedProposal.cover_letter}
                </div>
              </div>

            </div>
            
            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button 
                onClick={() => setSelectedProposal(null)}
                className="px-5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}