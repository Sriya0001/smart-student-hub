const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  actorRole: { type: String, required: true, default: 'system' }, // 'admin', 'student', 'teacher', 'system'
  actorId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', nullable: true },
  actorName: { type: String, nullable: true },
  action:    { type: String, required: true }, // e.g., 'profile.updated', 'file.uploaded'
  targetType: { type: String, nullable: true }, // 'student', 'application', 'file'
  targetId:   { type: String, nullable: true }, // PK/ID of the entity
  targetName: { type: String, nullable: true }, // Label for UI
  detail:     { type: String, nullable: true }, // Free-text detail
  ipAddress:  { type: String, nullable: true },
  timestamp:  { type: Date, default: Date.now }
});

module.exports = mongoose.model('AuditLog', auditLogSchema);

