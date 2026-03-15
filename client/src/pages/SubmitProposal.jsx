import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createProposal } from "../services/api";

// 1. Define Zod Schema matching the backend Pydantic rules
const proposalSchema = z.object({
  bid_amount: z.coerce.number().positive("Bid amount must be greater than zero"),
  estimated_days: z.coerce
    .number()
    .int("Estimated days must be a whole number")
    .positive("Estimated days must be greater than zero")
    .max(365, "Estimated days cannot exceed 365"),
  cover_letter: z
    .string()
    .min(20, "Cover letter must be at least 20 characters")
    .max(2000, "Cover letter cannot exceed 2000 characters"),
});

export default function SubmitProposal() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [globalError, setGlobalError] = useState("");

  // 2. Setup React Hook Form with Zod integration
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(proposalSchema),
    defaultValues: {
      bid_amount: "",
      estimated_days: "",
      cover_letter: "",
    },
  });

  const onSubmit = async (data) => {
    setGlobalError("");

    try {
      // Get the dynamically logged-in user
      const storedUser = localStorage.getItem("user");
      if (!storedUser) {
        setGlobalError("You must be logged in to submit a proposal.");
        return;
      }

      const user = JSON.parse(storedUser);
      const userId = user.id;

      // Prepare payload adding project_id
      const payload = {
        project_id: parseInt(projectId) || 1,
        ...data,
      };

      // Send to API
      await createProposal(userId, payload);
      alert("Proposal submitted successfully!");
      navigate("/freelancer/dashboard");
      
    } catch (err) {
      const errorDetail = err.response?.data?.detail;
      if (Array.isArray(errorDetail)) {
        // Handle Pydantic validation array
        setGlobalError(`Validation Error: ${errorDetail[0].msg}`);
      } else {
        setGlobalError(errorDetail || "Failed to submit proposal. Please try again or check your connection.");
      }
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 flex justify-center items-start">
      <div className="max-w-2xl w-full bg-white rounded-xl shadow-sm border border-gray-200 p-8 transform transition-all hover:shadow-md">
        
        {/* HEADER */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Submit Your Proposal</h1>
        <p className="text-gray-500 mb-8">
          Tell the client why you are the best fit for this project. Be specific about your approach and timeframe.
        </p>

        {/* GLOBAL ERROR MESSAGE */}
        {globalError && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-md mb-6 shadow-sm flex justify-between items-center animate-fade-in">
            <span className="text-sm font-medium">{globalError}</span>
            <button onClick={() => setGlobalError("")} className="text-red-500 hover:text-red-700 font-bold ml-4 focus:outline-none">
              ×
            </button>
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          <div className="grid grid-cols-2 gap-6">
            {/* BID AMOUNT */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your Bid ($)
              </label>
              <input
                type="number"
                step="any"
                className={`w-full p-2 border rounded-lg focus:ring-2 outline-none transition ${
                  errors.bid_amount 
                    ? "border-red-400 focus:ring-red-200 focus:border-red-500 bg-red-50" 
                    : "border-gray-300 focus:ring-orange-200 focus:border-orange-500"
                }`}
                placeholder="e.g. 500"
                {...register("bid_amount")}
              />
              {errors.bid_amount && (
                <p className="text-red-500 text-xs mt-1 animate-pulse">{errors.bid_amount.message}</p>
              )}
            </div>
            
            {/* DURATION */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estimated Days
              </label>
              <input
                type="number"
                className={`w-full p-2 border rounded-lg focus:ring-2 outline-none transition ${
                  errors.estimated_days 
                    ? "border-red-400 focus:ring-red-200 focus:border-red-500 bg-red-50" 
                    : "border-gray-300 focus:ring-orange-200 focus:border-orange-500"
                }`}
                placeholder="e.g. 7"
                {...register("estimated_days")}
              />
              {errors.estimated_days && (
                <p className="text-red-500 text-xs mt-1 animate-pulse">{errors.estimated_days.message}</p>
              )}
            </div>
          </div>

          {/* COVER LETTER */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cover Letter
            </label>
            <textarea
              rows="6"
              className={`w-full p-3 border rounded-lg focus:ring-2 outline-none transition resize-y ${
                errors.cover_letter 
                  ? "border-red-400 focus:ring-red-200 focus:border-red-500 bg-red-50" 
                  : "border-gray-300 focus:ring-orange-200 focus:border-orange-500"
              }`}
              placeholder="Hi, I have 5 years of experience in..."
              {...register("cover_letter")}
            ></textarea>
            {errors.cover_letter && (
              <p className="text-red-500 text-xs mt-1 animate-pulse">{errors.cover_letter.message}</p>
            )}
          </div>

          {/* BUTTONS */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={() => navigate(-1)}
              disabled={isSubmitting}
              className="px-5 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg transition shadow-sm flex items-center justify-center min-w-[160px] ${
                isSubmitting ? "opacity-75 cursor-not-allowed" : ""
              }`}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </>
              ) : (
                "Submit Proposal"
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}