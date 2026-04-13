import React, { useState, useEffect } from 'react';
import { useAuth } from '../features/hooks/useAuth';
import axiosInstance from '../services/axios';
import '../assets/ReviewPage.css';

const ReviewPage = () => {
  const { user, loading: authLoading } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const categories = [
    "Platform Usability",
    "Client-Freelancer Communication",
    "Payment Security",
    "Project Matching Accuracy",
    "Contract Flexibility"
  ];

  useEffect(() => {
    const fetchData = async () => {
      if (authLoading || !user?.id) {
        if (!authLoading && !user) setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { data: fetchedReviews } = await axiosInstance.get(`/reviews/user/${user.id}`);

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

  if (authLoading || loading) {
    return (
      <div className="review-container">
        <div style={{ textAlign: "center", marginTop: "50px", color: "var(--text-muted)" }}>
          Loading reviews...
        </div>
      </div>
    );
  }

  if (!user && !loading) {
    return <div className="review-container">Please login to view your reviews.</div>;
  }

  return (
    <div className="review-container">
      <header className="review-header">
        <h1>{user?.role === 'client' ? "Freelancer Feedback" : "Client Reviews"}</h1>
        <p>Trusted feedback from verified clients and freelancers on TalentLink</p>
      </header>

      {/* Summary Card */}
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

      {/* Category Chips */}
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