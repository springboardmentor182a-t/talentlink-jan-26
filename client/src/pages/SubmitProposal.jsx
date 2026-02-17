import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { createProposal } from "../services/api";

export default function SubmitProposal() {
  const { projectId } = useParams(); // We get the Project ID from the URL
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    cover_letter: "",
    bid_amount: "",
    estimated_days: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // HARDCODED USER ID: 1 (Replace with real logic later)
      const userId = 1; 

      // Prepare data for backend
      const payload = {
        project_id: parseInt(projectId) || 1, // Fallback to 1 if testing without URL
        cover_letter: formData.cover_letter,
        bid_amount: parseFloat(formData.bid_amount),
        estimated_days: parseInt(formData.estimated_days)
      };

      await createProposal(userId, payload);
      alert("Proposal submitted successfully!");
      navigate("/dashboard"); // Go back to dashboard after success
    } catch (err) {
      setError("Failed to submit proposal. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 flex justify-center items-start">
      <div className="max-w-2xl w-full bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        
        {/* HEADER */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Submit Your Proposal</h1>
        <p className="text-gray-500 mb-8">
          Tell the client why you are the best fit for this project.
        </p>

        {/* ERROR MESSAGE */}
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* BID AMOUNT */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your Bid ($)
              </label>
              <input
                type="number"
                name="bid_amount"
                required
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition"
                placeholder="e.g. 500"
                value={formData.bid_amount}
                onChange={handleChange}
              />
            </div>
            
            {/* DURATION */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estimated Days
              </label>
              <input
                type="number"
                name="estimated_days"
                required
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition"
                placeholder="e.g. 7"
                value={formData.estimated_days}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* COVER LETTER */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cover Letter
            </label>
            <textarea
              name="cover_letter"
              required
              rows="6"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition"
              placeholder="Hi, I have 5 years of experience in..."
              value={formData.cover_letter}
              onChange={handleChange}
            ></textarea>
          </div>

          {/* BUTTONS */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-2 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600 transition shadow-sm ${
                loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Submitting..." : "Submit Proposal"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}