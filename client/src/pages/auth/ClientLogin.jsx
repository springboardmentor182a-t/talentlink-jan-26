import { useState, useContext } from "react";
import AuthCard from "../../components/auth/AuthCard";
import InputField from "../../components/auth/InputField";
import AuthButton from "../../components/auth/AuthButton";
import api from "../../utils/api";
import { AuthContext } from "../../context/AuthContext";

const ClientLogin = () => {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async () => {
    const res = await api.post("/auth/login", {
      email,
      password,
    });
    login({
      token: res.data.access_token,
      role: "client",
      user: { email },
    });
  };

  return (
    <AuthCard title="Client Login" subtitle="Manage projects and freelancers">
      <InputField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <InputField label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <div onClick={handleSubmit}>
        <AuthButton text="Sign In" />
      </div>
    </AuthCard>
  );
};

export default ClientLogin;
