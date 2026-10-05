import api from './api';

const historyService = {
  getHistory: async (params = {}) => {
    const response = await api.get('/history', { params });
    return response;
  },
  
  getHistoryById: async (id) => {
    const response = await api.get(`/history/${id}`);
    return response;
  }
};

export default historyService;
