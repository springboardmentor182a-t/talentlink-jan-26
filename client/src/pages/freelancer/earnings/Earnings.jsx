import React, { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { fetchFreelancerEarnings } from "../../../services/freelancer";
import "./Earnings.css";

const Earnings = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadEarnings = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await fetchFreelancerEarnings();
        setData(response);
      } catch (err) {
        setError(err.message || "Failed to load earnings.");
      } finally {
        setLoading(false);
      }
    };

    loadEarnings();
  }, []);

  const summary = data?.summary || {};

  return (
    <div className="freelancer-section-page">
      <div className="section-hero">
        <div>
          <h2>Earnings</h2>
          <p>Completed and pending payments sourced from PostgreSQL.</p>
        </div>
      </div>

      {loading && <div className="freelancer-state">Loading earnings...</div>}
      {!loading && error && <div className="freelancer-state error">{error}</div>}

      {!loading && !error && (
        <>
          <div className="earnings-summary-grid">
            <article className="earnings-summary-card">
              <span>Total Earned</span>
              <strong>${Number(summary.totalEarned || 0).toLocaleString()}</strong>
            </article>
            <article className="earnings-summary-card">
              <span>Available Balance</span>
              <strong>${Number(summary.availableBalance || 0).toLocaleString()}</strong>
            </article>
            <article className="earnings-summary-card">
              <span>Pending</span>
              <strong>${Number(summary.pending || 0).toLocaleString()}</strong>
            </article>
          </div>

          <section className="earnings-layout-grid">
            <article className="earnings-panel chart-panel">
              <div className="section-heading">
                <h3>Monthly Earnings</h3>
                <p>This year&apos;s payment totals by month</p>
              </div>
              <div className="chart-shell">
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={data?.monthly || []}>
                    <defs>
                      <linearGradient id="monthlyEarningsFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0284c7" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#0284c7" stopOpacity={0.03} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#dbe4f0" strokeDasharray="4 4" vertical={false} />
                    <XAxis dataKey="month" tickLine={false} axisLine={false} />
                    <YAxis tickLine={false} axisLine={false} />
                    <Tooltip />
                    <Area type="monotone" dataKey="amount" stroke="#0284c7" fill="url(#monthlyEarningsFill)" strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </article>

            <article className="earnings-panel">
              <div className="section-heading">
                <h3>Payment History</h3>
                <p>Latest recorded payouts</p>
              </div>
              <div className="payment-history-stack">
                {(data?.history || []).length === 0 && <p className="empty-copy">No payment history available.</p>}
                {(data?.history || []).map((item) => (
                  <div key={item.id} className="payment-history-card">
                    <div>
                      <h4>{item.project_title}</h4>
                      <p>{item.client_name}</p>
                    </div>
                    <div className="payment-history-right">
                      <strong>${Number(item.amount || 0).toLocaleString()}</strong>
                      <span>{item.time_ago}</span>
                    </div>
                  </div>
                ))}
              </div>
            </article>
          </section>
        </>
      )}
    </div>
  );
};

export default Earnings;
