const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  adminId: { 
    type: String, 
    unique: true, 
    default: () => 'A' + Date.now().toString() + Math.floor(Math.random() * 1000) 
  },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'admin' },
  institution: String,
  department: String
}, { timestamps: true });

/* Removed pre-save hook */

module.exports = mongoose.model('Admin', adminSchema);
