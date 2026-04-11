const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

// Use memory storage for cloud readiness (we will upload the buffer directly to S3)
const storage = multer.memoryStorage();

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /pdf|jpg|jpeg|png/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Error: File upload only supports PDF/JPG/PNG!'));
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Private student routes
router.use(authMiddleware('student'));
router.get('/profile', studentController.getProfile);
router.put('/profile', studentController.updateProfile);
router.post('/change-password', studentController.changePassword);
router.post('/upload', upload.single('certificate'), studentController.uploadActivity);
router.get('/my', studentController.getMyActivities);
router.get('/stats', studentController.getStats);
router.get('/view-file', studentController.getFileViewUrl);
router.get('/notifications', studentController.getNotifications);
router.put('/notifications/read', studentController.markNotificationsRead);

module.exports = router;
