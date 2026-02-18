import { useState, useContext } from "react";
import { Link } from "react-router-dom";
import AuthCard from "../../components/auth/AuthCard";
import InputField from "../../components/auth/InputField";
import AuthButton from "../../components/auth/AuthButton";
import api from "../../utils/api";
import { AuthContext } from "../../context/AuthContext";

const ClientLogin = () => {
  const { login } = useContext(AuthContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    try {
      const res = await api.post("/auth/login", {
        email,
        password,
        role: "client",
      });

      login(res.data);
    } catch (err) {
      setError("Invalid email or password");
    }
  };

  return (
    <AuthCard
      title="Client Login"
      subtitle="Manage projects and freelancers"
    >
      {error && (
        <p style={{ color: "red", textAlign: "center" }}>{error}</p>
      )}

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
        <AuthButton text="Sign In" />
      </div>

      <p style={{ marginTop: "12px", textAlign: "center" }}>
        <Link to="/forgot-password">Forgot Password?</Link>
      </p>

      <p style={{ marginTop: "12px", textAlign: "center" }}>
        Don’t have an account?{" "}
        <Link to="/client/signup">Sign up</Link>
      </p>
    </AuthCard>
  );
};

export default ClientLogin;
