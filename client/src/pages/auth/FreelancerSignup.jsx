import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../utils/api";

const FreelancerSignup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.post("/auth/register", {
        name,
        email,
        password,
        role: "freelancer",
      });
      navigate("/freelancer/login");
    } catch (err) {
      setError(err.response?.data?.detail || "Error creating account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="card card-centered">
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div className="role-icon" style={{ marginLeft: "auto", marginRight: "auto", marginBottom: "1.5rem" }}>💼</div>
          <h2 style={{ fontSize: "1.75rem", marginBottom: "0.5rem" }}>Create Freelancer Account</h2>
          <p style={{ color: "#717182", fontSize: "0.95rem" }}>
            Sign up to start finding projects and building your portfolio
          </p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="freelancer@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-secondary" disabled={loading}>
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div className="divider">OR CONTINUE WITH</div>

        <div className="social-buttons">
          <button type="button" className="btn-social">
            <span>G</span>
            <span>Google</span>
          </button>
          <button type="button" className="btn-social">
            <span>⚙</span>
            <span>GitHub</span>
          </button>
        </div>

        <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
          <span style={{ color: "#717182" }}>Already have an account? </span>
          <Link to="/freelancer/login" className="link">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FreelancerSignup;
