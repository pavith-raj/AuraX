const QueueEntry = require('../models/queue');

// Get current queue for a salon
exports.getQueue = async (req, res) => {
  try {
    const { salonId } = req.params;
    const queue = await QueueEntry.find({ salonId }).sort({ joinedAt: 1 });
    res.json({ success: true, queue });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to get queue' });
  }
};

// User joins the queue
exports.joinQueue = async (req, res) => {
  try {
    const { salonId } = req.params;
    const userId = req.user._id;
    const name = req.user.name || 'Customer';
    // Prevent duplicate
    const alreadyInQueue = await QueueEntry.findOne({ salonId, userId });
    if (alreadyInQueue) {
      return res.status(400).json({ success: false, message: 'Already in queue' });
    }
    const entry = await QueueEntry.create({ salonId, userId, name });
    res.json({ success: true, entry });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to join queue' });
  }
};

// User leaves the queue
exports.leaveQueue = async (req, res) => {
  try {
    const { salonId } = req.params;
    const userId = req.user._id;
    await QueueEntry.deleteOne({ salonId, userId });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to leave queue' });
  }
};

// Owner adds an offline walk-in
exports.addOfflineWalkIn = async (req, res) => {
  try {
    const { salonId } = req.params;
    const { name } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Name required' });
    const entry = await QueueEntry.create({ salonId, name });
    res.json({ success: true, entry });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to add walk-in' });
  }
};

// Remove/serve a queue entry
exports.removeEntry = async (req, res) => {
  try {
    const { salonId, entryId } = req.params;
    await QueueEntry.deleteOne({ _id: entryId, salonId });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to remove entry' });
  }
}; 