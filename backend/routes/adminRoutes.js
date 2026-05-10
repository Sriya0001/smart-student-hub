const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const { auditLogger } = require('../middleware/auditLogger');

// Protect all routes with authMiddleware for 'admin' role
router.use(authMiddleware('admin'));

router.get('/users', adminController.getAllUsers);
router.post('/users/faculty', auditLogger('CREATED_FACULTY'), adminController.createFaculty);
router.delete('/users/:id', auditLogger('DELETED_USER'), adminController.deleteUser);
router.delete('/activities/:id', auditLogger('DELETED_ACTIVITY'), adminController.deleteActivity);
router.get('/analytics', adminController.getAnalytics);
router.get('/logs', adminController.getLogs);
router.post('/mentorships/repair', auditLogger('REPAIRED_MENTORSHIPS'), adminController.repairMentorships);

// Notice Management
router.get('/notices', adminController.getAllNotices);
router.post('/notices', auditLogger('POSTED_NOTICE'), adminController.createNotice);
router.delete('/notices/:id', auditLogger('DELETED_NOTICE'), adminController.deleteNotice);

module.exports = router;
