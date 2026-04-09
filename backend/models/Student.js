const mongoose = require('mongoose');
const mongooseFieldEncryption = require('mongoose-field-encryption').fieldEncryption;

const certificateSchema = new mongoose.Schema({
  name: String,
  image: String,
  url: String,
  date: Date,
  category: String,
  issuer: String
});

const academicCertificateSchema = new mongoose.Schema({
  domain: String,
  certificateName: String,
  image: String,
  certificateUrl: String,
  date: Date,
  issuedBy: String,
  description: String,
  skills: [String],
  duration: String,
  location: String,
  organizationType: String,
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  feedback: String,
  submittedAt: { type: Date, default: Date.now },
  reviewedAt: Date
});

const projectSchema = new mongoose.Schema({
  title: String,
  description: String,
  githubUrl: String,
  deploymentUrl: String,
  technologies: [String]
});

const marksSchema = new mongoose.Schema({
  semester: Number,
  sgpa: Number,
  subjects: [{ name: String, grade: String, marks: Number }]
});

const studentSchema = new mongoose.Schema({
  studentId: { 
    type: String, 
    unique: true, 
    default: () => 'S' + Date.now().toString() + Math.floor(Math.random() * 1000) 
  },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  college: String,
  department: String,
  year: Number,
  semester: Number,
  rollNumber: { type: String, unique: true, sparse: true },
  profile: {
    profileImage: String,
    aadharNumber: String,
    mobileNumber: String,
    bio: String
  },
  personalCertificates: [certificateSchema],
  academicCertificates: [academicCertificateSchema],
  projects: [projectSchema],
  skills: mongoose.Schema.Types.Mixed,
  semesterMarks: [marksSchema],
  cgpa: Number
}, { timestamps: true });

/* Removed pre-save hook in favor of schema default */

// Cloud Security: Field Level Encryption (Simulates KMS Data-at-Rest protection)
// In production, ENCRYPTION_KEY should be fetched from AWS KMS or injected via secure env
studentSchema.plugin(mongooseFieldEncryption, { 
    // Encrypting the entire profile block so PII (Aadhar, Mobile) is never stored in plain text
    fields: ['profile'], 
    secret: process.env.ENCRYPTION_KEY || 'default-dev-encryption-key-must-change-in-prod-123456789123456789'
});

module.exports = mongoose.model('Student', studentSchema);
