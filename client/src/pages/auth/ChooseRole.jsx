import { useNavigate } from "react-router-dom";

const ChooseRole = () => {
  const navigate = useNavigate();

  return (
    <div className="page-container">
      <div style={{ width: "100%", maxWidth: "1200px", margin: "0 auto" }}>
        {/* Hero Section */}
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <h1 style={{ fontSize: "3rem", fontWeight: "700", marginBottom: "1rem" }}>
            Connect, Collaborate, Create
          </h1>
          <p style={{ fontSize: "1.1rem", color: "#717182", marginBottom: "0.5rem" }}>
            The premier platform connecting talented freelancers with visionary clients.
          </p>
          <p style={{ fontSize: "1.1rem", color: "#717182" }}>
            Choose your path and start building amazing projects today.
          </p>
        </div>

        {/* Role Cards - Centered */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", maxWidth: "900px", margin: "0 auto" }}>
          {/* Client Card */}
          <div className="role-card" onClick={() => navigate("/client/login")}>
            <div className="role-card-header">
              <div className="role-icon">💼</div>
              <span className="role-card-badge">For Businesses</span>
            </div>

            <h3>I'm a Client</h3>
            <p>
              Post projects and hire talented freelancers to bring your vision to life
            </p>

            <ul className="role-features">
              <li>Post unlimited projects</li>
              <li>Review proposals from skilled freelancers</li>
              <li>Manage contracts and track progress</li>
              <li>Secure messaging and payment tracking</li>
            </ul>

            <button className="btn btn-secondary">
              Continue as Client →
            </button>
          </div>

          {/* Freelancer Card */}
          <div className="role-card" onClick={() => navigate("/freelancer/login")}>
            <div className="role-card-header">
              <div className="role-icon" style={{ backgroundColor: "#7c3aed" }}>👤</div>
              <span className="role-card-badge" style={{ backgroundColor: "rgba(124, 58, 237, 0.1)", color: "#7c3aed" }}>For Professionals</span>
            </div>

            <h3>I'm a Freelancer</h3>
            <p>
              Find exciting projects and work with clients from around the world
            </p>

            <ul className="role-features">
              <li>Browse thousands of projects</li>
              <li>Submit competitive proposals</li>
              <li>Build your portfolio and reputation</li>
              <li>Get paid for your expertise</li>
            </ul>

            <button className="btn btn-accent">
              Continue as Freelancer →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChooseRole;
