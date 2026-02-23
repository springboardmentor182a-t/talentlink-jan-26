import { useEffect, useState } from "react";
import axios from "axios";

export default function ProposalTracking({ freelancerId = 1 }) {
  const [proposals, setProposals] = useState([]);

  useEffect(() => {
    axios
      .get(http://localhost:8000/proposals/freelancer/${freelancerId})
      .then(res => setProposals(res.data));
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>My Proposals</h2>

      {proposals.map(p => (
        <div key={p.id} style={{ border: "1px solid #ddd", margin: 10, padding: 10 }}>
          <p><strong>Project:</strong> {p.project_id}</p>
          <p>Status: {p.status}</p>
        </div>
      ))}
    </div>
  );
}
