const User = require('../models/User');
const Activity = require('../models/Activity');
const AuditLog = require('../models/Log');

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

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .populate('mentor', 'name email');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
};

exports.repairMentorships = async (req, res) => {
  try {
    const students = await User.find({ role: 'student', mentor: null });
    const faculty = await User.find({ role: 'faculty' });
    
    let repairedCount = 0;
    
    for (const student of students) {
      if (!student.department) continue;
      
      const deptFaculty = faculty.filter(f => f.department === student.department);
      if (deptFaculty.length > 0) {
        // Simple Load Balancing: find faculty with fewest mentees
        const facultyWithLoad = await Promise.all(deptFaculty.map(async (f) => {
          const count = await User.countDocuments({ mentor: f._id });
          return { id: f._id, count };
        }));
        
        facultyWithLoad.sort((a, b) => a.count - b.count);
        student.mentor = facultyWithLoad[0].id;
        await student.save();
        repairedCount++;
      }
    }
    
    await logAction(req.user.id, 'repair_mentorships', `Repaired ${repairedCount} student-mentor links`, req);
    
    res.json({ message: `Successfully repaired ${repairedCount} mentorship links.`, repairedCount });
  } catch (error) {
    res.status(500).json({ message: 'Repair failed', error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
};

exports.getAnalytics = async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalActivities = await Activity.countDocuments();
    const approvedActivities = await Activity.countDocuments({ status: 'approved' });
    
    // Monthly participation (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlyData = await Activity.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      { $group: {
        _id: { $month: "$createdAt" },
        count: { $sum: 1 }
      }},
      { $sort: { "_id": 1 } }
    ]);

    // Category distribution
    const categoryData = await Activity.aggregate([
      { $group: {
        _id: "$category",
        count: { $sum: 1 }
      }}
    ]);

    res.json({
      totalStudents,
      totalActivities,
      approvalRate: totalActivities > 0 ? (approvedActivities / totalActivities * 100).toFixed(2) : 0,
      monthlyParticipation: monthlyData,
      categoryDistribution: categoryData
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching analytics', error: error.message });
  }
};

exports.getLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find().populate('userId', 'name email role').sort({ timestamp: -1 }).limit(100);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching logs', error: error.message });
  }
};
