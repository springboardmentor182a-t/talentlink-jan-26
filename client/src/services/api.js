
// client/src/services/api.js
import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000';

export const createFreelancerProfile = async (userId, profileData) => {
  // ... (keep your existing freelancer code here) ...
  try {
    const response = await axios.post(
      `${API_URL}/users/${userId}/freelancer-profile`, 
      profileData
    );
    return response.data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

// --- ADD THIS NEW FUNCTION ---
export const createClientProfile = async (userId, profileData) => {
  try {
    const response = await axios.post(
      `${API_URL}/users/${userId}/client-profile`, 
      profileData
    );
    return response.data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};