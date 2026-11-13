import axios from 'axios';

const API_BASE = (import.meta.env?.VITE_API_URL || '').replace(/\/+$/, '');

export const api = axios.create({
  baseURL: `${API_BASE}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('kisansetu_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/signup') {
        // Clear expired auth session
        localStorage.removeItem('kisansetu_token');
        localStorage.removeItem('kisansetu_user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
