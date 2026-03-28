import React, { useEffect, useState } from "react";
import axiosInstance from "../services/axios";

const FreelancerDashboard = () => {
  const [contracts, setContracts] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading]     = useState(true);

  // Pull real user from localStorage — same pattern as rest of the app
  const storedUser  = JSON.parse(localStorage.getItem("user") || "{}");
  const username    = storedUser.username || storedUser.email || "there";

  useEffect(() => {
    const userId = storedUser.id;
    Promise.all([
      axiosInstance.get("/contracts/").catch(() => ({ data: [] })),
      userId
        ? axiosInstance.get(`/users/${userId}/proposals`).catch(() => ({ data: [] }))
        : Promise.resolve({ data: [] }),
    ]).then(([contractsRes, proposalsRes]) => {
      setContracts(contractsRes.data);
      setProposals(proposalsRes.data);
    }).finally(() => setLoading(false));
  }, []);

  const activeProjects  = contracts.filter(c => c.status === "active").length;
  const proposalsSent   = proposals.length;

  const stats = [
    { label: "Active Projects",  value: loading ? "—" : activeProjects },
    { label: "Proposals Sent",   value: loading ? "—" : proposalsSent  },
    { label: "Profile Views",    value: "—" },
  ];

  return (
    <div style={{ padding: "40px", backgroundColor: "#F8F9FA", minHeight: "100vh", fontFamily: "sans-serif" }}>

      {/* Welcome card */}
      <div style={{ backgroundColor: "white", borderRadius: "15px", padding: "30px", border: "1px solid #E9ECEF", marginBottom: "30px" }}>
        <h1 style={{ margin: "0 0 6px 0" }}>Welcome back 👋</h1>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ color: "#6C757D", fontSize: "15px" }}>{username}</span>
          <span style={{
            backgroundColor: "#FFF5EE",
            color: "#FF7A1A",
            padding: "2px 10px",
            borderRadius: "999px",
            fontSize: "12px",
            fontWeight: 600,
          }}>
            freelancer
          </span>
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
        {stats.map((stat, i) => (
          <div key={i} style={{ backgroundColor: "white", borderRadius: "15px", padding: "25px", border: "1px solid #E9ECEF" }}>
            <p style={{ margin: "0 0 8px 0", color: "#6C757D", fontSize: "14px" }}>{stat.label}</p>
            <h2 style={{ margin: 0, fontSize: "28px", fontWeight: 700 }}>{stat.value}</h2>
          </div>
        ))}
      </div>

    </div>
  );
};

export default FreelancerDashboard;