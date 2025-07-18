const express = require('express');
const router = express.Router();
const queueController = require('../controllers/queueController');
console.log('queueController:', queueController); // DEBUG: Check imported functions
const { protect } = require('../middleware/authMiddleware');

// Get current user's queue status across all salons
router.get('/my', protect, queueController.getMyQueueStatus);

// Get current queue for a salon
router.get('/:salonId', queueController.getQueue);

// Get queue count for a salon
router.get('/:salonId/count', queueController.getQueueCount);

// User joins the queue
router.post('/:salonId/join', protect, queueController.joinQueue);

// User leaves the queue
router.post('/:salonId/leave', protect, queueController.leaveQueue);

// Owner adds an offline walk-in
router.post('/:salonId/add-offline', protect, queueController.addOfflineWalkIn);

// Remove/serve a queue entry (owner only)
router.delete('/:salonId/:entryId', protect, queueController.removeEntry);

module.exports = router; 