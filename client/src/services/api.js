import axios from './axios'; // <-- Changed to use your custom axios setup!

// 1. Create Freelancer Profile
export const createFreelancerProfile = async (userId, profileData) => {
  try {
    const response = await axios.post(
      `users/${userId}/freelancer-profile`, 
      profileData
    );
    return response.data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

// 2. Create Client Profile
export const createClientProfile = async (userId, profileData) => {
  try {
    const response = await axios.post(
      `users/${userId}/client-profile`, 
      profileData
    );
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

// 5. Create a Proposal (Apply for a Job)
export const createProposal = async (userId, proposalData) => {
  try {
    const response = await axios.post(
      `users/${userId}/proposals`,
      proposalData
    );
    return response.data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

// 6. Get My Proposals (Freelancer Contracts Page)
export const getMyProposals = async (userId) => {
  try {
    const response = await axios.get(`users/${userId}/proposals`);
    return response.data;
  } catch (error) {
    console.error("API Error fetching proposals:", error);
    throw error;
  }
};