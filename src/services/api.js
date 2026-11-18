// src/services/api.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to automatically attach JWT token and active workspace ID
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('worksphere_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const activeWorkspace = localStorage.getItem('worksphere_active_workspace');
    if (activeWorkspace) {
      try {
        const parsed = JSON.parse(activeWorkspace);
        if (parsed && (parsed._id || parsed.id)) {
          config.headers['x-workspace-id'] = parsed._id || parsed.id;
        }
      } catch (err) {
        // silent
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle errors gracefully
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message ||
      (error.response?.data?.errors && error.response?.data?.errors[0]) ||
      error.message ||
      'Something went wrong';

    if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
      localStorage.removeItem('worksphere_token');
      localStorage.removeItem('worksphere_user');
      window.location.href = '/login';
    }

    return Promise.reject(new Error(message));
  }
);

export default api;

