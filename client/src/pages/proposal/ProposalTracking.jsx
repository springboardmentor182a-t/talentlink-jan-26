import { useEffect, useState } from "react";
import axios from "axios";

const BASE_URL = process.env.REACT_APP_BASE_URL;

export default function ProposalTracking({ freelancerId = 1 }) {
  const [proposals, setProposals] = useState([]);

  useEffect(() => {
    const fetchProposals = async () => {
      try {
        const res = await axios.get(
          ${BASE_URL}/proposals/freelancer/${freelancerId}
        );
        setProposals(res.data);
      } catch (err) {
        console.error(err);
        alert("Error loading your proposals");
      }
    };

    fetchProposals();
  }, [freelancerId]);

  return (
    <div style={{ padding: 20 }}>
      <h2>My Proposals</h2>

      {proposals.map((p) => (
        <div
          key={p.id}
          style={{ border: "1px solid #ddd", margin: 10, padding: 10 }}
        >
          <p>
            <strong>Project:</strong> {p.project_id}
          </p>
          <p>Status: {p.status}</p>
        </div>
      ))}
    </div>
  );
}
