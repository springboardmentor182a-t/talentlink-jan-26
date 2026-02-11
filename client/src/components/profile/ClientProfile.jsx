import { useState } from "react";
import "./profile.css";

export default function ClientProfile() {

  const [profile, setProfile] = useState({
    companyName: "",
    about: "",
    location: "",
    website: "",
    industry: "",
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    profileViews: 0,
  });

  const handleChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Client Profile Data:", profile);
    alert("Profile Saved Successfully!");
  };

  return (
    <div className="profile-page">
      <div className="card profile-card">
        <h2>Client Profile</h2>

        {/* Company Name */}
        <div className="profile-field">
          <label>Company Name</label>
          <input
            type="text"
            name="companyName"
            value={profile.companyName}
            onChange={handleChange}
            placeholder="Enter company name"
          />
        </div>

        {/* About */}
        <div className="profile-field">
          <label>About Company</label>
          <textarea
            name="about"
            value={profile.about}
            onChange={handleChange}
            placeholder="Brief description about company"
          ></textarea>
        </div>

        {/* Location */}
        <div className="profile-field">
          <label>Location</label>
          <input
            type="text"
            name="location"
            value={profile.location}
            onChange={handleChange}
            placeholder="City, Country"
          />
        </div>

        {/* Website */}
        <div className="profile-field">
          <label>Website</label>
          <input
            type="text"
            name="website"
            value={profile.website}
            onChange={handleChange}
            placeholder="https://company.com"
          />
        </div>

        {/* Industry */}
        <div className="profile-field">
          <label>Industry</label>
          <input
            type="text"
            name="industry"
            value={profile.industry}
            onChange={handleChange}
            placeholder="IT, Finance, Healthcare etc."
          />
        </div>

        {/* Project Statistics Section */}
        <div className="profile-stats">
          <h3>Project Statistics</h3>

          <div className="stats-grid">
            <div className="stat-box">
              <h4>{profile.totalProjects}</h4>
              <p>Total Projects</p>
            </div>

            <div className="stat-box">
              <h4>{profile.activeProjects}</h4>
              <p>Active Projects</p>
            </div>

            <div className="stat-box">
              <h4>{profile.completedProjects}</h4>
              <p>Completed Projects</p>
            </div>

            <div className="stat-box">
              <h4>{profile.profileViews}</h4>
              <p>Profile Views</p>
            </div>
          </div>
        </div>

        <button className="btn-primary" onClick={handleSubmit}>
          Save Profile
        </button>
      </div>
    </div>
  );
}
