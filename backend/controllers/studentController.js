const User = require('../models/User');
const Activity = require('../models/Activity');
const AuditLog = require('../models/Log');
const Notification = require('../models/Notification');
const crypto = require('crypto');
const { PutObjectCommand } = require('@aws-sdk/client-s3');
const { s3Client } = require('../utils/s3Service');
const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'student-records-bucket';

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

// Helper for activity hash (Hashing actual file content buffer)
const generateFileHash = (fileBuffer) => {
  try {
    return crypto.createHash('sha256').update(fileBuffer).digest('hex');
  } catch (err) {
    console.error('Hash generation failed:', err.message);
    return null;
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('mentor', 'name email department phone');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const updates = req.body;
    // Don't allow role updates via profile update
    delete updates.role;
    delete updates.password;
    
    const user = await User.findByIdAndUpdate(req.user.id, { $set: updates }, { new: true }).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.uploadActivity = async (req, res) => {
  try {
    const { title, category, description, date } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ message: 'Certificate file is required' });
    }

    const fileExtension = req.file.originalname.split('.').pop();
    const fileName = `certificates/${Date.now()}-${Math.floor(Math.random() * 1000)}.${fileExtension}`;
    
    // Cloud Security: Direct to S3 Upload
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileName,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    });
    await s3Client.send(command);

    // Instead of local path, we store the S3 Key (fileName)
    const fileUrl = fileName; 
    
    // Generate hash for file integrity (SHA-256) using in-memory buffer
    const hash = generateFileHash(req.file.buffer);
    
    const activity = new Activity({
      studentId: req.user.id,
      title,
      category,
      description,
      date,
      fileUrl,
      status: 'pending',
      hash
    });

    await activity.save();
    
    await logAction(req.user.id, 'upload_activity', `Uploaded activity: ${title}`, req);

    res.status(201).json({ message: 'Activity uploaded successfully', activity });
  } catch (error) {
    res.status(500).json({ message: 'Error uploading activity', error: error.message });
  }
};

exports.getMyActivities = async (req, res) => {
  try {
    const activities = await Activity.find({ studentId: req.user.id }).sort({ createdAt: -1 });
    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching activities', error: error.message });
  }
};

exports.getStats = async (req, res) => {
  try {
    const total = await Activity.countDocuments({ studentId: req.user.id });
    const approved = await Activity.countDocuments({ studentId: req.user.id, status: 'approved' });
    const pending = await Activity.countDocuments({ studentId: req.user.id, status: 'pending' });
    const rejected = await Activity.countDocuments({ studentId: req.user.id, status: 'rejected' });

    res.json({ total, approved, pending, rejected });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stats', error: error.message });
  }
};

exports.getFileViewUrl = async (req, res) => {
  try {
    const { key } = req.query;
    if (!key) return res.status(400).json({ message: 'File key is required' });
    const { generateDownloadUrl } = require('../utils/s3Service');
    const url = await generateDownloadUrl(key);
    res.json({ url });
  } catch (error) {
    res.status(500).json({ message: 'Error generating view URL', error: error.message });
  }
};

// Fetch all notifications for the logged-in student (newest first)
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(30);
    const unreadCount = notifications.filter(n => !n.read).length;
    res.json({ notifications, unreadCount });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notifications', error: error.message });
  }
};

// Mark all unread notifications as read for the logged-in student
exports.markNotificationsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user.id, read: false },
      { $set: { read: true } }
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating notifications', error: error.message });
  }
};
