import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { createProposal } from "../services/api";
import axiosInstance from "../services/axios";

export default function SubmitProposal() {
  const { projectId } = useParams();
  const navigate      = useNavigate();

  const [project, setProject]   = useState(null);
  const [formData, setFormData] = useState({
    cover_letter:   "",
    bid_amount:     "",
    estimated_days: "",
  });
  const [loading, setLoading]   = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState(false);

  // Fetch project details so freelancer knows what they're applying for
  useEffect(() => {
    axiosInstance.get("/projects/")
      .then(res => {
        const found = res.data.find(p => p.id === parseInt(projectId));
        setProject(found || null);
      })
      .catch(() => setProject(null))
      .finally(() => setFetching(false));
  }, [projectId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) {
        setError("You must be logged in to submit a proposal.");
        setLoading(false);
        return;
      }

      const user = JSON.parse(storedUser);

      await createProposal(user.id, {
        project_id:     parseInt(projectId),
        cover_letter:   formData.cover_letter,
        bid_amount:     parseFloat(formData.bid_amount),
        estimated_days: parseInt(formData.estimated_days),
      });

      setSuccess(true);
      setTimeout(() => navigate("/freelancer/dashboard"), 2000);

    } catch (err) {
      const detail = err.response?.data?.detail;
      if (Array.isArray(detail)) {
        setError(`Validation Error: ${detail[0].msg}`);
      } else {
        setError(detail || "Failed to submit proposal. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 flex justify-center items-start">
      <div className="max-w-2xl w-full bg-white rounded-xl shadow-sm border border-gray-200 p-8">

        {/* Project context */}
        {!fetching && project && (
          <div style={{
            backgroundColor: "#FFF5EE",
            border: "1px solid #FFD4B2",
            borderRadius: "10px",
            padding: "16px 20px",
            marginBottom: "28px",
          }}>
            <p style={{ fontSize: "12px", color: "#FF7A1A", fontWeight: 600, marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Applying for
            </p>
            <h2 style={{ margin: "0 0 4px 0", fontSize: "17px", color: "#111827" }}>
              {project.title}
            </h2>
            {project.budget_min && project.budget_max && (
              <p style={{ margin: 0, fontSize: "13px", color: "#6C757D" }}>
                Budget: ${project.budget_min.toLocaleString()} – ${project.budget_max.toLocaleString()}
                {project.duration ? ` · ${project.duration}` : ""}
              </p>
            )}
          </div>
        )}

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Submit Your Proposal</h1>
        <p className="text-gray-500 mb-8">Tell the client why you are the best fit for this project.</p>

        {/* Success message */}
        {success && (
          <div style={{
            backgroundColor: "#dcfce7",
            border: "1px solid #86efac",
            borderRadius: "8px",
            padding: "14px 18px",
            marginBottom: "20px",
            color: "#166534",
            fontWeight: 500,
            fontSize: "14px",
          }}>
            ✓ Proposal submitted successfully! Redirecting to dashboard...
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your Bid ($)
              </label>
              <input
                type="number"
                name="bid_amount"
                required
                min="1"
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition"
                placeholder="e.g. 500"
                value={formData.bid_amount}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estimated Days
              </label>
              <input
                type="number"
                name="estimated_days"
                required
                min="1"
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition"
                placeholder="e.g. 7"
                value={formData.estimated_days}
                onChange={handleChange}
              />
            </div>
          </div>

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
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition"
              disabled={loading || success}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || success}
              className={`px-6 py-2 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600 transition shadow-sm ${
                (loading || success) ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Submitting..." : success ? "Submitted ✓" : "Submit Proposal"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}