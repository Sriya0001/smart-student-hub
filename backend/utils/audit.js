const AuditLog = require('../models/Log');

/**
 * Log an action to the AuditLog database.
 * 
 * @param {Object} req - The Express request object (to extract IP).
 * @param {Object} params - The audit details.
 * @param {string} params.action - Short code for the action.
 * @param {string} [params.actorRole='system'] - Role of the person performing the action.
 * @param {string} [params.actorId] - User ID of the person.
 * @param {string} [params.actorName] - Name of the person.
 * @param {string} [params.targetType] - Type of entity being affected.
 * @param {string} [params.targetId] - ID of the entity.
 * @param {string} [params.targetName] - Name of the entity.
 * @param {string} [params.detail] - Additional information.
 */
const logAction = async (req, { 
  action, 
  actorRole = 'system', 
  actorId = null, 
  actorName = null, 
  targetType = null, 
  targetId = null, 
  targetName = null, 
  detail = null 
}) => {
  try {
    const ip = req ? (req.headers['x-forwarded-for'] || req.ip || req.connection.remoteAddress) : 'system';
    
    const entry = new AuditLog({
      actorRole,
      actorId,
      actorName,
      action,
      targetType,
      targetId,
      targetName,
      detail,
      ipAddress: ip
    });

    await entry.save();
  } catch (err) {
    console.error('Audit Log Error:', err);
    // We don't throw error to avoid crashing the main request if logging fails
  }
};

module.exports = { logAction };
