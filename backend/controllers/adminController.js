const User = require('../models/User');
const Activity = require('../models/Activity');
const AuditLog = require('../models/Log');
const Notification = require('../models/Notification');

const { logAction } = require('../utils/audit');

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
    const students = await User.find({ role: 'student' }); // Include all students for rebalancing
    const faculty = await User.find({ role: 'faculty' });
    
    let repairedCount = 0;
    
    // Group faculty by department for efficiency
    const facultyByDept = faculty.reduce((acc, f) => {
      if (!acc[f.department]) acc[f.department] = [];
      acc[f.department].push(f);
      return acc;
    }, {});

    for (const student of students) {
      if (!student.department) continue;
      
      const deptFaculty = facultyByDept[student.department];
      if (deptFaculty && deptFaculty.length > 0) {
        // Find faculty with FEWEST mentees in this department
        const facultyWithLoad = await Promise.all(deptFaculty.map(async (f) => {
          const count = await User.countDocuments({ mentor: f._id });
          return { id: f._id, count };
        }));
        
        facultyWithLoad.sort((a, b) => a.count - b.count);
        const bestMentorId = facultyWithLoad[0].id;

        // Only update if it actually changes the mentor (to avoid unnecessary saves)
        if (!student.mentor || student.mentor.toString() !== bestMentorId.toString()) {
          student.mentor = bestMentorId;
          await student.save();
          repairedCount++;
        }
      }
    }
    
    await logAction(req, {
      action: 'rebalance_mentorships',
      actorRole: 'admin',
      actorId: req.user.id,
      actorName: 'Admin', // Could be req.user.name if available
      detail: `Rebalanced ${repairedCount} student-mentor links`
    });
    
    res.json({ message: `Successfully rebalanced ${repairedCount} mentorship links for fair distribution.`, repairedCount });
  } catch (error) {
    res.status(500).json({ message: 'Repair/Rebalance failed', error: error.message });
  }
};

exports.createFaculty = async (req, res) => {
  try {
    const { name, email, password, department, college, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required.' });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'A user with this email already exists.' });

    const faculty = new User({ name, email, password, role: 'faculty', department, college, phone });
    await faculty.save();

    await logAction(req, {
      action: 'create_faculty',
      actorRole: 'admin',
      actorId: req.user.id,
      actorName: 'Admin',
      targetType: 'faculty',
      targetId: faculty._id,
      targetName: email,
      detail: `Admin created faculty account for ${email}`
    });

    res.status(201).json({ message: 'Faculty account created successfully.', user: { id: faculty._id, name, email, role: 'faculty', department } });
  } catch (error) {
    res.status(500).json({ message: 'Error creating faculty account', error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.role === 'student') {
      // Cascade: remove all their activities and notifications
      await Activity.deleteMany({ studentId: user._id });
      await Notification.deleteMany({ userId: user._id });
    } else if (user.role === 'faculty') {
      // Cascade: unassign this faculty from all their mentees
      await User.updateMany({ mentor: user._id }, { $unset: { mentor: '' } });
    }

    await User.findByIdAndDelete(req.params.id);
    await logAction(req, {
      action: 'delete_user',
      actorRole: 'admin',
      actorId: req.user.id,
      actorName: 'Admin',
      targetType: user.role,
      targetId: user._id,
      targetName: user.email,
      detail: `Deleted ${user.role} account: ${user.email}`
    });
    res.json({ message: 'User and all associated data deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
};

exports.deleteActivity = async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);
    if (!activity) return res.status(404).json({ message: 'Activity not found' });

    await Activity.findByIdAndDelete(req.params.id);
    await Notification.deleteMany({ activityId: req.params.id });
    await logAction(req, {
      action: 'delete_activity',
      actorRole: 'admin',
      actorId: req.user.id,
      actorName: 'Admin',
      targetType: 'activity',
      targetId: activity._id,
      targetName: activity.title,
      detail: `Admin deleted activity: ${activity.title}`
    });
    res.json({ message: 'Activity and associated notifications deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting activity', error: error.message });
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
    const logs = await AuditLog.find().populate('actorId', 'name email role').sort({ timestamp: -1 }).limit(100);

    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching logs', error: error.message });
  }
};
