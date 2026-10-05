const activityLogService = require('../services/activityLogService');
const ApiResponse = require('../utils/apiResponse');

exports.getHistory = async (req, res) => {
  try {
    const data = await activityLogService.getHistory(req.query);
    return ApiResponse.success(res, data, 'History loaded successfully');
  } catch (error) {
    console.error('getHistory error:', error);
    return res.status(500).json({ success: false, message: 'Unable to load history. Please try again.' });
  }
};

exports.getHistoryById = async (req, res) => {
  try {
    const log = await activityLogService.getHistoryById(req.params.id);
    if (!log) {
      return ApiResponse.notFound(res, 'Activity not found');
    }
    return ApiResponse.success(res, log, 'Activity retrieved');
  } catch (error) {
    console.error('getHistoryById error:', error);
    return res.status(500).json({ success: false, message: 'Unable to load activity details' });
  }
};
