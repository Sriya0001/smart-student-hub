const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  content: { type: String, required: true },
  priority: { 
    type: String, 
    enum: ['Low', 'Medium', 'High'], 
    default: 'Medium' 
  },
  targetDepartment: { 
    type: String, 
    default: 'All',
    trim: true
  },
  author: { type: String, required: true },
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// Index for faster retrieval by department and date
noticeSchema.index({ targetDepartment: 1, createdAt: -1 });

module.exports = mongoose.model('Notice', noticeSchema);
