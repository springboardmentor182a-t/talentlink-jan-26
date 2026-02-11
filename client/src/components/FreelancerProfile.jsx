import { useState } from "react";
import "./profile.css";

export default function FreelancerProfile() {

  const [profile, setProfile] = useState({
    fullName: "",
    skills: "",
    hourlyRate: "",
    experience: "",
    location: "",
    availability: "",
    totalProjects: 0,
    completedProjects: 0,
    ongoingProjects: 0,
    profileViews: 0,
    rating: 0,
  });

  const handleChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Freelancer Profile Data:", profile);
    alert("Profile Saved Successfully!");
  };

  return (
    <div className="profile-page">
      <div className="card profile-card">
        <h2>Freelancer Profile</h2>

        {/* Full Name */}
        <div className="profile-field">
          <label>Full Name</label>
          <input
            type="text"
            name="fullName"
            value={profile.fullName}
            onChange={handleChange}
            placeholder="Your name"
          />
        </div>

        {/* Skills */}
        <div className="profile-field">
          <label>Skills</label>
          <input
            type="text"
            name="skills"
            value={profile.skills}
            onChange={handleChange}
            placeholder="React, Django, UI/UX"
          />
        </div>

        {/* Experience */}
        <div className="profile-field">
          <label>Experience (Years)</label>
          <input
            type="number"
            name="experience"
            value={profile.experience}
            onChange={handleChange}
            placeholder="Years of experience"
          />
        </div>

        {/* Hourly Rate */}
        <div className="profile-field">
          <label>Hourly Rate (₹)</label>
          <input
            type="number"
            name="hourlyRate"
            value={profile.hourlyRate}
            onChange={handleChange}
            placeholder="₹ / hour"
          />
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

        {/* Availability */}
        <div className="profile-field">
          <label>Availability</label>
          <input
            type="text"
            name="availability"
            value={profile.availability}
            onChange={handleChange}
            placeholder="Full-time / Part-time"
          />
        </div>

        {/* Portfolio */}
        <div className="profile-field">
          <label>Portfolio</label>
          <textarea
            name="portfolio"
            onChange={handleChange}
            placeholder="Projects, experience"
          ></textarea>
        </div>

        {/* Statistics Section */}
        <div className="profile-stats">
          <h3>Freelancer Statistics</h3>

          <div className="stats-grid">
            <div className="stat-box">
              <h4>{profile.totalProjects}</h4>
              <p>Total Projects</p>
            </div>

            <div className="stat-box">
              <h4>{profile.completedProjects}</h4>
              <p>Completed Projects</p>
            </div>

            <div className="stat-box">
              <h4>{profile.ongoingProjects}</h4>
              <p>Ongoing Projects</p>
            </div>

            <div className="stat-box">
              <h4>{profile.profileViews}</h4>
              <p>Profile Views</p>
            </div>

            <div className="stat-box">
              <h4>{profile.rating} ⭐</h4>
              <p>Rating</p>
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
