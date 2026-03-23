import React, { useState, useEffect, useContext } from 'react';
import api from '../../utils/api';
import { AuthContext } from '../../context/AuthContext';
import Sidebar from '../../layout/Sidebar';
import Navbar from '../../layout/Navbar';
import { Star, MessageSquare, Award } from 'lucide-react';
import './Dashboard.css';

const Reviews = () => {
    const { token } = useContext(AuthContext);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const response = await api.get('/reviews/me');
                setReviews(response.data);
            } catch (error) {
                console.error("Error fetching reviews:", error);
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchReviews();
        }
    }, [token]);

    const averageRating = reviews.length > 0
        ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
        : "0.0";
    return (
        <div className="dashboard-layout">
            <Navbar />
            <div className="dashboard-container">
                <Sidebar />
                <div className="main-content scrollable">
                    <div className="reviews-header">
                        <h1 className="page-title">Reviews & Ratings</h1>
                        <p className="page-subtitle">Your feedback from clients</p>
                    </div>

                    <div className="stats-row-grid">
                        <div className="stat-card-white">
                            <div className="stat-card-content">
                                <span className="stat-label">Average Rating</span>
                                <div className="stat-value-with-icon">
                                    <span className="stat-value-large">{averageRating}</span>
                                    <Star size={20} fill="#fbbf24" color="#fbbf24" className="ml-8" />
                                </div>
                            </div>
                            <div className="stat-icon-wrapper-large gold-bg">
                                <Award size={28} color="#d97706" strokeWidth={1.5} />
                            </div>
                        </div>

                        <div className="stat-card-white">
                            <div className="stat-card-content">
                                <span className="stat-label">Total Reviews</span>
                                <span className="stat-value-large">{reviews.length}</span>
                            </div>
                            <div className="stat-icon-wrapper-large blue-chat-bg">
                                <MessageSquare size={28} color="#2563eb" strokeWidth={1.5} />
                            </div>
                        </div>
                    </div>

                    <div className="reviews-list-section mt-32">
                        <div className="section-header-group">
                            <h2 className="section-title-medium">Client Reviews ({reviews.length})</h2>
                            <p className="section-subtitle-small">Feedback from your clients</p>
                        </div>

                        {loading ? (
                            <div className="loading-state">Loading reviews...</div>
                        ) : reviews.length > 0 ? (
                            <div className="reviews-grid-list mt-24">
                                {reviews.map((review) => (
                                    <div key={review.id} className="section-card review-item-card mb-16">
                                        <div className="review-header-flex">
                                            <div className="reviewer-info">
                                                <h3 className="reviewer-name">{review.reviewer_name}</h3>
                                                <div className="review-rating-row">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star 
                                                            key={i} 
                                                            size={14} 
                                                            fill={i < review.rating ? "#fbbf24" : "none"} 
                                                            color={i < review.rating ? "#fbbf24" : "#d1d5db"} 
                                                        />
                                                    ))}
                                                    <span className="rating-text ml-8">{review.rating}</span>
                                                </div>
                                            </div>
                                            <span className="review-date">{new Date(review.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <p className="review-comment mt-16">{review.comment}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="section-card empty-state-card mt-24">
                                <MessageSquare size={64} strokeWidth={1} className="empty-icon-grey" />
                                <p className="empty-text-contract">No reviews yet. Complete projects to receive your first review!</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reviews;
