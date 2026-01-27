// client/src/pages/FreelancerProfile.jsx
import { useForm } from "react-hook-form";
import { User, Mail, Phone, MapPin, Briefcase, DollarSign } from "lucide-react";
import { createFreelancerProfile } from "../services/api";

export default function FreelancerProfile() {
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    try {
      const formattedData = {
        ...data,
        skills: data.skills.split(",").map(skill => skill.trim()),
        hourly_rate: parseFloat(data.hourly_rate)
      };
      await createFreelancerProfile(1, formattedData);
      alert("Profile Saved Successfully!");
    } catch (error) {
      alert("Error saving profile. Check console.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Breadcrumb & Header */}
        <div className="mb-8">
          <p className="text-sm text-gray-500 mb-1">Dashboard / Profile / <span className="text-orange-600">Edit</span></p>
          <h1 className="text-3xl font-bold text-gray-900">Edit Profile</h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          
          {/* Section 1: Profile Header */}
          <div className="p-8 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Edit Your Profile Information</h2>
            
            {/* Profile Picture Area */}
            <div className="flex items-center gap-6 mb-8">
              <div className="h-24 w-24 rounded-full bg-orange-500 flex items-center justify-center text-white text-3xl font-bold">
                JD
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Upload New Picture</h3>
                <div className="flex gap-3">
                  <button type="button" className="px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition">
                    Choose File
                  </button>
                  <button type="button" className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition">
                    Remove
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">JPG, GIF or PNG. Max size 2MB.</p>
              </div>
            </div>

            {/* Personal Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* First Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input 
                    {...register("full_name", { required: true })}
                    className="pl-10 w-full p-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              {/* Professional Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Professional Title</label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input 
                    {...register("title")}
                    className="pl-10 w-full p-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
                    placeholder="Full Stack Developer"
                  />
                </div>
              </div>

              {/* Bio (Full Width) */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                <textarea 
                  {...register("bio")}
                  rows="4"
                  className="w-full p-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
                  placeholder="I'm a passionate full stack developer..."
                />
                <p className="text-right text-xs text-gray-400 mt-1">0/500 characters</p>
              </div>
            </div>
          </div>

          {/* Section 2: Contact Information */}
          <div className="p-8 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Mail className="h-5 w-5 text-orange-500" />
              Contact Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Email (Read Only usually, but editable here) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input 
                    type="email"
                    className="pl-10 w-full p-2.5 bg-gray-100 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed"
                    placeholder="john.doe@example.com"
                    disabled
                  />
                </div>
              </div>

              {/* Hourly Rate */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hourly Rate (USD)</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input 
                    type="number"
                    {...register("hourly_rate", { required: true })}
                    className="pl-10 w-full p-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
                    placeholder="50"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Skills */}
          <div className="p-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Skills & Expertise</h2>
            <div className="bg-orange-50 p-4 rounded-lg border border-orange-100 mb-4">
              <p className="text-sm text-orange-800">Tip: Separate skills with commas (e.g. React, Node.js, Design)</p>
            </div>
            <input 
              {...register("skills")}
              className="w-full p-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
              placeholder="Type skills and press comma..."
            />
          </div>

          {/* Footer Buttons */}
          <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
            <button type="button" className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-white transition bg-white shadow-sm">
              Cancel
            </button>
            <button type="submit" className="px-6 py-2.5 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 shadow-sm shadow-orange-200 transition">
              Save Changes
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}