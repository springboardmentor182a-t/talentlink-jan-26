// client/src/pages/ClientView.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Briefcase, MapPin, Mail, Phone, Globe } from "lucide-react";
import { getClientProfile } from "../services/api";

export default function ClientView() {
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

        // 2. Fetch the client profile using dynamic ID
        const data = await getClientProfile(userId);
        setProfile(data);
      } catch (error) {
        console.error("Failed to fetch client profile", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) return <div className="p-10 text-center text-gray-500">Loading Company Profile...</div>;

  if (!profile) return (
    <div className="p-10 text-center">
      <p className="text-gray-500 mb-4">No company profile found.</p>
      <Link to="/profile/client/edit" className="text-orange-500 font-bold hover:underline">
        Create your company profile here
      </Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* HEADER CARD */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="h-32 bg-orange-500 w-full"></div>
          <div className="px-8 pb-8">
            <div className="relative flex justify-between items-end -mt-12 mb-6">
              <div className="flex items-end gap-5">
                <div className="w-24 h-24 bg-white rounded-full p-1 shadow-md">
                  <div className="w-full h-full bg-orange-100 rounded-full flex items-center justify-center text-orange-600 text-2xl font-bold">
                    {profile.company_name?.charAt(0) || "C"}
                  </div>
                </div>
                <div className="mb-1">
                  <h1 className="text-2xl font-bold text-gray-900">{profile.company_name}</h1>
                  <p className="text-orange-600 font-medium">{profile.contact_title || "Company Representative"}</p>
                  <div className="flex items-center text-gray-500 text-sm mt-1">
                    <MapPin className="w-4 h-4 mr-1" />
                    {profile.location || "Remote / Global"}
                  </div>
                </div>
              </div>
              <Link to="/profile/client/edit" className="px-4 py-2 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 transition shadow-sm">
                Edit Profile
              </Link>
            </div>
          </div>
        </div>

        {/* CONTENT GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* MAIN CONTENT */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">About the Company</h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                {profile.company_description || profile.company_bio || "No description added yet."}
              </p>
            </div>

            {/* STATS (Static for now, but ready for future) */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 text-center">
                <div className="text-2xl font-bold text-gray-900">0</div>
                <div className="text-xs text-gray-500 uppercase tracking-wide mt-1">Projects Posted</div>
              </div>
              <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 text-center">
                <div className="text-2xl font-bold text-gray-900">$0</div>
                <div className="text-xs text-gray-500 uppercase tracking-wide mt-1">Total Spent</div>
              </div>
              <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 text-center">
                <div className="text-2xl font-bold text-gray-900">0.0</div>
                <div className="text-xs text-gray-500 uppercase tracking-wide mt-1">Rating</div>
              </div>
            </div>
          </div>

          {/* SIDEBAR */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-bold text-gray-900 mb-4">Contact Information</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Industry</p>
                    <p className="text-sm font-medium text-gray-900">{profile.industry || "N/A"}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Website</p>
                    <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-orange-600 hover:underline break-all">
                      {profile.website || "N/A"}
                    </a>
                  </div>
                </div>

                 <div className="flex items-start gap-3">
                  <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="text-sm font-medium text-gray-900">{profile.contact_phone || "N/A"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}