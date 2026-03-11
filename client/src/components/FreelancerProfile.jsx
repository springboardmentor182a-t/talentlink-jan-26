import "./profile.css";

export default function FreelancerProfile() {
  return (
    <div className="profile-page">
      <div className="card profile-card">
        <h2>Freelancer Profile</h2>

        <div className="profile-field">
          <label>Full Name</label>
          <input type="text" placeholder="Your name" />
        </div>

        <div className="profile-field">
          <label>Skills</label>
          <input type="text" placeholder="React, Django, UI/UX" />
        </div>

        <div className="profile-field">
          <label>Hourly Rate</label>
          <input type="number" placeholder="₹ / hour" />
        </div>

        <div className="profile-field">
          <label>Portfolio</label>
          <textarea placeholder="Projects, experience"></textarea>
        </div>

        <button className="btn-primary">Save Profile</button>
      </div>
    </div>
  );
}
