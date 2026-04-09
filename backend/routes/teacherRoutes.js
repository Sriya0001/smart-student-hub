const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacherController');
const authMiddleware = require('../middleware/authMiddleware');
const { auditLogger } = require('../middleware/auditLogger');

// Private faculty/teacher routes
router.use(authMiddleware(['faculty', 'admin']));

router.get('/activities/pending', teacherController.getPendingActivities);
router.get('/activities/history', teacherController.getReviewHistory);
router.put('/activities/:id/review', auditLogger('REVIEWED_ACTIVITY'), teacherController.reviewActivity);
router.post('/activities/:id/undo', auditLogger('UNDO_REVIEW_ACTIVITY'), teacherController.undoReview);
router.post('/activities/bulk-review', auditLogger('BULK_REVIEW_ACTIVITIES'), teacherController.bulkReview);
router.get('/stats', teacherController.getFacultyDashboardStats);
router.get('/mentees', teacherController.getMentees);

module.exports = router;
