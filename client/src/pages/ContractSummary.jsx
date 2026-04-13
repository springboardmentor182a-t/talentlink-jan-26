import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../services/axios'; // Securely imports the axios instance injected with dynamic URL handling
import './ContractSummary.css';

const ContractSummary = () => {
    const { contractId } = useParams();
    const navigate = useNavigate();
    const [contract, setContract] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAndSimplify = async () => {
            try {
                // If contractId is missing, fallback to 1 for safety during testing
                const id = contractId || 1;
                const res = await axiosInstance.post(`/contracts/${id}/simplify`);

                // Matches the backend shape: return {"status": "success", "data": contract.simplified_summary}
                setContract(res.data.data);
            } catch (err) {
                console.error("Simplification failed:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAndSimplify();
    }, [contractId]);

    const getRiskColor = (level) => {
        if (!level) return 'risk-default';
        const lower = String(level).toLowerCase();
        if (lower.includes('low')) return 'risk-low';
        if (lower.includes('medium') || lower.includes('moderate')) return 'risk-medium';
        if (lower.includes('high')) return 'risk-high';
        return 'risk-default';
    };

    if (loading) {
        return (
            <div className="summary-loading-container">
                <div className="spinner"></div>
                <h2>AI is translating legalese... ✨</h2>
                <p>Analyzing clauses, identifying risks, and generating human-readable terms.</p>
            </div>
        );
    }

    if (!contract) {
        return (
            <div className="summary-error-container">
                <div className="error-icon">⚠️</div>
                <h2>Failed to load AI summary</h2>
                <button onClick={() => navigate(-1)} className="btn-secondary">Go Back</button>
            </div>
        );
    }

    return (
        <div className="contract-summary-page">
            <header className="summary-header">
                <div>
                    <button className="back-btn" onClick={() => navigate(-1)}>
                        ← Back to Contracts
                    </button>
                    <h1>Contract Analysis <span className="ai-badge">AI Powered ✨</span></h1>
                </div>
            </header>

            <div className="summary-split-layout">
                {/* Left Pane: Original Document */}
                <div className="legal-document-pane">
                    <div className="pane-header">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                        <h3>Original Legal Text</h3>
                    </div>
                    <div className="document-content scroll-box">
                        <div className="doc-watermark">CONFIDENTIAL</div>
                        <p><strong>This Contractual Agreement</strong></p>
                        <p>WHEREAS, the Client wishes to engage the Freelancer regarding the scope detailed within the terms of service;</p>
                        <p>NOW, THEREFORE, in consideration of the mutual covenants and agreements hereinafter set forth, the parties agree as follows:</p>
                        <p>1. The Developer shall provide the Services in accordance with the specifications in Exhibit A.</p>
                        <p>2. Payment shall be distributed upon completion of stated deliverables.</p>
                        <p>3. Client retains all Intellectual Property rights pertaining to the final delivery.</p>
                        <p>4. Liability shall not exceed the total project fee under any circumstance.</p>
                        <br />
                        <p><em>IN WITNESS WHEREOF, the parties have executed this Agreement as of the Effective Date.</em></p>
                    </div>
                </div>

                {/* Right Pane: AI Summary */}
                <div className="ai-analysis-pane">
                    <div className="pane-header ai-header-theme">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" /></svg>
                        <h3>Plain English Breakdown</h3>
                    </div>
                    <div className="analysis-content">

                        <div className="analysis-card highlight-card">
                            <div className="card-top">
                                <h4>TL;DR</h4>
                            </div>
                            <p className="tldr-text">{contract.tl_dr || 'No TL;DR provided.'}</p>
                        </div>

                        <div className="analysis-card">
                            <h4>Key Points</h4>
                            <ul className="key-points-list">
                                {contract.key_points && contract.key_points.length > 0 ? (
                                    contract.key_points.map((pt, i) => (
                                        <li key={i}>
                                            <span className="bullet-icon">➤</span>
                                            <span>{pt}</span>
                                        </li>
                                    ))
                                ) : (
                                    <li><span className="bullet-icon">➤</span><span>No specific key points identified.</span></li>
                                )}
                            </ul>
                        </div>

                        <div className="analysis-card risk-card">
                            <div className="risk-header">
                                <h4>Risk Assessment</h4>
                                <div className={`risk-badge ${getRiskColor(contract.risk_level)}`}>
                                    {contract.risk_level || 'Unknown'} Risk
                                </div>
                            </div>
                            <p className="risk-description">
                                Based on standard freelancer agreements, this contract carries {String(contract.risk_level || 'unknown').toLowerCase()} risk for the active party.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContractSummary;
