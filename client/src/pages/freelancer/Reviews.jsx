import React from 'react';
import Sidebar from '../../layout/Sidebar';
import Navbar from '../../layout/Navbar';
import { Star, MessageSquare, Award } from 'lucide-react';
import './Dashboard.css';

const Reviews = () => {
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
                                    <span className="stat-value-large">0.0</span>
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
                                <span className="stat-value-large">0</span>
                            </div>
                            <div className="stat-icon-wrapper-large blue-chat-bg">
                                <MessageSquare size={28} color="#2563eb" strokeWidth={1.5} />
                            </div>
                        </div>

                        <div className="stat-card-white">
                            <div className="stat-card-content">
                                <span className="stat-label">Pending Reviews</span>
                                <span className="stat-value-large">0</span>
                            </div>
                            <div className="stat-icon-wrapper-large grey-chat-bg">
                                <MessageSquare size={28} color="#9ca3af" strokeWidth={1.5} />
                            </div>
                        </div>
                    </div>

                    <div className="reviews-list-section mt-32">
                        <div className="section-header-group">
                            <h2 className="section-title-medium">Client Reviews (0)</h2>
                            <p className="section-subtitle-small">Feedback from your clients</p>
                        </div>

                        <div className="section-card empty-state-card mt-24">
                            <MessageSquare size={64} strokeWidth={1} className="empty-icon-grey" />
                            <p className="empty-text-contract">No reviews yet. Complete projects to receive your first review!</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reviews;
