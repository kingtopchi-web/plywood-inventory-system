const { Settings, AuditLog } = require('../models');
const ApiError = require('../utils/apiError');

class SettingsService {
  async getSettings() {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }
    return settings;
  }

  async updateSettings(adminId, updateData) {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
    }
    
    // Update fields
    Object.keys(updateData).forEach(key => {
      settings[key] = updateData[key];
    });
    
    await settings.save();

    await AuditLog.create({
      action: 'UPDATE_SETTINGS',
      module: 'SETTINGS',
      entity: 'Settings',
      entityId: settings._id,
      performedBy: adminId,
      details: updateData
    }).catch(err => console.error('Failed to log audit for settings:', err));

    return settings;
  }
}

module.exports = new SettingsService();
