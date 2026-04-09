const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // Can be the decoded JWT user ID
  action: { type: String, required: true }, // e.g., 'READ_STUDENT', 'UPDATE_GRADE'
  resource: { type: String, required: true }, // e.g., 'Student/12345'
  ipAddress: { type: String },
  timestamp: { type: Date, default: Date.now }
});

// Using a separate unencrypted connection if needed, but standard schema is fine
const AuditLog = mongoose.models.AuditLog || mongoose.model('AuditLog', auditLogSchema);

const auditLogger = (actionDescription) => {
  return async (req, res, next) => {
    // Capture the original end/json function to wait for response status
    const originalJson = res.json;
    
    res.json = function (body) {
      res.json = originalJson; // Restore
      
      // Only log if successful to prevent logging failed exploit attempts as normal actions
      // (Though in strict SecOps, you log everything. For this project, we log the user's action)
      if (res.statusCode >= 200 && res.statusCode < 400 && req.user) {
        AuditLog.create({
          userId: req.user.id || req.user._id || 'System',
          action: actionDescription || req.method + ' ' + req.originalUrl,
          resource: req.params.id ? `Resource/${req.params.id}` : 'General',
          ipAddress: req.ip || req.connection.remoteAddress
        }).catch(err => console.error('Audit Log Failed:', err));
      }
      
      return res.json(body);
    };
    
    next();
  };
};

module.exports = { AuditLog, auditLogger };
