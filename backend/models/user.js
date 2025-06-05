const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Create the User Schema
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true, 
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['user'], 
        default: 'user',
    },
    phone: { 
        type: String, 
        default: '' }, 
        
}, { timestamps: true }); // Automatically adds createdAt and updatedAt fields

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// Password comparison method
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};
// Export the model
module.exports = mongoose.model('User', userSchema);
