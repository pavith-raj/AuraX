const User = require('../models/user');
const Salon = require('../models/salon');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// REGISTER Controller
exports.register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        // Create new user
        const user = new User({
            name,
            email,
            password,
            role
        });

        // Save user
        await user.save();
        res.status(201).json({ message: 'User registered successfully' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// SALON OWNER REGISTER Controller
exports.registerSalonOwner = async (req, res) => {
  try {
    const {
      name, email, password, phone,
      salonName, salonAddress, location, services
    } = req.body;

    // Check if email already exists in salons
    const existingSalon = await Salon.findOne({ email });
    if (existingSalon) return res.status(400).json({ error: 'Salon already exists' });

    const salon = new Salon({
      name,
      email,
      password,
      phone,
      salonName,
      salonAddress,
      location,
      services,
      // rating, role, isApproved use defaults
    });

    await salon.save();
    res.status(201).json({ message: 'Salon owner registered successfully', salon });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// LOGIN Controller
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Try to find user
    let user = await User.findOne({ email });
    if (user && await user.comparePassword(password)) {
      const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );
      return res.status(200).json({
        message: 'Login successful',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    }

    // Try to find salon
    let salon = await Salon.findOne({ email });
    if (salon && await salon.comparePassword(password)) {
      const token = jwt.sign(
        { id: salon._id, role: salon.role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );
      return res.status(200).json({
        message: 'Login successful',
        token,
        salon: {
          id: salon._id,
          name: salon.name,
          email: salon.email,
          role: salon.role,
          salonName: salon.salonName,
          salonAddress: salon.salonAddress,
          phone: salon.phone
        }
      });
    }

    return res.status(401).json({ message: 'Invalid email or password' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};


// UPDATE PROFILE Controller
exports.updateUserProfile = async (req, res) => {
    try {
        const { name, email, phone } = req.body; // Get updated fields from request body
        const userId = req.user.id;        // Get user ID from the JWT token

        // Find the user by ID
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update the user's profile fields
        if (name) user.name = name;
        if (email) user.email = email;
        if (phone !== undefined) user.phone = phone;


        // Save the updated user to the database
        await user.save();

        // Respond with the updated user data
        res.status(200).json({
            message: 'Profile updated successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};