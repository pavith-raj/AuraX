const mongoose = require('mongoose');

// Create the User Schema
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true, // email must be unique
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['user', 'owner', 'admin'], // Only these 3 roles allowed
        default: 'user',
    }
}, { timestamps: true }); // Automatically adds createdAt and updatedAt fields

// Export the model
module.exports = mongoose.model('User', userSchema);
