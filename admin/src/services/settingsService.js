import api from './api';
import { ENDPOINTS } from '../constants/apiEndpoints';

class SettingsService {
  async getSettings() {
    const response = await api.get(ENDPOINTS.SETTINGS);
    return response.data;
  }

  async updateSettings(data) {
    const response = await api.put(ENDPOINTS.SETTINGS, data);
    return response.data;
  }
}

export const settingsService = new SettingsService();
