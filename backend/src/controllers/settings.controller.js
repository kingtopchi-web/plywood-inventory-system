const settingsService = require('../services/settings.service');
const ApiResponse = require('../utils/apiResponse');

class SettingsController {
  async getSettings(req, res, next) {
    try {
      const settings = await settingsService.getSettings();
      return ApiResponse.success(res, settings, 'Settings retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async updateSettings(req, res, next) {
    try {
      const settings = await settingsService.updateSettings(req.admin._id, req.body);
      return ApiResponse.success(res, settings, 'Settings updated successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new SettingsController();
