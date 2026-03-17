import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import AuthCard from "../../components/auth/AuthCard";
import InputField from "../../components/auth/InputField";
import AuthButton from "../../components/auth/AuthButton";
import api from "../../utils/api";
import { AuthContext } from "../../context/AuthContext";

const FreelancerLogin = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    try {
      const res = await api.post("/auth/login/", {
        username: username,
        password: password,
      });

      login({
        token: res.data.access,
        role: "freelancer",
        user: { username },
      });

      navigate("/freelancer/dashboard");
    } catch (err) {
      setError("Invalid credentials");
    }
  };

  return (
    <AuthCard
      title="Freelancer Login"
      subtitle="Find projects and work with clients"
    >
      {error && <p style={{ color: "red" }}>{error}</p>}

      <InputField
        label="Username / Email"
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <InputField
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <div onClick={handleSubmit}>
        <AuthButton text="Login as Freelancer" />
      </div>

      <p style={{ marginTop: "12px", textAlign: "center" }}>
        Don’t have an account?{" "}
        <Link to="/freelancer/signup">Sign up</Link>
      </p>
    </AuthCard>
  );
};

export default FreelancerLogin;
