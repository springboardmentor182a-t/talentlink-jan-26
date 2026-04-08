import React, { useEffect, useState } from "react";

import { FreelancerShellContext } from "../../context/FreelancerShellContext";
import { fetchFreelancerProfile } from "../../services/freelancer";
import Header from "./Header";
import Sidebar from "./Sidebar";
import "./FreelancerLayout.css";

const FreelancerLayout = ({ children }) => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadProfile = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchFreelancerProfile();
      setProfileData(data);
    } catch (err) {
      setError(err.message || "Failed to load freelancer profile.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  return (
    <FreelancerShellContext.Provider
      value={{
        profileData,
        loading,
        error,
        refreshProfile: loadProfile,
      }}
    >
      <div className="freelancer-layout">
        <Sidebar />
        <div className="freelancer-main">
          <Header />
          <div className="freelancer-content">{children}</div>
        </div>
      </div>
    </FreelancerShellContext.Provider>
  );
};

export default FreelancerLayout;
