import api from './api';
import { ENDPOINTS } from '../constants/apiEndpoints';

const categoryService = {
  getAll: async (params = {}) => {
    const res = await api.get(ENDPOINTS.CATEGORIES, { params });
    return res;
  },
  getById: async (id) => {
    const res = await api.get(`${ENDPOINTS.CATEGORIES}/${id}`);
    return res;
  },
  create: async (data) => {
    const res = await api.post(ENDPOINTS.CATEGORIES, data);
    return res;
  },
  update: async (id, data) => {
    const res = await api.put(`${ENDPOINTS.CATEGORIES}/${id}`, data);
    return res;
  },
  toggleStatus: async (id) => {
    const res = await api.patch(`${ENDPOINTS.CATEGORIES}/${id}/status`);
    return res;
  },
  remove: async (id) => {
    const res = await api.delete(`${ENDPOINTS.CATEGORIES}/${id}`);
    return res;
  }
};

export default categoryService;
