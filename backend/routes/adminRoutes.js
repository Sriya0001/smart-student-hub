const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const { auditLogger } = require('../middleware/auditLogger');

// Protect all routes with authMiddleware for 'admin' role
router.use(authMiddleware('admin'));

router.get('/users', adminController.getAllUsers);
router.delete('/users/:id', auditLogger('DELETED_USER'), adminController.deleteUser);
router.get('/analytics', adminController.getAnalytics);
router.get('/logs', adminController.getLogs); // They already had a /logs endpoint it seems, but now it will use our improved Audit Log or their original Log schema.
router.post('/mentorships/repair', auditLogger('REPAIRED_MENTORSHIPS'), adminController.repairMentorships);

module.exports = router;
