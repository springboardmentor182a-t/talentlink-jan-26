import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../../utils/api";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await api.post("/auth/forgot-password", {
        email,
      });

      setMessage({ type: "success", text: res.data.message });
    } catch (error) {
      setMessage({ type: "error", text: "Error sending reset request" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="card card-centered">
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div className="role-icon" style={{ marginLeft: "auto", marginRight: "auto", marginBottom: "1.5rem" }}>🔑</div>
          <h2 style={{ fontSize: "1.75rem", marginBottom: "0.5rem" }}>Reset Password</h2>
          <p style={{ color: "#717182", fontSize: "0.95rem" }}>
            Enter your email to receive a password reset link
          </p>
        </div>

        {message && (
          <div className={`alert alert-${message.type}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-secondary" disabled={loading}>
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
          <Link to="/" className="link small-text">
            ← Back to role selection
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
