import React, { useState, useEffect } from 'react';
import { useAuth } from '../features/hooks/useAuth';
import './ReviewPage.css';

const ReviewPage = () => {
  const { user, loading: authLoading } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const categories = [
    "4.0 Platform Usability",
    "4.0 Client-Freelancer Communication",
    "4.0 Payment Security",
    "3.5 Project Matching Accuracy",
    "3.0 Contract Flexibility"
  ];

  useEffect(() => {
    const fetchData = async () => {
      // Don't fetch if still checking auth or no valid user
      if (authLoading || !user?.id) {
        if (!authLoading && !user) setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const envUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
        const baseUrl = envUrl.endsWith('/api') ? envUrl : `${envUrl.replace(/\/$/, '')}/api`;

        // Fetch using browser's native fetch directly
        const response = await fetch(`${baseUrl}/reviews/user/${user.id}`);
        if (!response.ok) throw new Error(`API Error: ${response.status}`);

        const fetchedReviews = await response.json();

        // Dynamically compute the exact stats needed by the new UI
        const totalCount = fetchedReviews.length;
        const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        let sum = 0;

        fetchedReviews.forEach(r => {
          const rating = Math.round(r.rating || 0);
          if (rating >= 1 && rating <= 5) dist[rating]++;
          sum += Number(r.rating || 0);
        });

        const avgRating = totalCount > 0 ? (sum / totalCount).toFixed(1) : '0.0';

        setReviews(fetchedReviews);
        setStats({
          total_count: totalCount,
          average_rating: avgRating,
          distribution: dist
        });
      } catch (err) {
        console.error("Error fetching review data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.id, authLoading]);

  // Keep the consistent loading state and layout wrap
  if (authLoading || loading) {
    return (
      <div className="review-container">
        <div style={{ textAlign: "center", marginTop: "50px", color: "var(--text-muted)" }}>Loading TalentLink Reviews...</div>
      </div>
    );
  }

  // Fallback to avoid error crashes if someone lands here without an account
  if (!user && !loading) {
    return <div className="review-container">Please login to view your reviews.</div>
  }

  return (
    <div className="review-container">
      <header className="review-header">
        <h1>{user?.role === 'client' ? "Freelancer Feedback" : "Client Reviews"}</h1>
        <p>Trusted feedback from verified clients and freelancers on TalentLink</p>
      </header>

      {/* Summary Card - Values dynamically computed */}
      <div className="summary-card">
        <div className="overall-score">
          <span className="big-score">{stats?.average_rating || '0.0'}</span>
          <div className="stars-row orange-stars">
            {'★'.repeat(Math.round(stats?.average_rating || 0))}{'☆'.repeat(5 - Math.round(stats?.average_rating || 0))}
          </div>
          <span className="review-count">{stats?.total_count || 0} verified reviews</span>
        </div>

        <div className="rating-bars">
          {[5, 4, 3, 2, 1].map((num) => {
            const count = stats?.distribution?.[num] || 0;
            const percentage = stats?.total_count ? (count / stats.total_count) * 100 : 0;
            return (
              <div key={num} className="bar-row">
                <span className="star-num">{num}.0</span>
                <div className="bar-bg">
                  <div className="bar-fill" style={{ width: `${percentage}%` }}></div>
                </div>
                <span className="bar-label">{count} experiences</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Category Chips - Added Here */}
      <div className="category-row">
        {categories.map(cat => (
          <span key={cat} className="category-chip">{cat}</span>
        ))}
      </div>

      {/* Review List */}
      <div className="reviews-list">
        {reviews.length > 0 ? (
          reviews.map((rev, idx) => (
            <div key={rev.id || idx} className="individual-review-card">
              <div className="review-user-info">
                <div className="avatar-placeholder"></div>
                <div className="user-details">
                  <h4>{rev.reviewer_name || "Verified Collaborator"}</h4>
                  <p>Project Reference: #{rev.project_id || "N/A"} • {rev.created_at ? new Date(rev.created_at).toLocaleDateString() : 'Recent'}</p>
                </div>
                <div className="user-rating">
                  <span className="num-rating">{Number(rev.rating || 0).toFixed(1)}</span>
                  <span className="orange-stars" style={{ marginLeft: "6px" }}>
                    {'★'.repeat(Math.round(rev.rating || 0))}{'☆'.repeat(5 - Math.round(rev.rating || 0))}
                  </span>
                </div>
              </div>
              <p className="review-text">{rev.comment}</p>
            </div>
          ))
        ) : (
          <div style={{ textAlign: "center", color: "#8898aa", padding: "40px", background: "white", borderRadius: "12px" }}>
            No reviews yet. Complete a project to start receiving feedback!
          </div>
        )}
      </div>

    </div>
  );
};

export default ReviewPage;