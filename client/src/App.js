import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import ChooseRole        from "./pages/auth/ChooseRole";
import ClientLogin       from "./pages/auth/ClientLogin";
import ClientSignup      from "./pages/auth/ClientSignup";
import FreelancerLogin   from "./pages/auth/FreelancerLogin";
import FreelancerSignup  from "./pages/auth/FreelancerSignup";
import ForgotPassword    from "./pages/auth/ForgotPassword";

import "./App.css";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"                   element={<ChooseRole />} />
        <Route path="/client/login"       element={<ClientLogin />} />
        <Route path="/client/signup"      element={<ClientSignup />} />
        <Route path="/freelancer/login"   element={<FreelancerLogin />} />
        <Route path="/freelancer/signup"  element={<FreelancerSignup />} />
        <Route path="/forgot-password"    element={<ForgotPassword />} />
        {/* catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
