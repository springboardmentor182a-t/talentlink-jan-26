// client/src/pages/ClientProfile.jsx
import { useForm } from "react-hook-form";
import { createClientProfile } from "../services/api";

export default function ClientProfile() {
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    try {
      // Send to Backend (Using User ID 1 for testing)
      await createClientProfile(1, data);
      alert("Client Profile Saved Successfully!");
    } catch (error) {
      alert("Error saving profile. Check console.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-lg mt-10">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Company Profile</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        
        {/* Company Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Company Name</label>
          <input 
            {...register("company_name", { required: true })} 
            className="mt-1 block w-full p-2 border rounded-md border-gray-300"
            placeholder="TechCorp Solutions"
          />
          {errors.company_name && <span className="text-red-500 text-sm">Company Name is required</span>}
        </div>

        {/* Industry */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Industry</label>
          <input 
            {...register("industry")} 
            className="mt-1 block w-full p-2 border rounded-md border-gray-300"
            placeholder="Fintech, Health, E-commerce..."
          />
        </div>

        {/* Company Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700">About the Company</label>
          <textarea 
            {...register("company_description")} 
            className="mt-1 block w-full p-2 border rounded-md border-gray-300"
            rows="4"
            placeholder="We are building the future of..."
          />
        </div>

        {/* Save Button */}
        <button 
          type="submit" 
          className="w-full bg-orange-500 text-white p-2 rounded-md hover:bg-orange-600 transition"
        >
          Save Profile
        </button>
      </form>
    </div>
  );
}