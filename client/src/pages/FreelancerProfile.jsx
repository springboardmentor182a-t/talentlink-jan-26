// client/src/pages/FreelancerProfile.jsx
import { useForm } from "react-hook-form";
import { createFreelancerProfile } from "../services/api";

export default function FreelancerProfile() {
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    try {
      // 1. Convert the comma-separated string "React, Python" into a list ["React", "Python"]
      const formattedData = {
        ...data,
        skills: data.skills.split(",").map(skill => skill.trim()),
        hourly_rate: parseFloat(data.hourly_rate)
      };

      // 2. Send to Backend (Hardcoded User ID 1 for testing until we build Login)
      await createFreelancerProfile(1, formattedData);
      alert("Profile Saved Successfully!");
    } catch (error) {
      alert("Error saving profile. Check console.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-lg mt-10">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Edit Your Profile</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        
        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Full Name</label>
          <input 
            {...register("full_name", { required: true })} 
            className="mt-1 block w-full p-2 border rounded-md border-gray-300"
            placeholder="John Doe"
          />
          {errors.full_name && <span className="text-red-500 text-sm">Name is required</span>}
        </div>

        {/* Professional Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Professional Title</label>
          <input 
            {...register("title")} 
            className="mt-1 block w-full p-2 border rounded-md border-gray-300"
            placeholder="Full Stack Developer"
          />
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Bio</label>
          <textarea 
            {...register("bio")} 
            className="mt-1 block w-full p-2 border rounded-md border-gray-300"
            rows="4"
            placeholder="Tell us about yourself..."
          />
        </div>

        {/* Hourly Rate */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Hourly Rate ($)</label>
          <input 
            type="number" 
            {...register("hourly_rate", { required: true })} 
            className="mt-1 block w-full p-2 border rounded-md border-gray-300"
            placeholder="50"
          />
        </div>

        {/* Skills */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Skills (comma separated)</label>
          <input 
            {...register("skills")} 
            className="mt-1 block w-full p-2 border rounded-md border-gray-300"
            placeholder="React, Python, Figma"
          />
        </div>

        {/* Save Button */}
        <button 
          type="submit" 
          className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition"
        >
          Save Profile
        </button>
      </form>
    </div>
  );
}