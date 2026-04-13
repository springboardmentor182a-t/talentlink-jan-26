import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../services/axios";
import { getSavedProjects } from "../services/api";

// ── Small reusable pieces ─────────────────────────────────────────────────────

const statusStyles = {
  active:       { bg: "#DCFCE7", color: "#166534" },
  pending_sign: { bg: "#FEF9C3", color: "#854D0E" },
  pending:      { bg: "#FEF9C3", color: "#854D0E" },
  Pending:      { bg: "#FEF9C3", color: "#854D0E" },
  completed:    { bg: "#DBEAFE", color: "#1E40AF" },
  rejected:     { bg: "#FEE2E2", color: "#991B1B" },
  cancelled:    { bg: "#F3F4F6", color: "#6B7280" },
  accepted:     { bg: "#DCFCE7", color: "#166534" },
};

const StatusBadge = ({ status }) => {
  const s = statusStyles[status] || { bg: "#F3F4F6", color: "#6B7280" };
  return (
    <span style={{
      backgroundColor: s.bg, color: s.color,
      padding: "3px 10px", borderRadius: "999px",
      fontSize: "11px", fontWeight: 700, textTransform: "capitalize",
    }}>
      {status?.replace("_", " ")}
    </span>
  );
};

const Card = ({ children, style = {} }) => (
  <div style={{
    backgroundColor: "white", borderRadius: "12px",
    border: "1px solid #E9ECEF", padding: "24px", ...style,
  }}>
    {children}
  </div>
);

const SectionTitle = ({ icon, children }) => (
  <h2 style={{ margin: "0 0 16px 0", fontSize: "15px", fontWeight: 700, color: "#1F2937", display: "flex", alignItems: "center", gap: 6 }}>
    {icon && <span>{icon}</span>}
    {children}
  </h2>
);

const EmptyState = ({ message, actionLabel, onAction }) => (
  <div style={{ textAlign: "center", padding: "32px 0", color: "#9CA3AF" }}>
    <p style={{ margin: "0 0 12px 0", fontSize: "14px" }}>{message}</p>
    {actionLabel && (
      <button
        onClick={onAction}
        style={{ background: "#FF7A1A", color: "white", border: "none", padding: "8px 18px", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: 600 }}
      >
        {actionLabel}
      </button>
    )}
  </div>
);

// ── Main Component ────────────────────────────────────────────────────────────

export default function FreelancerDashboard() {
  const navigate = useNavigate();

  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const username   = storedUser.freelancer_profile?.full_name || storedUser.username || "there";
  const userId     = storedUser.id;

  const [contracts,     setContracts]     = useState([]);
  const [proposals,     setProposals]     = useState([]);
  const [savedProjects, setSavedProjects] = useState([]); // enriched with project details
  const [loading,       setLoading]       = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [contractsRes, proposalsRes, savedRes] = await Promise.all([
          axiosInstance.get("/contracts/").catch(() => ({ data: [] })),
          userId
            ? axiosInstance.get(`/users/${userId}/proposals`).catch(() => ({ data: [] }))
            : Promise.resolve({ data: [] }),
          getSavedProjects().catch(() => []),
        ]);

        const contractsList = Array.isArray(contractsRes.data) ? contractsRes.data : [];
        const proposalsList = Array.isArray(proposalsRes.data) ? proposalsRes.data : [];
        const savedList     = Array.isArray(savedRes) ? savedRes : [];

        setContracts(contractsList);
        setProposals(proposalsList);

        // Enrich saved entries with full project details
        if (savedList.length > 0) {
          const projectsRes = await axiosInstance.get("/projects/").catch(() => ({ data: [] }));
          const allProjects = projectsRes.data?.items ?? projectsRes.data ?? [];
          const enriched = savedList
            .map(s => ({
              ...s,
              project: allProjects.find(p => p.id === s.project_id) || null,
            }))
            .filter(s => s.project !== null);
          setSavedProjects(enriched);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userId]);

  const activeContracts  = contracts.filter(c => c.status === "active");
  const pendingContracts = contracts.filter(c => c.status === "pending_sign");

  // ── Stat cards (matches screenshot layout) ──────────────────────────────────
  const stats = [
    { label: "active projects",   value: loading ? "—" : activeContracts.length },
    { label: "pending proposals", value: loading ? "—" : proposals.filter(p => (p.status || "").toLowerCase() === "pending").length },
    {
      label: "total earnings",
      value: loading ? "—" : (() => {
        const total = contracts
          .filter(c => c.status === "completed" || c.status === "active")
          .reduce((sum, c) => sum + (Number(c.budget) || 0), 0);
        return total >= 1000 ? `$${(total / 1000).toFixed(1)}k` : `$${total}`;
      })(),
    },
    { label: "saved projects",    value: loading ? "—" : savedProjects.length },
  ];

  return (
    <div style={{ padding: "32px 40px", backgroundColor: "#F8F9FA", minHeight: "100vh", fontFamily: "sans-serif" }}>

      {/* ── Welcome ── */}
      <h1 style={{ margin: "0 0 4px 0", fontSize: "26px", fontWeight: 800, color: "#111827" }}>
        Welcome back, {username}! 👋
      </h1>
      <p style={{ margin: "0 0 28px 0", color: "#6B7280", fontSize: "14px" }}>
        Ready to find your next project?
      </p>

      {/* ── 4 stat cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "28px" }}>
        {stats.map((stat, i) => (
          <Card key={i} style={{ padding: "20px 24px" }}>
            <p style={{ margin: "0 0 6px 0", fontSize: "28px", fontWeight: 800, color: "#111827" }}>
              {stat.value}
            </p>
            <p style={{ margin: 0, fontSize: "13px", color: "#6B7280" }}>{stat.label}</p>
          </Card>
        ))}
      </div>

      {/* ── Two-column section ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "24px" }}>

        {/* LEFT — Saved Projects */}
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <SectionTitle icon="🎯">Saved Projects</SectionTitle>
            <button
              onClick={() => navigate("/find-projects")}
              style={{ background: "none", border: "none", color: "#FF7A1A", cursor: "pointer", fontSize: "13px", fontWeight: 600 }}
            >
              Browse more →
            </button>
          </div>

          {loading ? (
            <p style={{ color: "#9CA3AF", fontSize: "14px" }}>Loading...</p>
          ) : savedProjects.length === 0 ? (
            <EmptyState
              message="No saved projects yet. Browse projects and save the ones you like."
              actionLabel="Browse Projects"
              onAction={() => navigate("/find-projects")}
            />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {savedProjects.map(({ project, project_id }) => {
                const budget = project.budget_min && project.budget_max
                  ? `$${project.budget_min.toLocaleString()} – $${project.budget_max.toLocaleString()}`
                  : "Budget TBD";
                return (
                  <div
                    key={project_id}
                    style={{
                      border: "1px solid #E9ECEF", borderRadius: "10px",
                      padding: "16px 18px", background: "#FAFAFA",
                    }}
                  >
                    <p style={{ margin: "0 0 6px 0", fontWeight: 700, fontSize: "14px", color: "#111827" }}>
                      {project.title}
                    </p>
                    <p style={{ margin: "0 0 12px 0", fontSize: "13px", color: "#6B7280" }}>
                      • {budget}
                    </p>
                    <button
                      onClick={() => navigate(`/submit-proposal/${project.id}`)}
                      style={{
                        background: "#FF7A1A", color: "white", border: "none",
                        padding: "7px 16px", borderRadius: "8px",
                        cursor: "pointer", fontSize: "13px", fontWeight: 600,
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = "#e56c10"}
                      onMouseLeave={e => e.currentTarget.style.background = "#FF7A1A"}
                    >
                      Apply Now
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* RIGHT — Active Contracts */}
        <Card>
          <SectionTitle icon="📋">Active Contracts</SectionTitle>

          {loading ? (
            <p style={{ color: "#9CA3AF", fontSize: "14px" }}>Loading...</p>
          ) : activeContracts.length === 0 ? (
            <EmptyState
              message="No active contracts yet."
              actionLabel="View Contracts"
              onAction={() => navigate("/contracts")}
            />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {activeContracts.slice(0, 5).map(c => {
                const progress = Math.min(100, Math.max(10, Math.round(Math.random() * 80 + 10)));
                return (
                  <div
                    key={c.id}
                    onClick={() => navigate("/contracts")}
                    style={{ cursor: "pointer", padding: "12px", background: "#F9FAFB", borderRadius: "10px" }}
                  >
                    <p style={{ margin: "0 0 8px 0", fontWeight: 700, fontSize: "13px", color: "#111827" }}>
                      {c.title}
                    </p>
                    <div style={{ height: 6, background: "#E9ECEF", borderRadius: 99, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${progress}%`, background: "#FF7A1A", borderRadius: 99 }} />
                    </div>
                  </div>
                );
              })}
              {activeContracts.length > 5 && (
                <button
                  onClick={() => navigate("/contracts")}
                  style={{ background: "none", border: "none", color: "#FF7A1A", cursor: "pointer", fontSize: "13px", fontWeight: 600, textAlign: "left", padding: "2px 0" }}
                >
                  View all {activeContracts.length} →
                </button>
              )}
            </div>
          )}

          {/* Pending contracts notice */}
          {!loading && pendingContracts.length > 0 && (
            <div
              onClick={() => navigate("/contracts")}
              style={{
                marginTop: 16, padding: "10px 14px", background: "#FFF5EE",
                border: "1px solid #FFD4B2", borderRadius: 8, cursor: "pointer",
              }}
            >
              <p style={{ margin: 0, fontSize: 12, color: "#FF7A1A", fontWeight: 600 }}>
                ⏳ {pendingContracts.length} contract{pendingContracts.length > 1 ? "s" : ""} awaiting signature
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}