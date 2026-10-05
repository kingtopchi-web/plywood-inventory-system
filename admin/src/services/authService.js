import api from './api';
import { ENDPOINTS } from '../constants/apiEndpoints';
import { storage } from '../utils/storage';

export const authService = {
  login: async (identifier, password) => {
    const res = await api.post(ENDPOINTS.LOGIN, { identifier, password });
    if (res.data?.token && res.data?.admin) {
      storage.setToken(res.data.token);
      storage.setAdmin(res.data.admin);
    }
    return res.data;
  },

  getProfile: async () => {
    const res = await api.get(ENDPOINTS.PROFILE);
    if (res.data?.admin) {
      storage.setAdmin(res.data.admin);
    }
    return res.data?.admin;
  },

  logout: async () => {
    try {
      await api.post(ENDPOINTS.LOGOUT);
    } catch {
      // Ignore network errors on logout
    } finally {
      storage.clear();
    }
  },

  forgotPassword: async (identifier) => {
    const res = await api.post(ENDPOINTS.FORGOT_PASSWORD, { identifier });
    return res.data;
  },

  resetPassword: async (token, newPassword) => {
    const res = await api.post(ENDPOINTS.RESET_PASSWORD(token), { newPassword });
    return res.data;
  },

  changePassword: async (currentPassword, newPassword) => {
    const res = await api.post(ENDPOINTS.CHANGE_PASSWORD, { currentPassword, newPassword });
    return res.data;
  },

  updateProfile: async (name, email, profileImage, logo) => {
    const res = await api.put(ENDPOINTS.UPDATE_PROFILE, { name, email, profileImage, logo });
    if (res.data?.admin) {
      storage.setAdmin(res.data.admin);
    }
    return res.data;
  }
};
