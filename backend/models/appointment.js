const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  salonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Salon', required: true },
  service: { type: String, required: true },
  serviceName: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  stylist: { type: String },
  notes: { type: String },
  status: { type: String, default: 'Scheduled' }, // Scheduled, Completed, Cancelled
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);