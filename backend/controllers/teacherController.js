const User = require('../models/User');
const Activity = require('../models/Activity');
const AuditLog = require('../models/Log');
const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');

// Helper for activity hash verification
const verifyFileHash = async (filePath, storedHash) => {
  if (!storedHash) return { valid: false, message: 'No digital fingerprint found' };
  try {
    const fileBuffer = await fs.readFile(filePath);
    const currentHash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
    return { 
      valid: currentHash === storedHash, 
      message: currentHash === storedHash ? 'Verified' : 'TAMPERED: File content changed!' 
    };
  } catch (err) {
    return { valid: false, message: 'Certificate file missing from server' };
  }
};

// Helper for audit logging
const logAction = async (userId, action, description, req) => {
  try {
    const log = new AuditLog({
      userId,
      action,
      description,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.headers['user-agent']
    });
    await log.save();
  } catch (err) {
    console.error('Audit log failed:', err.message);
  }
};

exports.getPendingActivities = async (req, res) => {
  try {
    const activities = await Activity.find({ status: 'pending' })
      .populate('studentId', 'name studentId department email')
      .sort({ createdAt: -1 });

    // Perform integrity check for each activity
    const activitiesWithIntegrity = await Promise.all(activities.map(async (act) => {
      const filePath = path.join(__dirname, '..', 'uploads', path.basename(act.fileUrl));
      const integrity = await verifyFileHash(filePath, act.hash);
      return { ...act._doc, integrity };
    }));

    res.json(activitiesWithIntegrity);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching pending activities', error: error.message });
  }
};

exports.reviewActivity = async (req, res) => {
  try {
    const { status, remarks } = req.body;
    const { id } = req.params;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const activity = await Activity.findById(id);
    if (!activity) return res.status(404).json({ message: 'Activity not found' });

    // Allow admins to override, but faculty can't change approved items
    if (activity.status === 'approved' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Approved records are protected' });
    }

    activity.status = status;
    activity.remarks = remarks || 'Bulk processed';
    activity.reviewedBy = req.user.id;
    activity.reviewedAt = new Date();

    await activity.save();
    
    await logAction(req.user.id, `activity_${status}`, `Activity ${id} reviewed as ${status}`, req);

    res.json({ message: `Activity ${status} successfully`, activity });
  } catch (error) {
    res.status(500).json({ message: 'Error reviewing activity', error: error.message });
  }
};

exports.bulkReview = async (req, res) => {
  try {
    const { ids, status, remarks } = req.body;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'List of Activity IDs is required' });
    }
    
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const results = await Activity.updateMany(
      { _id: { $in: ids }, status: 'pending' },
      { 
        $set: { 
          status, 
          remarks: remarks || 'Bulk reviewed by faculty',
          reviewedBy: req.user.id,
          reviewedAt: new Date()
        } 
      }
    );

    await logAction(req.user.id, 'bulk_review', `Bulk ${status} of ${ids.length} activities`, req);

    res.json({ 
      message: `Bulk ${status} complete`, 
      modifiedCount: results.modifiedCount,
      totalRequested: ids.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Bulk review failed', error: error.message });
  }
};

exports.getReviewHistory = async (req, res) => {
  try {
    const activities = await Activity.find({ 
      status: { $in: ['approved', 'rejected'] },
      reviewedBy: req.user.id 
    })
    .populate('studentId', 'name studentId department email')
    .sort({ reviewedAt: -1 })
    .limit(20);

    // Perform integrity check for each history item
    const historyWithIntegrity = await Promise.all(activities.map(async (act) => {
      const filePath = path.join(__dirname, '..', 'uploads', path.basename(act.fileUrl));
      const integrity = await verifyFileHash(filePath, act.hash);
      return { ...act._doc, integrity };
    }));

    res.json(historyWithIntegrity);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching history', error: error.message });
  }
};

exports.undoReview = async (req, res) => {
  try {
    const { id } = req.params;
    const activity = await Activity.findById(id);

    if (!activity) return res.status(404).json({ message: 'Activity not found' });
    
    // Safety: ensure it was reviewed by this user or they are admin
    if (activity.reviewedBy?.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to undo this review' });
    }

    const previousStatus = activity.status;
    activity.status = 'pending';
    activity.reviewedBy = undefined;
    activity.reviewedAt = undefined;
    activity.remarks = activity.remarks + ' (Reverted to pending)';

    await activity.save();

    await logAction(req.user.id, 'undo_review', `Reverted ${id} from ${previousStatus} to pending`, req);

    res.json({ message: 'Review successfully reverted to pending', activity });
  } catch (error) {
    res.status(500).json({ message: 'Error undoing review', error: error.message });
  }
};

exports.getFacultyDashboardStats = async (req, res) => {
  try {
    const pendingCount = await Activity.countDocuments({ status: 'pending' });
    const approvedCount = await Activity.countDocuments({ status: 'approved' });
    const rejectedCount = await Activity.countDocuments({ status: 'rejected' });
    
    // Category Distribution for charts
    const categories = ['Academic', 'Co-Curricular', 'Extra-Curricular', 'Workshop', 'Internship', 'Project', 'Other'];
    const categoryStats = await Promise.all(categories.map(async (cat) => {
      const count = await Activity.countDocuments({ category: cat });
      return { name: cat, value: count };
    }));
    
    res.json({ 
      pendingCount, 
      approvedCount, 
      rejectedCount,
      categoryStats: categoryStats.filter(c => c.value > 0)
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dashboard stats', error: error.message });
  }
};

exports.getMentees = async (req, res) => {
  try {
    const mentees = await User.find({ mentor: req.user.id, role: 'student' })
      .select('name email studentId department phone');
    res.json(mentees);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching mentees', error: error.message });
  }
};
