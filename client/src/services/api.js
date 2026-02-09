// client/src/services/api.js
import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000';

// 1. Create Freelancer Profile
export const createFreelancerProfile = async (userId, profileData) => {
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

// 2. Create Client Profile
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

// 3. Get Freelancer Profile (FIXED: Uses axios instead of api)
export const getFreelancerProfile = async (userId) => {
  try {
    // Note the underscore: freelancer_profile
    const response = await axios.get(`${API_URL}/users/${userId}/freelancer_profile`);
    return response.data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

// 4. Get Client Profile (FIXED: Uses axios instead of api)
export const getClientProfile = async (userId) => {
  try {
    // Note the underscore: client_profile
    const response = await axios.get(`${API_URL}/users/${userId}/client_profile`);
    return response.data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};