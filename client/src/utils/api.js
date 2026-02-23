import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_BASE_URL,
});


// Submit proposal
export const submitProposal = (data) =>
  api.post("/proposals", data);

// Get proposals (freelancer view)
export const getMyProposals = () =>
  api.get("/proposals/me");

// Get proposals by job (client view)
export const getProposalsByJob = (jobId) =>
  api.get(/proposals/job/${jobId});

export default api;
