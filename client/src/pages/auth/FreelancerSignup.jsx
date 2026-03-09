import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import AuthCard from "../../components/auth/AuthCard";
import InputField from "../../components/auth/InputField";
import AuthButton from "../../components/auth/AuthButton";
import api from "../../utils/api";

const FreelancerSignup = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    try {
      await api.post("/auth/register/", {
        username: username,
        email: email,
        password: password,
        role: "freelancer",
      });

      navigate("/freelancer/login");
    } catch (err) {
      setError("Registration failed");
    }
  };

  return (
    <AuthCard
      title="Create Freelancer Account"
      subtitle="Join TalentLink and start freelancing"
    >
      {error && <p style={{ color: "red" }}>{error}</p>}

      <InputField
        label="Username"
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <InputField
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <InputField
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <div onClick={handleSubmit}>
        <AuthButton text="Create Freelancer Account" />
      </div>

      <p style={{ marginTop: "12px", textAlign: "center" }}>
        Already have an account?{" "}
        <Link to="/freelancer/login">Login</Link>
      </p>
    </AuthCard>
  );
};

export default FreelancerSignup;
