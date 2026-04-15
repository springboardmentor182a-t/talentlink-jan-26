import { useState } from 'react';
import ReviewsService from '../features/services/reviews';

/**
 * ReviewModal — shown on completed contracts so either party can leave a review.
 *
 * Props:
 *   contract      — the full contract object from the API response
 *   currentUserId — current user's users.id (from AuthContext)
 *   onClose       — called when the modal should be dismissed
 *   onSubmitted   — called after a successful submission so the parent can
 *                   hide the "Leave a Review" button for this contract
 *
 * The reviewee is whoever is NOT the current user:
 *   - If current user is the client  → reviewee is the freelancer
 *   - If current user is the freelancer → reviewee is the client
 *
 * project_id, client_user_id, freelancer_user_id are all present on the
 * contract object after the contracts/service.py fix this session.
 */
export default function ReviewModal({ contract, currentUserId, onClose, onSubmitted }) {
  const [rating,     setRating]     = useState(0);
  const [hovered,    setHovered]    = useState(0);
  const [comment,    setComment]    = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState(null);
  const [done,       setDone]       = useState(false);

  // Determine reviewee — the other party
  const revieweeId = currentUserId === contract.client_user_id
    ? contract.freelancer_user_id
    : contract.client_user_id;

  const handleSubmit = async () => {
    if (rating === 0) {
      setError('Please select a star rating before submitting.');
      return;
    }
    if (!revieweeId || !contract.project_id) {
      setError('Could not determine review target. Please refresh and try again.');
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      await ReviewsService.create({
        rating,
        comment:     comment.trim() || null,
        project_id:  contract.project_id,
        reviewee_id: revieweeId,
      });
      setDone(true);
      onSubmitted(contract.id);
    } catch (err) {
      setError(err.response?.data?.detail ?? 'Failed to submit review. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div className="new-contract-overlay">
      <div className="new-contract-modal" style={{ maxWidth: 480 }}>
        <div className="new-contract-header">
          <div>
            <h2 className="new-contract-title">Leave a Review</h2>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--color-tertiary)', fontFamily: 'var(--font-text)' }}>
              {contract.title}
            </p>
          </div>
          <button className="new-contract-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="new-contract-body">
          {done ? (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>⭐</div>
              <p style={{ fontWeight: 600, fontSize: 16, fontFamily: 'var(--font-text)', color: 'var(--color-secondary)', margin: 0 }}>
                Review submitted!
              </p>
              <p style={{ fontSize: 13, color: 'var(--color-tertiary)', fontFamily: 'var(--font-text)', marginTop: 6 }}>
                Thank you for your feedback.
              </p>
            </div>
          ) : (
            <>
              {error && (
                <p style={{ color: '#dc2626', fontSize: 13, fontFamily: 'var(--font-text)', margin: '0 0 8px' }}>
                  {error}
                </p>
              )}

              {/* Star picker */}
              <div className="new-contract-field">
                <label className="new-contract-label">Rating</label>
                <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                  {[1, 2, 3, 4, 5].map(n => (
                    <span
                      key={n}
                      onClick={() => setRating(n)}
                      onMouseEnter={() => setHovered(n)}
                      onMouseLeave={() => setHovered(0)}
                      style={{
                        fontSize: 32,
                        cursor: 'pointer',
                        color: n <= (hovered || rating) ? '#ff7a00' : '#d1d5db',
                        transition: 'color 0.1s',
                        userSelect: 'none',
                      }}
                    >
                      ★
                    </span>
                  ))}
                  {rating > 0 && (
                    <span style={{ alignSelf: 'center', fontSize: 13, color: 'var(--color-tertiary)', fontFamily: 'var(--font-text)', marginLeft: 6 }}>
                      {rating}.0
                    </span>
                  )}
                </div>
              </div>

              {/* Comment */}
              <div className="new-contract-field">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <label className="new-contract-label">Comment <span style={{ fontWeight: 400, color: 'var(--color-tertiary)' }}>(optional)</span></label>
                  <span style={{ fontSize: 11, fontFamily: 'var(--font-text)', color: 'var(--color-tertiary)' }}>
                    {comment.length} / 2000
                  </span>
                </div>
                <textarea
                  className="new-contract-textarea"
                  placeholder="Share your experience working on this project..."
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  maxLength={2000}
                  rows={4}
                />
              </div>
            </>
          )}
        </div>

        <div className="new-contract-footer">
          {done ? (
            <button className="btn-primary btn-sm" onClick={onClose}>Close</button>
          ) : (
            <>
              <button className="btn-secondary btn-sm" onClick={onClose}>Cancel</button>
              <button
                className="btn-primary btn-sm"
                onClick={handleSubmit}
                disabled={submitting || rating === 0}
              >
                {submitting ? 'Submitting…' : 'Submit Review'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}