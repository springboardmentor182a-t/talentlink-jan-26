import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import ChooseRole from "./pages/auth/ChooseRole";
import ClientLogin from "./pages/auth/ClientLogin";
import ClientSignup from "./pages/auth/ClientSignup";
import FreelancerLogin from "./pages/auth/FreelancerLogin";
import FreelancerSignup from "./pages/auth/FreelancerSignup";
import ForgotPassword from "./pages/auth/ForgotPassword";

import Sidebar from "./layout/Sidebar";
import ClientDashboard from "./pages/ClientDashboard";

import "./App.css";

// Dashboard layout (NO router, NO provider here)
const DashboardLayout = ({ children }) => {
  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <main
        style={{
          flex: 1,
          marginLeft: "250px",
          minHeight: "100vh",
          backgroundColor: "var(--background)",
        }}
      >
        {children}
      </main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public / Auth routes */}
          <Route path="/" element={<ChooseRole />} />
          <Route path="/client/login" element={<ClientLogin />} />
          <Route path="/client/signup" element={<ClientSignup />} />
          <Route path="/freelancer/login" element={<FreelancerLogin />} />
          <Route path="/freelancer/signup" element={<FreelancerSignup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Client dashboard */}
          <Route
            path="/dashboard"
            element={
              <DashboardLayout>
                <ClientDashboard />
              </DashboardLayout>
            }
          />

          {/* Fallback */}
          <Route
            path="*"
            element={<div style={{ padding: "24px" }}>Page not found</div>}
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
