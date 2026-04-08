import authService from "./auth";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

async function apiRequest(path, options = {}) {
  const token = authService.getToken();
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    let message = "Request failed";
    try {
      const payload = await response.json();
      message = payload.detail || message;
    } catch (error) {
      const text = await response.text();
      if (text) {
        message = text;
      }
    }
    throw new Error(message);
  }

  return response.json();
}

export const fetchClientDashboard = () => apiRequest("/client/dashboard");
export const fetchClientProjects = () => apiRequest("/client/projects");
export const fetchClientProfile = () => apiRequest("/client/profile");
export const fetchClientReceivedProposals = () => apiRequest("/client/received-proposals");
export const updateClientProposalStatus = (proposalId, status) =>
  apiRequest(`/client/received-proposals/${proposalId}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
