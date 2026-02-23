import { useEffect, useState } from "react";
import axios from "axios";

export default function ViewProposals({ projectId = 1 }) {
  const [proposals, setProposals] = useState([]);

  const loadProposals = async () => {
    const res = await axios.get(
      http://localhost:8000/proposals/project/${projectId}
    );
    setProposals(res.data);
  };

  useEffect(() => {
    loadProposals();
  }, []);

  const accept = async (id) => {
    await axios.put(http://localhost:8000/proposals/${id}/accept);
    loadProposals();
  };

  const reject = async (id) => {
    await axios.put(http://localhost:8000/proposals/${id}/reject);
    loadProposals();
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Proposals</h2>

      {proposals.map(p => (
        <div key={p.id} style={{ border: "1px solid #ccc", margin: 10, padding: 10 }}>
          <p><strong>Freelancer:</strong> {p.freelancer_id}</p>
          <p>{p.cover_letter}</p>
          <p>Budget: {p.proposed_budget}</p>
          <p>Delivery: {p.delivery_time}</p>
          <p>Status: {p.status}</p>

          <button onClick={() => accept(p.id)}>Accept</button>
          <button onClick={() => reject(p.id)} style={{ marginLeft: 10 }}>Reject</button>
        </div>
      ))}
    </div>
  );
}
