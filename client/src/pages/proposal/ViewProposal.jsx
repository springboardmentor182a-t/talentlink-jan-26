import { useEffect, useState } from "react";
import axios from "axios";

const BASE_URL = process.env.REACT_APP_BASE_URL;

export default function ViewProposals({ projectId = 1 }) {
  const [proposals, setProposals] = useState([]);

  const loadProposals = async () => {
    try {
      const res = await axios.get(${BASE_URL}/proposals/project/${projectId});
      setProposals(res.data);
    } catch (err) {
      console.error(err);
      alert("Error loading proposals");
    }
  };

  useEffect(() => {
    loadProposals();
  }, [projectId]);

  const accept = async (id) => {
    try {
      await axios.put(${BASE_URL}/proposals/${id}/accept);
      loadProposals();
    } catch (err) {
      console.error(err);
      alert("Error accepting proposal");
    }
  };

  const reject = async (id) => {
    try {
      await axios.put(${BASE_URL}/proposals/${id}/reject);
      loadProposals();
    } catch (err) {
      console.error(err);
      alert("Error rejecting proposal");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Proposals</h2>

      {proposals.map((p) => (
        <div
          key={p.id}
          style={{ border: "1px solid #ccc", margin: 10, padding: 10 }}
        >
          <p>
            <strong>Freelancer:</strong> {p.freelancer_id}
          </p>
          <p>{p.cover_letter}</p>
          <p>Budget: {p.proposed_budget}</p>
          <p>Delivery: {p.delivery_time}</p>
          <p>Status: {p.status}</p>

          <button onClick={() => accept(p.id)}>Accept</button>
          <button onClick={() => reject(p.id)} style={{ marginLeft: 10 }}>
            Reject
          </button>
        </div>
      ))}
    </div>
  );
}
