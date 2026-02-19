import axios from './axios';

export const authAPI = {
  register: async (userData) => {
    // Removed the leading slash
    const response = await axios.post('auth/register', userData);
    return response.data;
  },

  login: async (credentials) => {
    // Removed the leading slash
    const response = await axios.post('auth/login', credentials);
    return response.data;
  },

  forgotPassword: async (email) => {
    // Removed the leading slash
    const response = await axios.post('auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token, newPassword) => {
    // Removed the leading slash
    const response = await axios.post('auth/reset-password', {
      token,
      new_password: newPassword,
    });
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};