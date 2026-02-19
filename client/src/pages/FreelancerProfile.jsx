// client/src/pages/FreelancerProfile.jsx
import { useForm } from "react-hook-form";
import { User, Mail, Phone, MapPin, Briefcase, DollarSign, Globe, Linkedin, Github, Twitter, Calendar, Clock } from "lucide-react";
import { createFreelancerProfile } from "../services/api";

export default function FreelancerProfile() {
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    try {
      // 1. Get the dynamically logged-in user from local storage
      const storedUser = localStorage.getItem("user");
      if (!storedUser) {
        console.error("No user logged in!");
        alert("You must be logged in to save your profile.");
        return;
      }
      const user = JSON.parse(storedUser);
      const userId = user.id; 

      // 2. Format the data for the backend
      const formattedData = {
        ...data,
        skills: data.skills.split(",").map(skill => skill.trim()),
        hourly_rate: parseFloat(data.hourly_rate),
        // Ensure empty strings are sent as null if needed, or keep as strings
      };
      
      // 3. Send to API using the real user ID
      await createFreelancerProfile(userId, formattedData);
      alert("Profile Saved Successfully!");
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
          <p className="text-sm text-gray-500 mb-1">Dashboard / Profile / <span className="text-orange-600">Edit</span></p>
          <h1 className="text-3xl font-bold text-gray-900">Edit Profile</h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          
          {/* Section 1: Personal Info */}
          <div className="p-8 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Personal Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input {...register("full_name", { required: true })} className="pl-10 w-full p-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 transition" placeholder="John Doe" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Professional Title</label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input {...register("title")} className="pl-10 w-full p-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 transition" placeholder="Full Stack Developer" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input {...register("location")} className="pl-10 w-full p-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 transition" placeholder="New York, USA" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input {...register("phone")} className="pl-10 w-full p-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 transition" placeholder="+1 (555) 000-0000" />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                <textarea {...register("bio")} rows="4" className="w-full p-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 transition" placeholder="I'm a passionate developer..." />
              </div>
            </div>
          </div>

          {/* Section 2: Professional Details */}
          <div className="p-8 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Professional Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hourly Rate ($)</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input type="number" {...register("hourly_rate", { required: true })} className="pl-10 w-full p-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 transition" placeholder="50" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input {...register("years_experience")} className="pl-10 w-full p-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 transition" placeholder="e.g. 5-10 years" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <select {...register("availability")} className="pl-10 w-full p-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 transition">
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                  </select>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Skills (Comma Separated)</label>
                <input {...register("skills")} className="w-full p-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 transition" placeholder="React, Node.js, Python..." />
              </div>
            </div>
          </div>

          {/* Section 3: Social Links (New!) */}
          <div className="p-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Social Links</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn URL</label>
                <div className="relative">
                  <Linkedin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input {...register("linkedin")} className="pl-10 w-full p-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 transition" placeholder="https://linkedin.com/in/..." />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">GitHub URL</label>
                <div className="relative">
                  <Github className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input {...register("github")} className="pl-10 w-full p-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 transition" placeholder="https://github.com/..." />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Portfolio Website</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input {...register("portfolio_website")} className="pl-10 w-full p-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 transition" placeholder="https://myportfolio.com" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Twitter / X</label>
                <div className="relative">
                  <Twitter className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input {...register("twitter")} className="pl-10 w-full p-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 transition" placeholder="https://twitter.com/..." />
                </div>
              </div>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
            <button type="button" className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-white transition bg-white shadow-sm">Cancel</button>
            <button type="submit" className="px-6 py-2.5 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 shadow-sm shadow-orange-200 transition">Save Changes</button>
          </div>

        </form>
      </div>
    </div>
  );
}