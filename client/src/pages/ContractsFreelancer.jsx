import { useState, useEffect } from 'react';
import ContractsService from '../features/services/contracts';
import ReviewModal from '../components/ReviewModal';
import { useAuth } from '../features/hooks/useAuth';
import '../assets/contracts.css';

// ── Helpers ────────────────────────────────────────────────────────────────

const STATUS_LABELS = {
  all:          'All',
  active:       'Active',
  draft:        'Draft',
  pending_sign: 'Pending',
  completed:    'Completed',
  rejected:     'Rejected',
  cancelled:    'Cancelled',
};

const FILTER_TABS = ['all', 'active', 'pending_sign', 'completed', 'draft'];

function StatusBadge({ status }) {
  const modMap = {
    active:       'active',
    draft:        'draft',
    pending_sign: 'pending',
    completed:    'completed',
    rejected:     'rejected',
    cancelled:    'cancelled',
  };
  return (
    <span className={`status-badge status-badge--${modMap[status] ?? 'draft'}`}>
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatBudget(amount) {
  if (amount == null) return '—';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
}

// ── Contract Detail Modal ──────────────────────────────────────────────────

function ContractDetailModal({ contract, onClose, onMilestoneToggle }) {
  const [localContract, setLocalContract] = useState(contract);
  const [toggling, setToggling]           = useState(null); // milestone id being toggled

  useEffect(() => setLocalContract(contract), [contract]);

  const handleToggle = async (milestone) => {
    setToggling(milestone.id);
    try {
      const updated = await onMilestoneToggle(milestone.id, !milestone.is_completed);
      if (updated) setLocalContract(updated);
    } finally {
      setToggling(null);
    }
  };

  const { status, progress, milestones } = localContract;
  const showProgress = status === 'active' || status === 'completed';

  return (
    <div className="new-contract-overlay">
      <div className="new-contract-modal" style={{ maxWidth: 600 }}>
        {/* Header */}
        <div className="new-contract-header">
          <div>
            <h2 className="new-contract-title">{localContract.title}</h2>
            <div style={{ marginTop: 6 }}>
              <StatusBadge status={status} />
            </div>
          </div>
          <button className="new-contract-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="new-contract-body">
          {/* Meta grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="new-contract-field">
              <span className="new-contract-label">Budget</span>
              <span style={{ fontFamily: 'var(--font-text)', fontSize: 14, color: 'var(--color-secondary)', fontWeight: 600 }}>
                {formatBudget(localContract.budget)}
              </span>
            </div>
            <div className="new-contract-field">
              <span className="new-contract-label">Contract ID</span>
              <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 13, color: 'var(--color-tertiary)' }}>
                CT-{String(localContract.id).padStart(4, '0')}
              </span>
            </div>
            <div className="new-contract-field">
              <span className="new-contract-label">Start Date</span>
              <span style={{ fontFamily: 'var(--font-text)', fontSize: 13, color: 'var(--color-secondary)' }}>
                {formatDate(localContract.start_date)}
              </span>
            </div>
            <div className="new-contract-field">
              <span className="new-contract-label">End Date</span>
              <span style={{ fontFamily: 'var(--font-text)', fontSize: 13, color: 'var(--color-secondary)' }}>
                {formatDate(localContract.end_date)}
              </span>
            </div>
          </div>

          {/* Progress bar */}
          {showProgress && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span className="new-contract-label">Progress</span>
                <span style={{ fontSize: 12, fontFamily: 'var(--font-text)', color: 'var(--color-tertiary)' }}>
                  {progress}%
                </span>
              </div>
              <div className="progress-bar">
                <div className="progress-bar__fill" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}

          {/* Terms */}
          {localContract.terms && (
            <div className="new-contract-field">
              <span className="new-contract-label">Terms</span>
              <div style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '10px 12px',
                fontSize: 13,
                fontFamily: 'var(--font-text)',
                color: 'var(--color-secondary)',
                whiteSpace: 'pre-wrap',
                lineHeight: 1.55,
                maxHeight: 140,
                overflowY: 'auto',
              }}>
                {localContract.terms}
              </div>
            </div>
          )}

          {/* Milestones with checkboxes */}
          <div className="new-contract-field">
            <span className="new-contract-label">
              Milestones{milestones.length > 0 && ` (${milestones.filter(m => m.is_completed).length}/${milestones.length} done)`}
            </span>

            {milestones.length === 0 ? (
              <p style={{ fontSize: 13, color: 'var(--color-tertiary)', fontFamily: 'var(--font-text)', margin: 0 }}>
                No milestones set for this contract.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {milestones.map(m => (
                  <div
                    key={m.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '9px 12px',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      opacity: toggling === m.id ? 0.55 : 1,
                      transition: 'opacity 0.15s',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={m.is_completed}
                      disabled={status !== 'active' || toggling === m.id}
                      onChange={() => handleToggle(m)}
                      style={{
                        width: 16,
                        height: 16,
                        cursor: status === 'active' ? 'pointer' : 'default',
                        flexShrink: 0,
                        accentColor: 'var(--color-primary)',
                      }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={{
                        fontSize: 13,
                        fontFamily: 'var(--font-text)',
                        color: 'var(--color-secondary)',
                        textDecoration: m.is_completed ? 'line-through' : 'none',
                        opacity: m.is_completed ? 0.55 : 1,
                      }}>
                        {m.title}
                      </span>
                      {m.due_date && (
                        <span style={{ display: 'block', fontSize: 11, color: 'var(--color-tertiary)', fontFamily: 'var(--font-text)', marginTop: 1 }}>
                          Due {formatDate(m.due_date)}
                        </span>
                      )}
                    </div>
                    {m.is_completed && (
                      <span style={{ fontSize: 11, color: '#22c55e', fontFamily: 'var(--font-text)', fontWeight: 600, flexShrink: 0 }}>
                        ✓ Done
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {status !== 'active' && milestones.length > 0 && (
              <p style={{ fontSize: 12, color: 'var(--color-tertiary)', fontFamily: 'var(--font-text)', margin: '4px 0 0' }}>
                Milestones can only be updated on active contracts.
              </p>
            )}
          </div>
        </div>

        <div className="new-contract-footer">
          <button className="btn-secondary btn-sm" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

// ── Edit Terms Modal ───────────────────────────────────────────────────────

function EditTermsModal({ contract, onClose, onSubmit }) {
  const [terms, setTerms] = useState(contract.terms ?? '');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!terms.trim()) return;
    setSubmitting(true);
    await onSubmit(contract.id, terms.trim());
    setSubmitting(false);
  };

  return (
    <div className="new-contract-overlay">
      <div className="new-contract-modal">
        <div className="new-contract-header">
          <h2 className="new-contract-title">Propose Term Edits</h2>
          <button className="new-contract-close-btn" onClick={onClose}>✕</button>
        </div>
        <div className="new-contract-body">
          <div className="new-contract-field">
            <label className="new-contract-label">Updated Terms</label>
            <textarea
              className="new-contract-textarea"
              value={terms}
              onChange={e => setTerms(e.target.value)}
              rows={6}
              placeholder="Describe your proposed changes to the contract terms..."
            />
          </div>
        </div>
        <div className="new-contract-footer">
          <button className="btn-secondary btn-sm" onClick={onClose}>Cancel</button>
          <button className="btn-primary btn-sm" onClick={handleSubmit} disabled={submitting || !terms.trim()}>
            {submitting ? 'Submitting…' : 'Submit Edits'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Contract Card ──────────────────────────────────────────────────────────

function ContractCard({ contract, onSign, onEditTerms, onView, onReview, reviewedIds }) {
  const { status } = contract;

  return (
    <div className="contract-card">
      <div className="contract-card__top">
        <div>
          <p className="contract-card__id">CT-{String(contract.id).padStart(4, '0')}</p>
          <h3 className="contract-card__title">{contract.title}</h3>
        </div>
        <StatusBadge status={status} />
      </div>

      <div className="contract-card__meta">
        <div className="contract-card__meta-row">
          <span className="contract-card__meta-label">Budget</span>
          {formatBudget(contract.budget)}
        </div>
        <div className="contract-card__meta-row">
          <span className="contract-card__meta-label">Start</span>
          {formatDate(contract.start_date)}
        </div>
        <div className="contract-card__meta-row">
          <span className="contract-card__meta-label">End</span>
          {formatDate(contract.end_date)}
        </div>
      </div>

      {/* Progress bar for active/completed */}
      {(status === 'active' || status === 'completed') && (
        <div className="contract-card__progress" style={{ marginTop: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: 11, color: 'var(--color-tertiary)', fontFamily: 'var(--font-text)' }}>Progress</span>
            <span style={{ fontSize: 11, color: 'var(--color-tertiary)', fontFamily: 'var(--font-text)' }}>{contract.progress}%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-bar__fill" style={{ width: `${contract.progress}%` }} />
          </div>
        </div>
      )}

      {/* Client avatar placeholder */}
      <div className="contract-card__avatar">
        <div className="contract-card__avatar-initial">CL</div>
        <span className="contract-card__avatar-name">Client</span>
      </div>

      <div className="contract-card__actions">
        {status === 'pending_sign' && (
          <>
            <button className="btn-primary btn-sm" onClick={() => onSign(contract.id)}>
              Sign Contract
            </button>
            <button className="btn-secondary btn-sm" onClick={() => onEditTerms(contract)}>
              Propose Edits
            </button>
          </>
        )}
        {(status === 'active' || status === 'draft' || status === 'rejected') && (
          <button className="btn-secondary btn-sm" onClick={() => onView(contract)}>
            View Details
          </button>
        )}
        {status === 'completed' && (
          <>
            <button className="btn-secondary btn-sm" onClick={() => onView(contract)}>
              View Details
            </button>
            {!reviewedIds.has(contract.id) && (
              <button className="btn-primary btn-sm" onClick={() => onReview(contract)}>
                Leave a Review
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────

const ContractsFreelancer = () => {
  const { user }                              = useAuth();
  const [contracts, setContracts]             = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [error, setError]                     = useState(null);
  const [activeFilter, setActiveFilter]       = useState('all');
  const [editingContract, setEditingContract] = useState(null);
  const [detailContract, setDetailContract]   = useState(null);
  const [actionError, setActionError]         = useState(null);
  const [reviewContract, setReviewContract]   = useState(null);
  const [reviewedIds, setReviewedIds]         = useState(new Set());

  useEffect(() => {
    const fetchContracts = async () => {
      try {
        const res = await ContractsService.getAll();
        setContracts(res.data);
      } catch (err) {
        setError('Failed to load contracts. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchContracts();
  }, []);

  const filtered = activeFilter === 'all'
    ? contracts
    : contracts.filter(c => c.status === activeFilter);

  const handleSign = async (id) => {
    try {
      const res = await ContractsService.sign(id);
      setContracts(prev => prev.map(c => c.id === id ? res.data : c));
    } catch (err) {
      setActionError(err.response?.data?.detail ?? 'Failed to sign contract.');
    }
  };

  const handleEditTermsSubmit = async (id, terms) => {
    try {
      const res = await ContractsService.editTerms(id, terms);
      setContracts(prev => prev.map(c => c.id === id ? res.data : c));
      setEditingContract(null);
    } catch (err) {
      setActionError(err.response?.data?.detail ?? 'Failed to submit edits.');
    }
  };

  // Milestone toggle — called from inside ContractDetailModal
  // Returns the updated contract dict so the modal can update its local state.
  const handleMilestoneToggle = async (milestoneId, isCompleted) => {
    try {
      const res = await ContractsService.updateMilestone(milestoneId, isCompleted);
      const updated = res.data;
      // Sync the main list too so the card's progress bar updates
      setContracts(prev => prev.map(c => c.id === updated.id ? updated : c));
      // Keep detailContract in sync with the fresh data
      setDetailContract(updated);
      return updated;
    } catch (err) {
      setActionError(err.response?.data?.detail ?? 'Failed to update milestone.');
      return null;
    }
  };

  const handleView = (contract) => {
    setDetailContract(contract);
  };

  return (
    <div className="contracts-page">
      {actionError && (
        <div style={{ margin: '0 0 16px', padding: '12px 16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, color: '#dc2626', fontSize: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>⚠️ {actionError}</span>
          <button onClick={() => setActionError(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', fontWeight: 'bold', fontSize: 16, lineHeight: 1 }}>✕</button>
        </div>
      )}
      <div className="contracts-header">
        <h1 className="contracts-header__title">My Contracts</h1>
      </div>

      <div className="contracts-filters">
        {FILTER_TABS.map(tab => (
          <button
            key={tab}
            className={`filter-tab${activeFilter === tab ? ' filter-tab--active' : ''}`}
            onClick={() => setActiveFilter(tab)}
          >
            {STATUS_LABELS[tab]}
            {tab !== 'all' && (
              <span style={{ marginLeft: 5, opacity: 0.6 }}>
                ({contracts.filter(c => c.status === tab).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {loading && (
        <div className="contracts-loading">
          <span className="contracts-loading__dot" />
          <span className="contracts-loading__dot" />
          <span className="contracts-loading__dot" />
        </div>
      )}

      {!loading && error && (
        <div className="contracts-empty">
          <div className="contracts-empty__icon">⚠️</div>
          <p className="contracts-empty__title">Something went wrong</p>
          <p className="contracts-empty__subtitle">{error}</p>
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="contracts-empty">
          <div className="contracts-empty__icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.6">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
          </div>
          <p className="contracts-empty__title">No contracts yet</p>
          <p className="contracts-empty__subtitle">
            {activeFilter === 'all'
              ? 'Contracts from clients will appear here once a proposal is accepted.'
              : `No ${STATUS_LABELS[activeFilter].toLowerCase()} contracts.`}
          </p>
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="contracts-grid">
          {filtered.map(contract => (
            <ContractCard
              key={contract.id}
              contract={contract}
              onSign={handleSign}
              onEditTerms={setEditingContract}
              onView={handleView}
              onReview={(c) => setReviewContract(c)}
              reviewedIds={reviewedIds}
            />
          ))}
        </div>
      )}

      {editingContract && (
        <EditTermsModal
          contract={editingContract}
          onClose={() => setEditingContract(null)}
          onSubmit={handleEditTermsSubmit}
        />
      )}

      {detailContract && (
        <ContractDetailModal
          contract={detailContract}
          onClose={() => setDetailContract(null)}
          onMilestoneToggle={handleMilestoneToggle}
        />
      )}

      {reviewContract && user && (
        <ReviewModal
          contract={reviewContract}
          currentUserId={user.id}
          onClose={() => setReviewContract(null)}
          onSubmitted={(contractId) => {
            setReviewedIds(prev => new Set([...prev, contractId]));
            setReviewContract(null);
          }}
        />
      )}
    </div>
  );
};

export default ContractsFreelancer;