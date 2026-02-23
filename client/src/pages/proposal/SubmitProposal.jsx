import { useState } from "react";
import axios from "axios";

const API_BASE = process.env.REACT_APP_API_BASE_URL;

export default function SubmitProposal({ projectId = 1, freelancerId = 1 }) {
  const [coverLetter, setCoverLetter] = useState("");
  const [budget, setBudget] = useState("");
  const [deliveryTime, setDeliveryTime] = useState("");

  const handleSubmit = async () => {
    try {
      await axios.post(${API_BASE}/proposals/, {
        project_id: projectId,
        freelancer_id: freelancerId,
        cover_letter: coverLetter,
        proposed_budget: parseFloat(budget),
        delivery_time: deliveryTime
      });

      alert("Proposal submitted!");
      setCoverLetter("");
      setBudget("");
      setDeliveryTime("");
    } catch (err) {
      console.error(err);
      alert("Error submitting proposal");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Submit Proposal</h2>

      <textarea
        placeholder="Cover Letter"
        value={coverLetter}
        onChange={e => setCoverLetter(e.target.value)}
        style={{ width: "100%", height: 100 }}
      />

      <br /><br />

      <input
        type="number"
        placeholder="Proposed Budget"
        value={budget}
        onChange={e => setBudget(e.target.value)}
      />

      <br /><br />

      <input
        type="text"
        placeholder="Delivery Time"
        value={deliveryTime}
        onChange={e => setDeliveryTime(e.target.value)}
      />

      <br /><br />

      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
}
