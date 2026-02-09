import React, { useEffect, useState } from 'react';
import './Earnings.css';

const Earnings = () => {
  const [summary, setSummary] = useState({
    totalEarned: 0,
    availableBalance: 0,
    pending: 0
  });
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const apiBase = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api';
    const controller = new AbortController();

    const fetchEarnings = async () => {
      setIsLoading(true);
      setError('');

      try {
        const response = await fetch(`${apiBase}/freelancer/earnings`, {
          signal: controller.signal
        });

        if (!response.ok) {
          throw new Error('Failed to load earnings data');
        }

        const data = await response.json();
        setSummary({
          totalEarned: data?.summary?.totalEarned ?? 0,
          availableBalance: data?.summary?.availableBalance ?? 0,
          pending: data?.summary?.pending ?? 0
        });
        setHistory(Array.isArray(data?.history) ? data.history : []);
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err.message || 'Failed to load earnings data');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchEarnings();

    return () => controller.abort();
  }, []);

  return (
    <div className="earnings-page">
      <div className="page-header">
        <h1>Earnings & Payments</h1>
        <p>View your earnings, payment history, and withdrawal options</p>
      </div>

      <div className="earnings-cards">
        <div className="earning-card">
          <h3>Total Earned</h3>
          <p className="amount">${summary.totalEarned}</p>
        </div>
        <div className="earning-card">
          <h3>Available Balance</h3>
          <p className="amount">${summary.availableBalance}</p>
        </div>
        <div className="earning-card">
          <h3>Pending</h3>
          <p className="amount">${summary.pending}</p>
        </div>
      </div>

      <div className="earnings-chart">
        <h2 className="section-title">Payment History</h2>
        {isLoading && <p className="placeholder">Loading earnings history...</p>}
        {!isLoading && error && <p className="placeholder">{error}</p>}
        {!isLoading && !error && history.length === 0 && (
          <p className="placeholder">No earnings history available.</p>
        )}
        {!isLoading && !error && history.length > 0 && (
          <ul className="earnings-history">
            {history.map((item) => (
              <li key={item.id || item._id} className="history-item">
                <div className="history-main">
                  <span className="history-title">{item.title || 'Payment'}</span>
                  <span className="history-date">{item.date || '—'}</span>
                </div>
                <span className="history-amount">${item.amount ?? 0}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Earnings;
