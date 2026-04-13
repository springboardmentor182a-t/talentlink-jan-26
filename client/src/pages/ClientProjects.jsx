import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../services/axios";
import { getProjectProposals, updateProposalStatus, getUserById } from "../services/api";
import { PlusCircle, ChevronRight, Briefcase, Clock, DollarSign, Users, CheckCircle, XCircle, Loader2, ArrowLeft } from "lucide-react";
import "../assets/projects.css";

// ── Constants ─────────────────────────────────────────────────────────────────

const STATUS_TABS = ["All", "open", "draft", "completed", "cancelled"];

const TAB_LABELS = {
  All: "All", open: "Active", draft: "Draft",
  completed: "Completed", cancelled: "Cancelled",
};

const STATUS_BADGE = {
  open:      { label: "Active",    bg: "#dcfce7", color: "#166534" },
  draft:     { label: "Draft",     bg: "#fef9c3", color: "#854d0e" },
  completed: { label: "Completed", bg: "#dbeafe", color: "#1e40af" },
  cancelled: { label: "Cancelled", bg: "#fee2e2", color: "#991b1b" },
};

const PROPOSAL_STATUS_STYLES = {
  pending:  { bg: "#fef9c3", color: "#854d0e", label: "Pending"  },
  accepted: { bg: "#dcfce7", color: "#166534", label: "Accepted" },
  rejected: { bg: "#fee2e2", color: "#991b1b", label: "Rejected" },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatBudget(p) {
  if (p.budget_min && p.budget_max)
    return `$${p.budget_min.toLocaleString()} – $${p.budget_max.toLocaleString()}`;
  if (p.budget_min) return `From $${p.budget_min.toLocaleString()}`;
  return "Budget TBD";
}

// ── ProposalCard ──────────────────────────────────────────────────────────────

function ProposalCard({ proposal, onAccept, onReject, actionState, navigate }) {
  const state  = actionState[proposal.id];
  const busy   = state === "loading";
  const locked = !["pending", "Pending"].includes(proposal.status);
  const st     = PROPOSAL_STATUS_STYLES[(proposal.status || "pending").toLowerCase()] || PROPOSAL_STATUS_STYLES.pending;

  return (
    <div className="cp-proposal-card">
      {/* Header */}
      <div className="cp-proposal-header">
        <div>
          <p
            className="cp-proposal-name"
            onClick={() => navigate(`/profile/freelancer?id=${proposal.freelancer_id}`)}
            title="View profile"
          >
            {proposal.freelancer_username}
          </p>
          <p className="cp-proposal-date">
            Applied {new Date(proposal.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </p>
        </div>
        <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 99, background: st.bg, color: st.color, textTransform: "capitalize", letterSpacing: "0.03em" }}>
          {st.label}
        </span>
      </div>

      {/* Bid + Timeline */}
      <div className="cp-proposal-stats">
        <div>
          <p className="cp-proposal-stat-label">Bid Amount</p>
          <p className="cp-proposal-stat-value">${Number(proposal.bid_amount).toLocaleString()}</p>
        </div>
        {proposal.estimated_days && (
          <div>
            <p className="cp-proposal-stat-label">Timeline</p>
            <p className="cp-proposal-stat-value">{proposal.estimated_days}d</p>
          </div>
        )}
      </div>

      {/* Cover letter */}
      <p className="cp-proposal-letter">{proposal.cover_letter}</p>

      {/* Inline action error */}
      {state?.startsWith?.("error:") && (
        <div className="cp-proposal-error">{state.slice(6)}</div>
      )}

      {/* Actions */}
      {!locked && (
        <div className="cp-proposal-actions">
          <button
            className="cp-accept-btn"
            onClick={() => onAccept(proposal.id)}
            disabled={busy}
          >
            {busy
              ? <Loader2 size={14} style={{ animation: "cp-spin 1s linear infinite" }} />
              : <CheckCircle size={14} />}
            Accept & Create Contract
          </button>
          <button
            className="cp-reject-btn"
            onClick={() => onReject(proposal.id)}
            disabled={busy}
          >
            <XCircle size={14} /> Reject
          </button>
        </div>
      )}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function ClientProjects() {
  const navigate = useNavigate();

  const [projects,       setProjects]       = useState([]);
  const [loadingProj,    setLoadingProj]    = useState(true);
  const [projError,      setProjError]      = useState("");
  const [activeTab,      setActiveTab]      = useState("All");
  const [search,         setSearch]         = useState("");
  const [proposalCounts, setProposalCounts] = useState({});

  const [selectedProject,  setSelectedProject]  = useState(null);
  const [proposals,        setProposals]        = useState([]);
  const [loadingProposals, setLoadingProposals] = useState(false);
  const [proposalError,    setProposalError]    = useState("");
  const [actionState,      setActionState]      = useState({});
  const [confirmModal,     setConfirmModal]     = useState(null);

  // ── Fetch projects ──────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const res  = await axiosInstance.get("/projects/");
        const all  = res.data?.items ?? res.data ?? [];
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        const mine = all.filter(p => p.client_id === user.id);
        setProjects(mine);

        const counts = {};
        await Promise.all(
          mine.map(async (p) => {
            try {
              const props = await getProjectProposals(p.id);
              counts[p.id] = Array.isArray(props) ? props.length : 0;
            } catch {
              counts[p.id] = 0;
            }
          })
        );
        setProposalCounts(counts);
      } catch (err) {
        setProjError("Failed to load your projects.");
        console.error(err);
      } finally {
        setLoadingProj(false);
      }
    };
    load();
  }, []);

  // ── Load proposals for selected project ────────────────────────────────────
  const loadProposals = useCallback(async (project) => {
    if (selectedProject?.id === project.id) return;
    setSelectedProject(project);
    setProposals([]);
    setProposalError("");
    setActionState({});
    setLoadingProposals(true);
    try {
      const list     = await getProjectProposals(project.id);
      const enriched = await Promise.all(
        list.map(async (prop) => {
          try {
            const user = await getUserById(prop.freelancer_id);
            return { ...prop, freelancer_username: user.username || user.email };
          } catch {
            return { ...prop, freelancer_username: `Freelancer #${prop.freelancer_id}` };
          }
        })
      );
      setProposals(enriched);
    } catch {
      setProposalError("Could not load proposals for this project.");
    } finally {
      setLoadingProposals(false);
    }
  }, [selectedProject]);

  // ── Accept / Reject ─────────────────────────────────────────────────────────
  const handleAction = async (proposalId, action) => {
    setConfirmModal(null);
    setActionState(prev => ({ ...prev, [proposalId]: "loading" }));
    try {
      const updated = await updateProposalStatus(proposalId, action);
      setProposals(prev =>
        prev.map(p => p.id === proposalId ? { ...p, status: updated.status } : p)
      );
      setActionState(prev => ({ ...prev, [proposalId]: null }));
      if (action === "accepted") {
        const accepted = proposals.find(p => p.id === proposalId);
        const flName   = encodeURIComponent(accepted?.freelancer_username ?? '');
        navigate(`/contracts?proposal_id=${proposalId}&freelancer_name=${flName}&prefill=true`);
      }
    } catch (err) {
      const detail = err.response?.data?.detail || "Action failed.";
      setActionState(prev => ({ ...prev, [proposalId]: `error:${detail}` }));
    }
  };

  // ── Filtering ───────────────────────────────────────────────────────────────
  const filtered = projects.filter(p => {
    if (activeTab !== "All" && (p.status ?? "open") !== activeTab) return false;
    if (search.trim() && !p.title?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const tabCounts = STATUS_TABS.reduce((acc, tab) => {
    acc[tab] = tab === "All"
      ? projects.length
      : projects.filter(p => (p.status ?? "open") === tab).length;
    return acc;
  }, {});

  const panelOpen = !!selectedProject;

  if (loadingProj) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 300 }}>
        <div className="cp-spinner" style={{ width: 32, height: 32 }} />
      </div>
    );
  }

  return (
    <div className="cp-layout">

      {/* ── LEFT RAIL ──────────────────────────────────────────────────────── */}
      <div className={`cp-rail ${panelOpen ? "cp-rail--narrow" : "cp-rail--full"}`}>

        {/* Header */}
        <div className={`cp-rail-header ${panelOpen ? "cp-rail-header--narrow" : "cp-rail-header--full"}`}>
          <div className={`cp-rail-header-row ${panelOpen ? "cp-rail-header-row--narrow" : ""}`}>
            <div>
              <h1 className={`cp-title ${panelOpen ? "cp-title--narrow" : "cp-title--full"}`}>
                Job Postings
              </h1>
              {!panelOpen && <p className="cp-subtitle">Manage projects and review proposals</p>}
            </div>
            <button
              className={`cp-post-btn ${panelOpen ? "cp-post-btn--narrow" : "cp-post-btn--full"}`}
              onClick={() => navigate("/my-projects/new")}
              title="Post New Project"
            >
              <PlusCircle size={16} />
              {!panelOpen && <span>Post New Project</span>}
            </button>
          </div>

          {projError && <div className="cp-error">{projError}</div>}

          {/* Tabs */}
          {!panelOpen && (
            <div className="cp-tabs">
              {STATUS_TABS.map(tab => (
                <button
                  key={tab}
                  className={`cp-tab ${activeTab === tab ? "cp-tab--active" : ""}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {TAB_LABELS[tab]}
                  {tabCounts[tab] > 0 && (
                    <span className={`cp-tab-count ${activeTab === tab ? "cp-tab-count--active" : "cp-tab-count--inactive"}`}>
                      {tabCounts[tab]}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

          <input
            type="text"
            className="cp-search"
            placeholder="Search projects..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Project list */}
        <div className={`cp-list ${panelOpen ? "cp-list--narrow" : "cp-list--full"}`}>

          {filtered.length === 0 && (
            <div className="cp-empty">
              <Briefcase size={36} style={{ margin: "0 auto 12px", opacity: 0.3, display: "block" }} />
              <p>{projects.length === 0 ? "No projects posted yet." : "No projects match your filter."}</p>
              {projects.length === 0 && (
                <button className="cp-empty-btn" onClick={() => navigate("/my-projects/new")}>
                  Post Your First Project
                </button>
              )}
            </div>
          )}

          {filtered.map(project => {
            const status     = project.status ?? "open";
            const badge      = STATUS_BADGE[status] ?? STATUS_BADGE.open;
            const budget     = formatBudget(project);
            const pCount     = proposalCounts[project.id] ?? 0;
            const isSelected = selectedProject?.id === project.id;

            return (
              <div
                key={project.id}
                className={`cp-proj-card ${panelOpen ? "cp-proj-card--narrow" : "cp-proj-card--full"}`}
                onClick={() => loadProposals(project)}
                style={{
                  background: isSelected ? "#fff7ed" : "#fff",
                  border: isSelected ? "1.5px solid #f97316" : "1.5px solid #e5e7eb",
                }}
              >
                {isSelected && <div className="cp-proj-selected-bar" />}

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5, flexWrap: "wrap" }}>
                      <h3 className={`cp-proj-title ${panelOpen ? "cp-proj-title--narrow" : "cp-proj-title--full"}`}>
                        {project.title}
                      </h3>
                      <span
                        className="cp-status-badge"
                        style={{ background: badge.bg, color: badge.color }}
                      >
                        {badge.label}
                      </span>
                    </div>

                    {!panelOpen && <p className="cp-proj-desc">{project.description}</p>}

                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#f97316" }}>{budget}</span>
                      <span className={`cp-prop-count ${pCount > 0 ? "cp-prop-count--has" : "cp-prop-count--none"}`}>
                        <Users size={10} />
                        {pCount} proposal{pCount !== 1 ? "s" : ""}
                      </span>
                      {project.duration && !panelOpen && (
                        <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#9ca3af" }}>
                          <Clock size={11} />{project.duration}
                        </span>
                      )}
                    </div>
                  </div>

                  <ChevronRight
                    size={16}
                    style={{
                      color: isSelected ? "#f97316" : "#d1d5db",
                      flexShrink: 0, marginTop: 2,
                      transform: isSelected ? "rotate(90deg)" : "none",
                      transition: "transform 0.2s, color 0.15s",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── RIGHT PANEL ────────────────────────────────────────────────────── */}
      {panelOpen && (
        <div className="cp-panel">

          <div className="cp-panel-header">
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
              <div>
                <button className="cp-back-btn" onClick={() => setSelectedProject(null)}>
                  <ArrowLeft size={13} /> Back to all projects
                </button>
                <h2 className="cp-panel-title">{selectedProject.title}</h2>
                <div className="cp-panel-meta">
                  <span><DollarSign size={13} style={{ color: "#f97316" }} />{formatBudget(selectedProject)}</span>
                  {selectedProject.duration && <span><Clock size={13} />{selectedProject.duration}</span>}
                  <span>
                    <Users size={13} />
                    <strong style={{ color: "#111827" }}>{proposals.length}</strong>&nbsp;proposal{proposals.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>

              {proposals.length > 0 && (
                <div style={{ display: "flex", gap: 8, flexShrink: 0, alignItems: "center" }}>
                  {["pending", "accepted", "rejected"].map(s => {
                    const c  = proposals.filter(p => (p.status || "pending").toLowerCase() === s).length;
                    if (!c) return null;
                    const st = PROPOSAL_STATUS_STYLES[s];
                    return (
                      <span key={s} style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 99, background: st.bg, color: st.color }}>
                        {c} {st.label}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="cp-panel-body">
            {loadingProposals && (
              <div className="cp-spinner-wrap" style={{ height: 200 }}>
                <div className="cp-spinner" style={{ width: 28, height: 28 }} />
              </div>
            )}

            {!loadingProposals && proposalError && (
              <div className="cp-error">{proposalError}</div>
            )}

            {!loadingProposals && !proposalError && proposals.length === 0 && (
              <div className="cp-panel-empty">
                <Users size={40} style={{ margin: "0 auto 16px", opacity: 0.25, display: "block" }} />
                <p>No proposals yet</p>
                <p>Freelancers who apply will appear here.</p>
              </div>
            )}

            {!loadingProposals && proposals.map(proposal => (
              <ProposalCard
                key={proposal.id}
                proposal={proposal}
                actionState={actionState}
                navigate={navigate}
                onAccept={id => setConfirmModal({ proposalId: id, action: "accepted" })}
                onReject={id => setConfirmModal({ proposalId: id, action: "rejected" })}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Confirm Modal ─────────────────────────────────────────────────── */}
      {confirmModal && (
        <div className="cp-modal-overlay">
          <div className="cp-modal">
            <h3>{confirmModal.action === "accepted" ? "Accept this proposal?" : "Reject this proposal?"}</h3>
            <p>
              {confirmModal.action === "accepted"
                ? "You'll be taken to Contracts to set up the agreement with this freelancer."
                : "This action cannot be undone. The freelancer will be notified."}
            </p>
            <div className="cp-modal-actions">
              <button className="cp-modal-cancel" onClick={() => setConfirmModal(null)}>
                Cancel
              </button>
              <button
                className={`cp-modal-confirm ${confirmModal.action === "accepted" ? "cp-modal-confirm--accept" : "cp-modal-confirm--reject"}`}
                onClick={() => handleAction(confirmModal.proposalId, confirmModal.action)}
              >
                {confirmModal.action === "accepted" ? "Yes, accept" : "Yes, reject"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}