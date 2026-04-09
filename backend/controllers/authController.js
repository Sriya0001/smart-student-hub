const jwt = require('jsonwebtoken');
const User = require('../models/User');
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

exports.signup = async (req, res) => {
  try {
    const { name, email, password, role, department, college, phone, adminCode } = req.body;

    if (role === 'admin') {
      const correctCode = process.env.ADMIN_SECRET_CODE;
      if (!correctCode || adminCode !== correctCode) {
        return res.status(403).json({ message: 'Invalid admin registration code.' });
      }
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const user = new User({
      name,
      email,
      password,
      role: role || 'student',
      department,
      college,
      phone
    });

    // Least-Load Assignment Logic for Students
    if (user.role === 'student' && department) {
      const facultyInDept = await User.find({ role: 'faculty', department });
      
      if (facultyInDept.length > 0) {
        // Calculate load for each faculty
        const facultyWithLoad = await Promise.all(facultyInDept.map(async (f) => {
          const count = await User.countDocuments({ mentor: f._id });
          return { id: f._id, count };
        }));

        // Sort by count and pick the one with the lowest load
        facultyWithLoad.sort((a, b) => a.count - b.count);
        user.mentor = facultyWithLoad[0].id;
      }
    }

    await user.save();
    
    await logAction(user._id, 'signup', `User signed up as ${user.role}`, req);

    res.status(201).json({ 
      message: 'User created successfully', 
      user: { id: user._id, name, email, role: user.role, mentor: user.mentor } 
    });
  } catch (error) {
    res.status(500).json({ message: 'Signup error', error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const payload = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });

    await logAction(user._id, 'login', 'User logged in successfully', req);

    res.json({ 
      token, 
      user: { 
        id: user._id,
        name: user.name, 
        email: user.email, 
        role: user.role,
        department: user.department 
      } 
    });
  } catch (error) {
    res.status(500).json({ message: 'Login error', error: error.message });
  }
};

exports.logout = async (req, res) => {
  // Client-side logout handles token removal, but we can log it if we have a token
  if (req.user) {
    await logAction(req.user.id, 'logout', 'User logged out', req);
  }
  res.json({ message: 'Logged out successfully' });
};
