import api from './api';

const dashboardService = {
  // api.js interceptor already unwraps response.data
  // so `res` here = { success, data: {...stats...}, message }
  getStats: async (params = {}) => {
    const res = await api.get('/dashboard/stats', { params });
    return res; // res.data = the stats object
  }
};

export default dashboardService;
