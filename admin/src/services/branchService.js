import api from './api';
import { ENDPOINTS } from '../constants/apiEndpoints';

const branchService = {
  getAll: async (params = {}) => {
    const res = await api.get(ENDPOINTS.BRANCHES, { params });
    return res;
  },
  getById: async (id) => {
    const res = await api.get(`${ENDPOINTS.BRANCHES}/${id}`);
    return res;
  },
  create: async (data) => {
    const res = await api.post(ENDPOINTS.BRANCHES, data);
    return res;
  },
  update: async (id, data) => {
    const res = await api.put(`${ENDPOINTS.BRANCHES}/${id}`, data);
    return res;
  },
  toggleStatus: async (id) => {
    const res = await api.patch(`${ENDPOINTS.BRANCHES}/${id}/status`);
    return res;
  },
  remove: async (id) => {
    const res = await api.delete(`${ENDPOINTS.BRANCHES}/${id}`);
    return res;
  }
};

export default branchService;
