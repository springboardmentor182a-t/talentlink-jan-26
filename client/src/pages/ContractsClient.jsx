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
  rejected:     'Review Edits',
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

// ── New Contract Modal ─────────────────────────────────────────────────────

function NewContractModal({ onClose, onCreate }) {
  const [form, setForm] = useState({
    proposal_id: '',
    title:       '',
    budget:      '',
    terms:       '',
    start_date:  '',
    end_date:    '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState(null);

  const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.budget || !form.proposal_id) {
      setError('Proposal ID, title, and budget are required.');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await onCreate({
        proposal_id: parseInt(form.proposal_id, 10),
        title:       form.title.trim(),
        budget:      parseFloat(form.budget),
        terms:       form.terms.trim() || null,
        start_date:  form.start_date || null,
        end_date:    form.end_date || null,
      });
    } catch (err) {
      setError(err.response?.data?.detail ?? 'Failed to create contract.');
      setSubmitting(false);
    }
  };

  return (
    <div className="new-contract-overlay">
      <div className="new-contract-modal">
        <div className="new-contract-header">
          <h2 className="new-contract-title">New Contract</h2>
          <button className="new-contract-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="new-contract-body">
          {error && (
            <p style={{ color: '#dc2626', fontSize: 13, fontFamily: 'var(--font-text)', margin: 0 }}>
              {error}
            </p>
          )}

          <div className="new-contract-field">
            <label className="new-contract-label">Proposal ID</label>
            <input
              className="new-contract-input"
              type="number"
              placeholder="Enter proposal ID"
              value={form.proposal_id}
              onChange={set('proposal_id')}
            />
          </div>

          <div className="new-contract-field">
            <label className="new-contract-label">Contract Title</label>
            <input
              className="new-contract-input"
              type="text"
              placeholder="e.g. Website Redesign Project"
              value={form.title}
              onChange={set('title')}
            />
          </div>

          <div className="new-contract-field">
            <label className="new-contract-label">Budget (USD)</label>
            <input
              className="new-contract-input"
              type="number"
              placeholder="e.g. 5000"
              value={form.budget}
              onChange={set('budget')}
              min="0"
            />
          </div>

          <div className="new-contract-row">
            <div className="new-contract-field">
              <label className="new-contract-label">Start Date</label>
              <input className="new-contract-input" type="date" value={form.start_date} onChange={set('start_date')} />
            </div>
            <div className="new-contract-field">
              <label className="new-contract-label">End Date</label>
              <input className="new-contract-input" type="date" value={form.end_date} onChange={set('end_date')} />
            </div>
          </div>

          <div className="new-contract-field">
            <label className="new-contract-label">Terms (optional)</label>
            <textarea
              className="new-contract-textarea"
              placeholder="Describe scope, deliverables, payment schedule..."
              value={form.terms}
              onChange={set('terms')}
            />
          </div>
        </div>

        <div className="new-contract-footer">
          <button className="btn-secondary btn-sm" onClick={onClose}>Cancel</button>
          <button
            className="btn-primary btn-sm"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? 'Creating…' : 'Create Contract'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Contract Row ───────────────────────────────────────────────────────────

function ContractRow({ contract, onSend, onView, onCancel }) {
  const { status, progress } = contract;

  return (
    <div className="contract-row">
      <div className="contract-row__top">
        <div className="contract-row__title-group">
          <h3 className="contract-row__title">{contract.title}</h3>
          <StatusBadge status={status} />
        </div>

        <div className="contract-row__meta">
          <div className="contract-row__meta-item">
            <span className="contract-row__meta-label">Budget</span>
            <span className="contract-row__meta-value">{formatBudget(contract.budget)}</span>
          </div>
          <div className="contract-row__meta-item">
            <span className="contract-row__meta-label">Start</span>
            <span className="contract-row__meta-value">{formatDate(contract.start_date)}</span>
          </div>
          <div className="contract-row__meta-item">
            <span className="contract-row__meta-label">End</span>
            <span className="contract-row__meta-value">{formatDate(contract.end_date)}</span>
          </div>
        </div>
      </div>

      {/* Progress bar — only meaningful on active/completed contracts */}
      {(status === 'active' || status === 'completed') && (
        <div className="contract-row__progress">
          <span className="contract-row__progress-label">Progress {progress}%</span>
          <div className="progress-bar">
            {/* width is the one intentional inline style — must be dynamic from data */}
            <div className="progress-bar__fill" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      <div className="contract-row__actions">
        {status === 'draft' && (
          <button className="btn-primary btn-sm" onClick={() => onSend(contract.id)}>
            Send Contract
          </button>
        )}
        {status === 'rejected' && (
          <button className="btn-outline btn-sm" onClick={() => onView(contract)}>
            Review Edits
          </button>
        )}
        {(status === 'active') && (
          <>
            <button className="btn-secondary btn-sm" onClick={() => onView(contract)}>
              View Details
            </button>
            <button className="btn-secondary btn-sm" onClick={() => onCancel(contract.id)}>
              Cancel
            </button>
          </>
        )}
        {status === 'completed' && (
          <button className="btn-secondary btn-sm" onClick={() => onView(contract)}>
            View Details
          </button>
        )}
        {status === 'pending_sign' && (
          <button className="btn-secondary btn-sm" onClick={() => onView(contract)}>
            Awaiting Signature
          </button>
        )}
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────

const ContractsClient = () => {
  const [contracts, setContracts]       = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [search, setSearch]             = useState('');
  const [showNewModal, setShowNewModal] = useState(false);

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

  // Filter tab counts are computed from the full array, not the search-filtered one
  const countFor = (tab) => tab === 'all' ? contracts.length : contracts.filter(c => c.status === tab).length;

  const filtered = contracts
    .filter(c => activeFilter === 'all' || c.status === activeFilter)
    .filter(c => !search.trim() || c.title.toLowerCase().includes(search.trim().toLowerCase()));

  const handleSend = async (id) => {
    try {
      const res = await ContractsService.send(id);
      setContracts(prev => prev.map(c => c.id === id ? res.data : c));
    } catch (err) {
      alert(err.response?.data?.detail ?? 'Failed to send contract');
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this contract?')) return;
    try {
      const res = await ContractsService.cancel(id);
      setContracts(prev => prev.map(c => c.id === id ? res.data : c));
    } catch (err) {
      alert(err.response?.data?.detail ?? 'Failed to cancel contract');
    }
  };

  const handleView = (contract) => {
    alert(`Contract "${contract.title}" — detail view coming soon`);
  };

  const handleCreate = async (data) => {
    const res = await ContractsService.create(data);
    setContracts(prev => [res.data, ...prev]);
    setShowNewModal(false);
  };

  return (
    <div className="contracts-page">
      <div className="contracts-header">
        <h1 className="contracts-header__title">Contracts</h1>
        <div className="contracts-header__actions">
          <div className="contracts-search-wrap">
            <svg className="contracts-search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              className="contracts-search-input"
              type="text"
              placeholder="Search contracts…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button className="btn-primary btn-sm" onClick={() => setShowNewModal(true)}>
            + New Contract
          </button>
        </div>
      </div>

      <div className="contracts-filters">
        {FILTER_TABS.map(tab => (
          <button
            key={tab}
            className={`filter-tab${activeFilter === tab ? ' filter-tab--active' : ''}`}
            onClick={() => setActiveFilter(tab)}
          >
            {STATUS_LABELS[tab]} ({countFor(tab)})
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
          <p className="contracts-empty__title">
            {search ? 'No contracts match your search' : 'No contracts yet'}
          </p>
          <p className="contracts-empty__subtitle">
            {search
              ? `No results for "${search}"`
              : 'Create your first contract by clicking + New Contract above.'}
          </p>
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="contracts-list">
          {filtered.map(contract => (
            <ContractRow
              key={contract.id}
              contract={contract}
              onSend={handleSend}
              onView={handleView}
              onCancel={handleCancel}
            />
          ))}
        </div>
      )}

      {showNewModal && (
        <NewContractModal
          onClose={() => setShowNewModal(false)}
          onCreate={handleCreate}
        />
      )}
    </div>
  );
};

export default ContractsClient;
