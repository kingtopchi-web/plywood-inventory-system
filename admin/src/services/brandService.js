import api from './api';
import { ENDPOINTS } from '../constants/apiEndpoints';

const brandService = {
  getAll: async (params = {}) => {
    const res = await api.get(ENDPOINTS.BRANDS, { params });
    return res;
  },
  getById: async (id) => {
    const res = await api.get(`${ENDPOINTS.BRANDS}/${id}`);
    return res;
  },
  create: async (data) => {
    const res = await api.post(ENDPOINTS.BRANDS, data);
    return res;
  },
  update: async (id, data) => {
    const res = await api.put(`${ENDPOINTS.BRANDS}/${id}`, data);
    return res;
  },
  toggleStatus: async (id) => {
    const res = await api.patch(`${ENDPOINTS.BRANDS}/${id}/status`);
    return res;
  },
  remove: async (id) => {
    const res = await api.delete(`${ENDPOINTS.BRANDS}/${id}`);
    return res;
  }
};

export default brandService;
