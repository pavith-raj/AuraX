const express = require('express');
const router = express.Router();
const Appointment = require('../models/appointment');

// Helper: Define working hours and slot duration
const WORKING_HOURS = [
  '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'
];

// Endpoint: Get available slots for a date and salon
router.get('/available-slots', async (req, res) => {
  try {
    const { date, salonId } = req.query;
    if (!date || !salonId) {
      return res.status(400).json({ error: 'date and salonId are required' });
    }
    const booked = await Appointment.find({ date, salonId, status: { $ne: 'Cancelled' } }).select('time');
    const bookedTimes = booked.map(a => a.time);
    const available = WORKING_HOURS.filter(slot => !bookedTimes.includes(slot));
    res.json({ available });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Book an appointment (with slot check)
router.post('/', async (req, res) => {
  try {
    const { date, time, salonId } = req.body;
    // Check if slot is already taken
    const isTaken = await Appointment.findOne({ date, time, salonId, status: { $ne: 'Cancelled' } });
    if (isTaken) {
      return res.status(409).json({ error: 'Slot not available' });
    }
    const appointment = new Appointment(req.body);
    await appointment.save();
    res.status(201).json(appointment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all appointments for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const appointments = await Appointment.find({ userId: req.params.userId });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Cancel an appointment
router.put('/:id/cancel', async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status: 'Cancelled' },
      { new: true }
    );
    res.json(appointment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all appointments for a salon (owner view)
router.get('/salon/:salonId', async (req, res) => {
  try {
    const appointments = await Appointment.find({ salonId: req.params.salonId });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update appointment status (e.g., mark as completed)
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    res.json(appointment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get today's bookings count for a salon
router.get('/salon/:salonId/today-count', async (req, res) => {
  try {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const todayStr = `${yyyy}-${mm}-${dd}`;
    const count = await Appointment.countDocuments({ salonId: req.params.salonId, date: todayStr, status: { $ne: 'Cancelled' } });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get bookings count per date for a salon (for calendar)
router.get('/salon/:salonId/date-counts', async (req, res) => {
  try {
    const appointments = await Appointment.find({ salonId: req.params.salonId, status: { $ne: 'Cancelled' } }).select('date');
    const dateCounts = {};
    appointments.forEach(a => {
      dateCounts[a.date] = (dateCounts[a.date] || 0) + 1;
    });
    res.json({ dateCounts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;