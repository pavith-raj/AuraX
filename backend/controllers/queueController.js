const QueueEntry = require('../models/queue');
const User = require('../models/user'); // Added missing import for User

// Get current queue for a salon
exports.getQueue = async (req, res) => {
  try {
    const { salonId } = req.params;
    const queue = await QueueEntry.find({ salonId: String(salonId) }).sort({ joinedAt: 1 });
    // Convert userId to string for all entries
    const queueWithStringUserId = queue.map(entry => ({
      ...entry.toObject(),
      userId: entry.userId ? String(entry.userId) : null,
    }));
    console.log('[getQueue] salonId:', salonId, 'queue:', queueWithStringUserId);
    res.json({ success: true, queue: queueWithStringUserId });
  } catch (err) {
    console.error('[getQueue] Error:', err);
    res.status(500).json({ success: false, message: 'Failed to get queue' });
  }
};

// User joins the queue
exports.joinQueue = async (req, res) => {
  try {
    const { salonId } = req.params;
    const userId = String(req.user._id);
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    // Prevent duplicate join
    const existing = await QueueEntry.findOne({ salonId: String(salonId), userId });
    if (existing) return res.status(400).json({ success: false, message: 'Already in queue' });
    const entry = new QueueEntry({
      salonId: String(salonId),
      userId,
      name: user.name,
      joinedAt: new Date(),
    });
    await entry.save();
    res.json({ success: true, entry: { ...entry.toObject(), userId } });
  } catch (err) {
    console.error('[joinQueue] Error:', err);
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
    const entry = new QueueEntry({
      salonId: String(salonId),
      name,
      userId: null,
      joinedAt: new Date(),
    });
    await entry.save();
    const queue = await QueueEntry.find({ salonId: String(salonId) }).sort({ joinedAt: 1 });
    const queueWithStringUserId = queue.map(entry => ({
      ...entry.toObject(),
      userId: entry.userId ? String(entry.userId) : null,
    }));
    console.log('[addOfflineWalkIn] salonId:', salonId, 'queue after add:', queueWithStringUserId);
    res.json({ success: true, entry: { ...entry.toObject(), userId: null }, queue: queueWithStringUserId });
  } catch (err) {
    console.error('[addOfflineWalkIn] Error:', err);
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

// Get current user's queue status across all salons
exports.getMyQueueStatus = async (req, res) => {
  try {
    const userId = String(req.user._id);
    console.log('[getMyQueueStatus] userId:', userId);
    const entries = await QueueEntry.find({ userId }).sort({ joinedAt: 1 });
    console.log('[getMyQueueStatus] entries:', entries);
    const entriesWithStringUserId = entries.map(entry => ({
      ...entry.toObject(),
      userId: entry.userId ? String(entry.userId) : null,
    }));
    res.json({ success: true, entries: entriesWithStringUserId });
  } catch (err) {
    console.error('[getMyQueueStatus] Error:', err);
    res.status(500).json({ success: false, message: 'Failed to get queue status' });
  }
};

// Get queue count for a salon
exports.getQueueCount = async (req, res) => {
  try {
    const { salonId } = req.params;
    const count = await QueueEntry.countDocuments({ salonId: String(salonId) });
    res.json({ success: true, count });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to get queue count' });
  }
}; 