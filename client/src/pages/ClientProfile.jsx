// client/src/pages/ClientProfile.jsx
import { useForm } from "react-hook-form";
import { Building2, Globe, FileText, MapPin, Linkedin, Eye, EyeOff } from "lucide-react";
import { createClientProfile } from "../services/api";
import { useState } from "react";

export default function ClientProfile() {
  const { register, handleSubmit, formState: { errors }, watch } = useForm();
  const [isPublic, setIsPublic] = useState(true);

  const onSubmit = async (data) => {
    try {
      const formattedData = {
        ...data,
        is_public: isPublic
      };
      
      // REMEMBER: Use a valid CLIENT User ID here (e.g., 2)
      await createClientProfile(2, formattedData);
      alert("Company Profile Saved Successfully!");
    } catch (error) {
      console.error(error);
      alert("Error saving profile. Check console.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input {...register("company_name", { required: true })} className="pl-10 w-full p-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 transition" placeholder="TechCorp Solutions" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input {...register("industry")} className="pl-10 w-full p-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 transition" placeholder="Fintech, Healthcare..." />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">About the Company</label>
                <textarea {...register("company_description")} rows="4" className="w-full p-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 transition" placeholder="We are building the next generation of..." />
              </div>
            </div>
          </div>

          {/* Section 2: Location & Contact */}
          <div className="p-8 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Location & Web</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input {...register("location_city")} className="w-full p-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 transition" placeholder="Los Angeles" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State/Province</label>
                <input {...register("location_state")} className="w-full p-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 transition" placeholder="California" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <input {...register("location_country")} className="w-full p-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 transition" placeholder="USA" />
              </div>

              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input {...register("website")} className="pl-10 w-full p-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 transition" placeholder="https://company.com" />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn Page</label>
                <div className="relative">
                  <Linkedin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input {...register("linkedin_profile")} className="pl-10 w-full p-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 transition" placeholder="https://linkedin.com/company/..." />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Privacy Settings */}
          <div className="p-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Privacy Settings</h2>
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-white">
              <div className="flex items-center gap-3">
                {isPublic ? <Eye className="h-5 w-5 text-orange-500" /> : <EyeOff className="h-5 w-5 text-gray-400" />}
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Make profile public</h3>
                  <p className="text-xs text-gray-500">Allow freelancers to find your company details.</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
              </label>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
            <button type="button" className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-white transition bg-white shadow-sm">Cancel</button>
            <button type="submit" className="px-6 py-2.5 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 shadow-sm shadow-orange-200 transition">Save Company Profile</button>
          </div>

        </form>
      </div>
    </div>
  );
}