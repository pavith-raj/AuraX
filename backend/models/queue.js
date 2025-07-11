const mongoose = require('mongoose');

const queueEntrySchema = new mongoose.Schema({
  salonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Salon', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // null for offline walk-ins
  name: { type: String, required: true },
  joinedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('QueueEntry', queueEntrySchema); 