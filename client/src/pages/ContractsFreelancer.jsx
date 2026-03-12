import { useState, useEffect } from 'react';
import ContractsService from '../features/services/contracts';
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

function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

// ── Contract Card ──────────────────────────────────────────────────────────

function ContractCard({ contract, onSign, onEditTerms, onView }) {
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

      {/* Client avatar placeholder — proposal/user join not yet available */}
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
        {(status === 'active' || status === 'completed' || status === 'draft' || status === 'rejected') && (
          <button className="btn-secondary btn-sm" onClick={() => onView(contract)}>
            View Details
          </button>
        )}
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

// ── Main Page ──────────────────────────────────────────────────────────────

const ContractsFreelancer = () => {
  const [contracts, setContracts]         = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState(null);
  const [activeFilter, setActiveFilter]   = useState('all');
  const [editingContract, setEditingContract] = useState(null);

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
      alert(err.response?.data?.detail ?? 'Failed to sign contract');
    }
  };

  const handleEditTermsSubmit = async (id, terms) => {
    try {
      const res = await ContractsService.editTerms(id, terms);
      setContracts(prev => prev.map(c => c.id === id ? res.data : c));
      setEditingContract(null);
    } catch (err) {
      alert(err.response?.data?.detail ?? 'Failed to submit edits');
    }
  };

  const handleView = (contract) => {
    // Detail view is a future screen — navigate or open modal when built
    alert(`Contract "${contract.title}" — detail view coming soon`);
  };

  return (
    <div className="contracts-page">
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
    </div>
  );
};

export default ContractsFreelancer;
