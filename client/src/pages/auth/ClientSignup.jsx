import { useState } from "react";
import AuthCard from "../../components/auth/AuthCard";
import InputField from "../../components/auth/InputField";
import AuthButton from "../../components/auth/AuthButton";
import api from "../../utils/api";

const ClientSignup = () => {
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async () => {
    await api.post("/auth/register", {
      name: company,
      email,
      password,
      role: "client",
    });
  };

  return (
    <AuthCard title="Create Client Account" subtitle="Hire freelancers">
      <InputField label="Company Name" type="text" value={company} onChange={(e) => setCompany(e.target.value)} />
      <InputField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <InputField label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <div onClick={handleSubmit}>
        <AuthButton text="Create Account" />
      </div>
    </AuthCard>
  );
};

export default ClientSignup;
