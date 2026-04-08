import authService from "./auth";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

async function apiGet(path) {
  const token = authService.getToken();
  const response = await fetch(`${API_URL}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Request failed");
  }

  return response.json();
}

export const fetchFreelancerDashboard = () => apiGet("/freelancer/dashboard");
export const fetchFreelancerProfile = () => apiGet("/freelancer/profile");
export const fetchFreelancerProjects = () => apiGet("/freelancer/projects");
export const fetchFreelancerEarnings = () => apiGet("/freelancer/earnings");
export const fetchFreelancerProposals = () => apiGet("/freelancer/proposals");
