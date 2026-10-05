import api from './api';
import { ENDPOINTS } from '../constants/apiEndpoints';

const unitService = {
  getAll: async (params = {}) => {
    const res = await api.get(ENDPOINTS.UNITS, { params });
    return res;
  },
  getById: async (id) => {
    const res = await api.get(`${ENDPOINTS.UNITS}/${id}`);
    return res;
  },
  create: async (data) => {
    const res = await api.post(ENDPOINTS.UNITS, data);
    return res;
  },
  update: async (id, data) => {
    const res = await api.put(`${ENDPOINTS.UNITS}/${id}`, data);
    return res;
  },
  toggleStatus: async (id) => {
    const res = await api.patch(`${ENDPOINTS.UNITS}/${id}/status`);
    return res;
  },
  remove: async (id) => {
    const res = await api.delete(`${ENDPOINTS.UNITS}/${id}`);
    return res;
  }
};

export default unitService;
