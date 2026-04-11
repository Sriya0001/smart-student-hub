const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  category: { 
    type: String, 
    required: true,
    enum: ['Academic', 'Co-Curricular', 'Extra-Curricular', 'Workshop', 'Internship', 'Project', 'Other']
  },
  description: { type: String, trim: true },
  date: { type: Date, required: true },
  fileUrl: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'], 
    default: 'pending' 
  },
  remarks: { type: String },
  hash: { type: String }, // For activity integrity
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Activity', activitySchema);
