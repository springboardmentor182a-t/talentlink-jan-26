// client/src/pages/FreelancerView.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Star, Plus } from "lucide-react";
import { getFreelancerProfile } from "../services/api";

export default function FreelancerView() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // 1. Get the real user ID from local storage
        const storedUser = localStorage.getItem("user");
        if (!storedUser) {
          setLoading(false);
          return;
        }
        const user = JSON.parse(storedUser);
        const userId = user.id;

        // 2. Fetch the profile using the dynamic ID
        const data = await getFreelancerProfile(userId);
        setProfile(data);
      } catch (error) {
        console.error("Failed to fetch profile", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, []);

  if (loading) return <div className="p-10 text-center text-gray-500">Loading Profile...</div>;
  
  // If no profile exists yet, show a friendly message
  if (!profile) return (
    <div className="p-10 text-center">
      <p className="text-gray-500 mb-4">No profile found.</p>
      <Link to="/profile/freelancer/edit" className="text-orange-500 font-bold hover:underline">
        Create your profile here
      </Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
            <div className="w-24 h-24 bg-orange-500 rounded-full mx-auto flex items-center justify-center text-white text-3xl font-bold mb-4">
              {profile.full_name?.charAt(0) || "U"}
            </div>
            
            {/* DYNAMIC DATA IS HERE */}
            <h1 className="text-xl font-bold text-gray-900">{profile.full_name}</h1>
            <p className="text-gray-500 text-sm mb-2">{profile.title}</p>
            
            <div className="flex items-center justify-center gap-1 mb-6 text-orange-500 font-bold">
              <Star className="h-4 w-4 fill-current" /> {profile.rating || "0.0"} <span className="text-gray-400 font-normal text-sm">(0 reviews)</span>
            </div>

            <Link to="/profile/freelancer/edit" className="block w-full py-2.5 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 transition">
              Edit Profile
            </Link>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Statistics</h3>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Hourly Rate</span>
                <span className="font-medium text-gray-900">${profile.hourly_rate}/hr</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Experience</span>
                <span className="font-medium text-gray-900">{profile.years_experience} Years</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-900">About Me</h2>
              <Link to="/profile/freelancer/edit" className="text-sm text-orange-500 hover:underline">Edit</Link>
            </div>
            <p className="text-gray-600 leading-relaxed">
              {profile.bio || "No bio added yet."}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-900">Skills</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {profile.skills && profile.skills.length > 0 ? (
                profile.skills.map((skill, index) => (
                  <span key={index} className="px-3 py-1 bg-orange-50 text-orange-700 text-sm rounded-full font-medium">
                    {skill}
                  </span>
                ))
              ) : (
                <span className="text-gray-400 text-sm">No skills listed.</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}