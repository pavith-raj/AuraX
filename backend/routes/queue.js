const express = require('express');
const router = express.Router();
const queueController = require('../controllers/queueController');
const { authenticate } = require('../middleware/authMiddleware');

// Get current queue for a salon
router.get('/:salonId', queueController.getQueue);

// User joins the queue
router.post('/:salonId/join', authenticate, queueController.joinQueue);

// User leaves the queue
router.post('/:salonId/leave', authenticate, queueController.leaveQueue);

// Owner adds an offline walk-in
router.post('/:salonId/add-offline', authenticate, queueController.addOfflineWalkIn);

// Remove/serve a queue entry (owner only)
router.delete('/:salonId/:entryId', authenticate, queueController.removeEntry);

module.exports = router; 