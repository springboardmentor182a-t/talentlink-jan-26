import React, { useState } from "react";
import "./styles/theme.css";

import ClientDashboard from "./pages/ClientDashboard";
import ClientProfile from "./components/profile/ClientProfile";
import FreelancerProfile from "./components/profile/FreelancerProfile";

import { FaUser, FaBriefcase, FaHome } from "react-icons/fa";

function App() {
  const [activePage, setActivePage] = useState("dashboard");

  return (
    <div>
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

      {/* MAIN LAYOUT */}
      <div className="dashboard">

        {/* SIDEBAR */}
        <div className="sidebar">
          <h3 style={{ marginBottom: "20px" }}>Menu</h3>

          {/* Dashboard */}
          <div
            onClick={() => setActivePage("dashboard")}
            style={{
              marginBottom: "15px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              fontWeight: activePage === "dashboard" ? "bold" : "normal",
              color: activePage === "dashboard" ? "#fff" : "#CBD5E1",
            }}
          >
            <FaHome style={{ marginRight: "8px" }} />
            Dashboard
          </div>

          {/* Client Profile */}
          <div
            onClick={() => setActivePage("client")}
            style={{
              marginBottom: "15px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              fontWeight: activePage === "client" ? "bold" : "normal",
              color: activePage === "client" ? "#fff" : "#CBD5E1",
            }}
          >
            <FaBriefcase style={{ marginRight: "8px" }} />
            Client Profile
          </div>

          {/* Freelancer Profile */}
          <div
            onClick={() => setActivePage("freelancer")}
            style={{
              marginBottom: "15px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              fontWeight: activePage === "freelancer" ? "bold" : "normal",
              color: activePage === "freelancer" ? "#fff" : "#CBD5E1",
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
    </div>
  );
}

export default App;