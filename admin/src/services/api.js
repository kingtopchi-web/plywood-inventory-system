import axios from 'axios';
import { API_BASE_URL } from '../constants/apiEndpoints';
import { storage } from '../utils/storage';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
  },
});

// Request Interceptor: Attach JWT Bearer Token
api.interceptors.request.use(
  (config) => {
    const token = storage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Extract data & handle auth expirations
api.interceptors.response.use(
  (response) => {
    // If backend uses standard ApiResponse wrapper, unpack data
    return response.data;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Auto logout if unauthenticated and not already on login page
      storage.clear();
      if (!window.location.pathname.includes('/admin/login')) {
        window.location.href = '/admin/login';
      }
    }
    const message =
      error.response?.data?.message || error.message || 'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

export default api;
