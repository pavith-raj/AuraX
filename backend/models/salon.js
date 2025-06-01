const mongoose = require('mongoose');

const salonSchema = new mongoose.Schema({
  name: String,
  rating: Number,
  address: String,
  imageUrl: String,
  services: [String],
});

module.exports = mongoose.model('Salon', salonSchema);
