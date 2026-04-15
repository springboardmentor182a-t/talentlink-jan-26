import axios from './axios';

// 1. Create Freelancer Profile
export const createFreelancerProfile = async (userId, profileData) => {
  try {
    const response = await axios.post(`users/${userId}/freelancer-profile`, profileData);
    return response.data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

// 2. Create Client Profile
export const createClientProfile = async (userId, profileData) => {
  try {
    const response = await axios.post(`users/${userId}/client-profile`, profileData);
    return response.data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

// 3. Get Freelancer Profile
export const getFreelancerProfile = async (userId) => {
  try {
    const response = await axios.get(`users/${userId}/freelancer_profile`);
    return response.data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

// 4. Get Client Profile
export const getClientProfile = async (userId) => {
  try {
    const response = await axios.get(`users/${userId}/client_profile`);
    return response.data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

// 5. Create a Proposal — uses canonical proposals router (not users router)
// userId param removed; server derives freelancer identity from JWT
export const createProposal = async (proposalData) => {
  try {
    const response = await axios.post('proposals/', proposalData);
    return response.data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

// 6. Get My Proposals — uses canonical proposals router
export const getMyProposals = async () => {
  try {
    const response = await axios.get('proposals/my-proposals');
    return response.data;
  } catch (error) {
    console.error("API Error fetching proposals:", error);
    throw error;
  }
};

export const getProjectProposals = async (projectId) => {
  const { data } = await axios.get(`proposals/project/${projectId}`);
  return data;
};

export const updateProposalStatus = async (proposalId, status) => {
  const { data } = await axios.patch(`proposals/${proposalId}/status`, { status });
  return data;
};

export const getUserById = async (userId) => {
  const { data } = await axios.get(`users/${userId}`);
  return data;
};

// ── Saved Projects ────────────────────────────────────────────────────────────

export const getSavedProjects = async () => {
  const { data } = await axios.get("saved-projects/");
  return data;
};

export const saveProject = async (projectId) => {
  const { data } = await axios.post(`saved-projects/${projectId}`);
  return data;
};

export const unsaveProject = async (projectId) => {
  await axios.delete(`saved-projects/${projectId}`);
};