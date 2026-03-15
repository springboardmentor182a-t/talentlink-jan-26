import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import api from "../services/axios";

// 1. Define Zod Schema matching the backend Pydantic rules
const postProjectSchema = z.object({
  title: z
    .string()
    .min(10, "Project title must be at least 10 characters")
    .max(100, "Project title cannot exceed 100 characters"),
  description: z
    .string()
    .min(50, "Project description must be at least 50 characters")
    .max(5000, "Project description cannot exceed 5000 characters"),
  budget: z.coerce.number().positive("Budget must be greater than zero"),
});

export default function PostProject() {
  const navigate = useNavigate();
  const [globalError, setGlobalError] = useState("");

  // 2. Setup React Hook Form with Zod integration
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(postProjectSchema),
    defaultValues: {
      title: "",
      description: "",
      budget: "",
    },
  });

  const onSubmit = async (data) => {
    setGlobalError("");

    try {
      // POST directly to the raw Axios instance 'api'
      // Note: In an auth-enabled app, client_id is inferred via JWT.
      const response = await api.post("/projects/", data);
      
      alert("Project posted successfully!");
      navigate(`/projects/${response.data.id}`); // Or dashboard
    } catch (err) {
      const errorDetail = err.response?.data?.detail;
      if (Array.isArray(errorDetail)) {
        // Handle Pydantic validation array
        setGlobalError(`Validation Error: ${errorDetail[0].msg}`);
      } else {
        setGlobalError(errorDetail || "Failed to post project. Please try again or check your connection.");
      }
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 flex justify-center items-start">
      <div className="max-w-2xl w-full bg-white rounded-xl shadow-sm border border-gray-200 p-8 transform transition-all hover:shadow-md">
        
        {/* HEADER */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Post a New Project</h1>
          <p className="mt-3 text-lg text-gray-500">
            Describe your project in detail to attract the best freelancers on TalentLink.
          </p>
        </div>

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
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          
          {/* TITLE */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Project Title
            </label>
            <input
              type="text"
              className={`w-full p-2 border rounded-lg focus:ring-2 outline-none transition ${
                errors.title 
                  ? "border-red-400 focus:ring-red-200 focus:border-red-500 bg-red-50" 
                  : "border-gray-300 focus:ring-orange-200 focus:border-orange-500"
              }`}
              placeholder="e.g. Build a scalable E-commerce Web Application"
              {...register("title")}
            />
            {errors.title && (
              <p className="text-red-500 text-xs mt-2 font-medium flex items-center animate-pulse">
                <svg className="w-4 h-4 mr-1 inline" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
                {errors.title.message}
              </p>
            )}
          </div>

          {/* DESCRIPTION */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex justify-between">
              Project Description
            </label>
            <textarea
              rows="8"
              className={`w-full p-3 border rounded-lg focus:ring-2 outline-none transition resize-y ${
                errors.description 
                  ? "border-red-400 focus:ring-red-200 focus:border-red-500 bg-red-50" 
                  : "border-gray-300 focus:ring-orange-200 focus:border-orange-500"
              }`}
              placeholder="Provide a comprehensive description of the project requirements, deliverables, and any specific technologies required. Be as detailed as possible."
              {...register("description")}
            ></textarea>
            {errors.description && (
              <p className="text-red-500 text-xs mt-2 font-medium flex items-center animate-pulse">
                 <svg className="w-4 h-4 mr-1 inline" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
                {errors.description.message}
              </p>
            )}
          </div>

          {/* BUDGET */}
          <div className="w-full md:w-1/2 pr-0 md:pr-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Budget (USD)
            </label>
            <div className="relative rounded-xl shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-lg font-medium">$</span>
              </div>
              <input
                type="number"
                step="any"
                className={`w-full pl-10 pr-4 p-2 border rounded-lg focus:ring-2 outline-none transition ${
                  errors.budget 
                    ? "border-red-400 focus:ring-red-200 focus:border-red-500 bg-red-50" 
                    : "border-gray-300 focus:ring-orange-200 focus:border-orange-500"
                }`}
                placeholder="0.00"
                {...register("budget")}
              />
            </div>
            {errors.budget && (
              <p className="text-red-500 text-xs mt-2 font-medium flex items-center animate-pulse">
                 <svg className="w-4 h-4 mr-1 inline" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
                {errors.budget.message}
              </p>
            )}
          </div>

          {/* BUTTONS */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={() => navigate("/")}
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
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Publishing...
                </>
              ) : (
                "Post Project"
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
