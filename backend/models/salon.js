const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');


const ServiceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number }, // optional
  duration: { type: String }, // e.g. "30 min"
  description: { type: String }
});

const salonSchema = new mongoose.Schema({
  // Authentication fields
  name: { type: String, required: true }, // Owner's name
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },

  // Salon details
  salonName: { type: String, required: true },
  salonAddress: { type: String, required: true },
  location: {
    lat: { type: Number },
    lng: { type: Number }
  },
  services: [ServiceSchema], // Initial list, can be empty
  rating: { type: Number, default: 0 },
  openingTime: { type: String, default: '9:00 AM' },
  closingTime: { type: String, default: '8:00 PM' },

  // Other fields
  role: { type: String, default: 'owner' },
  isApproved: { type: Boolean, default: false },
  profileImage: { type: String, default: '' }
});

// Hash password before saving
salonSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Password comparison method
salonSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};




module.exports = mongoose.model('Salon', salonSchema);