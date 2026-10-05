import api from './api';
import { ENDPOINTS } from '../constants/apiEndpoints';

const subcategoryService = {
  getAll: async (params = {}) => {
    const res = await api.get(ENDPOINTS.SUBCATEGORIES, { params });
    return res;
  },
  getById: async (id) => {
    const res = await api.get(`${ENDPOINTS.SUBCATEGORIES}/${id}`);
    return res;
  },
  create: async (data) => {
    const res = await api.post(ENDPOINTS.SUBCATEGORIES, data);
    return res;
  },
  update: async (id, data) => {
    const res = await api.put(`${ENDPOINTS.SUBCATEGORIES}/${id}`, data);
    return res;
  },
  toggleStatus: async (id) => {
    const res = await api.patch(`${ENDPOINTS.SUBCATEGORIES}/${id}/status`);
    return res;
  },
  remove: async (id) => {
    const res = await api.delete(`${ENDPOINTS.SUBCATEGORIES}/${id}`);
    return res;
  }
};

export default subcategoryService;
