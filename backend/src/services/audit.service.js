const { AuditLog } = require('../models');

class AuditService {
  /**
   * Log an administrative activity
   */
  async log({ action, module, entity, entityId, req, details = {} }) {
    try {
      await AuditLog.create({
        action,
        module,
        entity,
        entityId,
        performedBy: req?.admin?._id || null,
        adminEmail: req?.admin?.email || 'SYSTEM',
        ipAddress: req?.ip || req?.headers?.['x-forwarded-for'] || '',
        userAgent: req?.headers?.['user-agent'] || '',
        details,
      });
    } catch (error) {
      console.error('[AuditService] Failed to record audit log:', error.message);
    }
  }
}

module.exports = new AuditService();
