import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../services/axios";
import { getProjectProposals, updateProposalStatus, getUserById } from "../services/api";

// Status badge colours
const statusStyles = {
  pending:  "bg-yellow-100 text-yellow-700 border border-yellow-300",
  accepted: "bg-green-100  text-green-700  border border-green-300",
  rejected: "bg-red-100    text-red-700    border border-red-300",
};

export default function ProjectDetail() {
  const { id: projectId } = useParams();
  const navigate      = useNavigate();

  const [project,   setProject]   = useState(null);
  const [proposals, setProposals] = useState([]);
  const [fetching,  setFetching]  = useState(true);
  const [error,     setError]     = useState("");

  // Per-proposal action state: { [proposalId]: "loading" | "error:msg" | null }
  const [actionState, setActionState] = useState({});

  // Confirm modal state: { proposalId, action }
  const [confirmModal, setConfirmModal] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        // Direct single-project fetch using the new endpoint
        const projectRes = await axiosInstance.get(`/projects/${projectId}`);
        setProject(projectRes.data);

        // Fetch proposals for this project
        const proposalList = await getProjectProposals(projectId);

        // Resolve freelancer usernames — one fetch per proposal
        const enriched = await Promise.all(
          proposalList.map(async (proposal) => {
            try {
              const user = await getUserById(proposal.freelancer_id);
              return { ...proposal, freelancer_username: user.username || user.email };
            } catch {
              return { ...proposal, freelancer_username: `User #${proposal.freelancer_id}` };
            }
          })
        );

        setProposals(enriched);
      } catch (err) {
        setError("Failed to load project details. Please try again.");
        console.error(err);
      } finally {
        setFetching(false);
      }
    };

    load();
  }, [projectId]);

  const handleAction = async (proposalId, action) => {
    setConfirmModal(null);
    setActionState(prev => ({ ...prev, [proposalId]: "loading" }));

    try {
      const updated = await updateProposalStatus(proposalId, action);
      setProposals(prev =>
        prev.map(p => p.id === proposalId ? { ...p, status: updated.status } : p)
      );
      setActionState(prev => ({ ...prev, [proposalId]: null }));

      // If accepted, redirect to contracts page with proposal pre-filled
      if (action === "accepted") {
        navigate(`/contracts?proposal_id=${proposalId}&prefill=true`);
      }
    } catch (err) {
      const detail = err.response?.data?.detail || "Action failed. Please try again.";
      setActionState(prev => ({ ...prev, [proposalId]: `error:${detail}` }));
    }
  };

  // ── Loading ──────────────────────────────────────────────────────────────
  if (fetching) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
      </div>
    );
  }

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">

      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6 transition"
      >
        ← Back
      </button>

      {/* Page-level error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-6 text-sm">
          {error}
        </div>
      )}

      {/* Project card */}
      {project ? (
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8 shadow-sm">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="text-xs font-semibold text-orange-500 uppercase tracking-wide mb-1">
                Project
              </p>
              <h1 className="text-2xl font-bold text-gray-900">{project.title}</h1>
              {project.description && (
                <p className="text-gray-500 mt-2 text-sm leading-relaxed max-w-2xl">
                  {project.description}
                </p>
              )}
            </div>
            <div className="text-right shrink-0">
              {project.budget && (
                <p className="text-lg font-bold text-gray-800">
                  ${Number(project.budget).toLocaleString()}
                </p>
              )}
              {(project.budget_min && project.budget_max) && (
                <p className="text-lg font-bold text-gray-800">
                  ${project.budget_min.toLocaleString()} – ${project.budget_max.toLocaleString()}
                </p>
              )}
              <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">
                {project.status || "open"}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-lg px-4 py-3 mb-8 text-sm">
          Project details could not be loaded.
        </div>
      )}

      {/* Proposals section */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-800">
          Proposals
          <span className="ml-2 text-sm font-normal text-gray-400">
            ({proposals.length})
          </span>
        </h2>
      </div>

      {proposals.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-10 text-center text-gray-400">
          No proposals yet. Check back later.
        </div>
      ) : (
        <div className="space-y-4">
          {proposals.map(proposal => {
            const pState = actionState[proposal.id];
            const isLoading = pState === "loading";
            const actionError = pState?.startsWith("error:") ? pState.slice(6) : null;
            const isLocked = proposal.status !== "pending";

            return (
              <div
                key={proposal.id}
                className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm"
              >
                {/* Header row */}
                <div className="flex items-start justify-between gap-4 flex-wrap mb-3">
                  <div>
                    <p className="font-semibold text-gray-900">
                      {proposal.freelancer_username}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Submitted {new Date(proposal.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${statusStyles[proposal.status] || statusStyles.pending}`}>
                    {proposal.status}
                  </span>
                </div>

                {/* Bid details */}
                <div className="flex gap-6 text-sm text-gray-600 mb-4">
                  <div>
                    <span className="text-gray-400 text-xs uppercase tracking-wide block mb-0.5">Bid</span>
                    <span className="font-bold text-gray-800">${Number(proposal.bid_amount).toLocaleString()}</span>
                  </div>
                  {proposal.estimated_days && (
                    <div>
                      <span className="text-gray-400 text-xs uppercase tracking-wide block mb-0.5">Timeline</span>
                      <span className="font-bold text-gray-800">{proposal.estimated_days} days</span>
                    </div>
                  )}
                </div>

                {/* Cover letter */}
                <p className="text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
                  {proposal.cover_letter}
                </p>

                {/* Action error */}
                {actionError && (
                  <div className="mt-3 flex items-center justify-between bg-red-50 border border-red-200 text-red-600 rounded-lg px-3 py-2 text-sm">
                    <span>{actionError}</span>
                    <button
                      onClick={() => setActionState(prev => ({ ...prev, [proposal.id]: null }))}
                      className="ml-3 text-red-400 hover:text-red-600 font-bold"
                    >
                      ×
                    </button>
                  </div>
                )}

                {/* Action buttons — only shown while pending */}
                {!isLocked && (
                  <div className="flex gap-3 mt-4 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => setConfirmModal({ proposalId: proposal.id, action: "accepted" })}
                      disabled={isLoading}
                      className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-lg transition disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {isLoading ? "Processing..." : "Accept & Create Contract"}
                    </button>
                    <button
                      onClick={() => setConfirmModal({ proposalId: proposal.id, action: "rejected" })}
                      disabled={isLoading}
                      className="px-5 py-2 border border-gray-300 text-gray-600 hover:bg-gray-50 text-sm font-semibold rounded-lg transition disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Confirm modal — no window.confirm */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              {confirmModal.action === "accepted" ? "Accept proposal?" : "Reject proposal?"}
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              {confirmModal.action === "accepted"
                ? "You'll be taken to the contracts page to create a contract with this freelancer."
                : "This action cannot be undone. The freelancer will be notified."}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmModal(null)}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => handleAction(confirmModal.proposalId, confirmModal.action)}
                className={`px-5 py-2 text-sm text-white font-semibold rounded-lg transition ${
                  confirmModal.action === "accepted"
                    ? "bg-orange-500 hover:bg-orange-600"
                    : "bg-red-500 hover:bg-red-600"
                }`}
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