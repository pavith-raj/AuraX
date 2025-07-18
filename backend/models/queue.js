const mongoose = require('mongoose');

const queueEntrySchema = new mongoose.Schema({
  salonId: { type: String, required: true },
  userId: { type: String, default: null }, // null for offline walk-ins
  name: { type: String, required: true },
  joinedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('QueueEntry', queueEntrySchema); 