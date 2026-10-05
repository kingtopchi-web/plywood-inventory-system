import api from './api';
import { ENDPOINTS } from '../constants/apiEndpoints';

const productService = {
  getAll: async (params = {}) => {
    const res = await api.get(ENDPOINTS.PRODUCTS, { params });
    return res;
  },
  getById: async (id) => {
    const res = await api.get(`${ENDPOINTS.PRODUCTS}/${id}`);
    return res;
  },
  create: async (data) => {
    const res = await api.post(ENDPOINTS.PRODUCTS, data);
    return res;
  },
  update: async (id, data) => {
    const res = await api.put(`${ENDPOINTS.PRODUCTS}/${id}`, data);
    return res;
  },
  toggleStatus: async (id) => {
    const res = await api.patch(`${ENDPOINTS.PRODUCTS}/${id}/status`);
    return res;
  },
  remove: async (id) => {
    const res = await api.delete(`${ENDPOINTS.PRODUCTS}/${id}`);
    return res;
  }
};

export default productService;
