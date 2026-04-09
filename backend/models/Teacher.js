const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
  teacherId: { 
    type: String, 
    unique: true, 
    default: () => 'T' + Date.now().toString() + Math.floor(Math.random() * 1000) 
  },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phoneNumber: String,
  department: String,
  college: String,
  designation: String,
  experience: Number
}, { timestamps: true });

/* Removed pre-save hook */

module.exports = mongoose.model('Teacher', teacherSchema);
