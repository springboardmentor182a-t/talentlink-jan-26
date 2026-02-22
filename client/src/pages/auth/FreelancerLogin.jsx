import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../utils/api";
import { AuthContext } from "../../context/AuthContext";

const FreelancerLogin = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/auth/login", {
        email,
        password,
        role: "freelancer",
      });

      login(res.data);
      navigate("/freelancer/dashboard");
    } catch (err) {
      setError(err.response?.data?.detail || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <button
        onClick={() => navigate("/")}
        style={{
          position: "absolute",
          top: "1.5rem",
          left: "1.5rem",
          background: "none",
          border: "none",
          color: "#1f63ff",
          fontSize: "1.1rem",
          cursor: "pointer",
          padding: "0.5rem",
          fontWeight: "500",
        }}
      >
        ← Back
      </button>
      <div className="card card-centered">
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div className="role-icon" style={{ marginLeft: "auto", marginRight: "auto", marginBottom: "1.5rem" }}>💼</div>
          <h2 style={{ fontSize: "1.75rem", marginBottom: "0.5rem" }}>Freelancer Login</h2>
          <p style={{ color: "#717182", fontSize: "0.95rem" }}>
            Access your dashboard to browse projects and manage proposals
          </p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
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
            {loading ? "Signing in..." : "Sign In"}
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
          <Link to="/forgot-password" className="link small-text">
            Forgot Password?
          </Link>
        </div>

        <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
          <span style={{ color: "#717182" }}>Don't have an account? </span>
          <Link to="/freelancer/signup" className="link">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FreelancerLogin;
