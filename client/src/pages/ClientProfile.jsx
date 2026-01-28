// client/src/pages/ClientProfile.jsx
import { useForm } from "react-hook-form";
import { Building2, Globe, FileText, MapPin } from "lucide-react"; // Business icons
import { createClientProfile } from "../services/api";

export default function ClientProfile() {
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    try {
      await createClientProfile(1, data);
      alert("Company Profile Saved Successfully!");
    } catch (error) {
      alert("Error saving profile. Check console.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Breadcrumb & Header */}
        <div className="mb-8">
          <p className="text-sm text-gray-500 mb-1">Dashboard / Client / <span className="text-orange-600">Profile</span></p>
          <h1 className="text-3xl font-bold text-gray-900">Company Settings</h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          
          {/* Section 1: Company Details */}
          <div className="p-8 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Building2 className="h-6 w-6 text-orange-500" />
              Company Information
            </h2>
            
            {/* Logo Upload (Visual Only for now) */}
            <div className="flex items-center gap-6 mb-8">
              <div className="h-24 w-24 rounded-lg bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400">
                <span className="text-xs text-center">Logo<br/>Upload</span>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Company Logo</h3>
                <button type="button" className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition">
                  Upload Image
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Company Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input 
                    {...register("company_name", { required: true })}
                    className="pl-10 w-full p-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
                    placeholder="TechCorp Solutions"
                  />
                </div>
                {errors.company_name && <span className="text-red-500 text-xs mt-1">Required</span>}
              </div>

              {/* Industry */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input 
                    {...register("industry")}
                    className="pl-10 w-full p-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
                    placeholder="Fintech, Healthcare, AI..."
                  />
                </div>
              </div>

              {/* Description (Full Width) */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">About the Company</label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <textarea 
                    {...register("company_description")}
                    rows="4"
                    className="pl-10 w-full p-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
                    placeholder="We are building the next generation of..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
            <button type="button" className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-white transition bg-white shadow-sm">
              Cancel
            </button>
            <button type="submit" className="px-6 py-2.5 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 shadow-sm shadow-orange-200 transition">
              Save Company Profile
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}