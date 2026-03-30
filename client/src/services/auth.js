import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
const TOKEN_KEY = 'token';

const authService = {
  login: async (email, password, role) => {
    const response = await axios.post(`${API_URL}/auth/login`, { email, password, role });
    if (response.data.access_token) {
      localStorage.setItem(TOKEN_KEY, response.data.access_token);
      // Decode JWT to get role (simplified for now)
      const base64Url = response.data.access_token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(window.atob(base64));
      localStorage.setItem('user_role', payload.role);
    }
    return response.data;
  },
  
  signup: async (userData) => {
    const response = await axios.post(`${API_URL}/auth/signup`, userData);
    return response.data;
  },
  
  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem('user_role');
  },
  
  isAuthenticated: () => {
    const token = localStorage.getItem(TOKEN_KEY);
    return !!token && token !== 'undefined' && token !== 'null';
  },
  
  getUserRole: () => {
    return localStorage.getItem('user_role');
  },
  
  getToken: () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token || token === 'undefined' || token === 'null') {
      return null;
    }
    return token;
  },
  
  forgotPassword: async (email) => {
    const response = await axios.post(`${API_URL}/auth/forgot-password`, { email });
    return response.data;
  },
  
  resetPassword: async (token, newPassword) => {
    const response = await axios.post(`${API_URL}/auth/reset-password`, { token, new_password: newPassword });
    return response.data;
  }
};


export default authService;
