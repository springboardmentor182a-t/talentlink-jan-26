import React, { useState } from "react";
import "./styles/theme.css";

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import ClientDashboard from "./pages/ClientDashboard";
import ClientProfile from "./components/profile/ClientProfile";
import FreelancerProfile from "./components/profile/FreelancerProfile";
import ReceivedProposals from "./pages/client/ReceivedProposals";
import ClientMessages from "./pages/client/ClientMessages";
import { FreelancerRoutes } from "./pages/freelancer/FreelancerRoutes";

import Login from "./pages/login";
import SignUp from "./pages/signup";
import ForgotPassword from "./pages/forgotPassword";
import ResetPassword from "./pages/resetPassword";

import authService from "./services/auth";
import { FaUser, FaBriefcase, FaHome } from "react-icons/fa";

const PrivateRoute = ({ children }) => {
  return authService.isAuthenticated() ? children : <Navigate to="/login" />;
};

const DashboardRouter = () => {
  const role = authService.getUserRole();
  if (role === "Freelancer") {
    return <Navigate to="/freelancer/dashboard" replace />;
  }
  return <Navigate to="/client" replace />;
};

function App() {
  const [activePage, setActivePage] = useState("dashboard");

  return (
    <Router>
      <div className="App">

        {/* HEADER */}
        <div
          style={{
            height: "60px",
            background: "var(--primary)",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 20px",
            fontWeight: "bold",
            fontSize: "18px",
          }}
        >
          <span>🚀 TalentLink</span>
          <span>Safna 👩‍💻</span>
        </div>

        <Routes>
          {/* AUTH ROUTES */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* ROOT */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <DashboardRouter />
              </PrivateRoute>
            }
          />

          {/* CLIENT DASHBOARD WITH SIDEBAR */}
          <Route
            path="/client"
            element={
              <PrivateRoute>
                <div className="dashboard">

                  {/* SIDEBAR */}
                  <div className="sidebar">
                    <h3 style={{ marginBottom: "20px" }}>Menu</h3>

                    <div
                      onClick={() => setActivePage("dashboard")}
                      style={{
                        marginBottom: "15px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        fontWeight:
                          activePage === "dashboard" ? "bold" : "normal",
                        color:
                          activePage === "dashboard" ? "#fff" : "#CBD5E1",
                      }}
                    >
                      <FaHome style={{ marginRight: "8px" }} />
                      Dashboard
                    </div>

                    <div
                      onClick={() => setActivePage("client")}
                      style={{
                        marginBottom: "15px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        fontWeight:
                          activePage === "client" ? "bold" : "normal",
                        color:
                          activePage === "client" ? "#fff" : "#CBD5E1",
                      }}
                    >
                      <FaBriefcase style={{ marginRight: "8px" }} />
                      Client Profile
                    </div>

                    <div
                      onClick={() => setActivePage("freelancer")}
                      style={{
                        marginBottom: "15px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        fontWeight:
                          activePage === "freelancer" ? "bold" : "normal",
                        color:
                          activePage === "freelancer" ? "#fff" : "#CBD5E1",
                      }}
                    >
                      <FaUser style={{ marginRight: "8px" }} />
                      Freelancer Profile
                    </div>
                  </div>

                  {/* CONTENT */}
                  <div className="content">
                    {activePage === "dashboard" && <ClientDashboard />}
                    {activePage === "client" && <ClientProfile />}
                    {activePage === "freelancer" && <FreelancerProfile />}
                  </div>

                </div>
              </PrivateRoute>
            }
          />

          {/* OTHER ROUTES */}
          <Route
            path="/client/received-proposals"
            element={
              <PrivateRoute>
                <ReceivedProposals />
              </PrivateRoute>
            }
          />

          <Route
            path="/client/messages"
            element={
              <PrivateRoute>
                <ClientMessages />
              </PrivateRoute>
            }
          />
          <Route
            path="/freelancer/*"
            element={
              <PrivateRoute>
                <FreelancerRoutes />
              </PrivateRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;