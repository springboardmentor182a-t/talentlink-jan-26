import "./profile.css";

export default function ClientProfile() {
  return (
    <div className="profile-page">
      <div className="card profile-card">
        <h2>Client Profile</h2>

        <div className="profile-field">
          <label>Company Name</label>
          <input type="text" placeholder="Enter company name" />
        </div>

        <div className="profile-field">
          <label>About Company</label>
          <textarea placeholder="Brief description"></textarea>
        </div>

        <div className="profile-field">
          <label>Location</label>
          <input type="text" placeholder="City, Country" />
        </div>

        <button className="btn-primary">Save Profile</button>
      </div>
    </div>
  );
}
