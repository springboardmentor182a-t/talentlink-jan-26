import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import Sidebar from "./layout/Sidebar";
import ClientDashboard from "./pages/ClientDashboard";

// Auth pages
import ChooseRole from "./pages/auth/ChooseRole";
import ClientLogin from "./pages/auth/ClientLogin";
import ClientSignup from "./pages/auth/ClientSignup";
import FreelancerLogin from "./pages/auth/FreelancerLogin";
import FreelancerSignup from "./pages/auth/FreelancerSignup";

import "./App.css";

// Dashboard layout with sidebar
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
      <Router>
        <Routes>
          {/* Public / Auth routes */}
          <Route path="/" element={<ChooseRole />} />
          <Route path="/client/login" element={<ClientLogin />} />
          <Route path="/client/signup" element={<ClientSignup />} />
          <Route path="/freelancer/login" element={<FreelancerLogin />} />
          <Route path="/freelancer/signup" element={<FreelancerSignup />} />

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
          <Route path="*" element={<div style={{ padding: "24px" }}>Page not found</div>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
