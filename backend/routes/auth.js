const express = require('express');
const router = express.Router();
const { register, registerSalonOwner,login, updateUserProfile } = require('../controllers/authController'); // Import functions
const { protect } = require('../middleware/authMiddleware'); 
const { authorizeRoles } = require('../middleware/roleMiddleware');

// POST /register route
router.post('/register', register);

// SalonOwner route
router.post('/register-salon', registerSalonOwner);

// POST /login route
router.post('/login', login);

// 🛡️ Protected route
router.get('/profile', protect, async (req, res) => {
    try {
        res.status(200).json({ 
            message: 'Profile accessed', 
            user: req.user 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// 🛡️ Protected route for PUT profile (Update profile)

router.put('/profile', protect, updateUserProfile);

// 🛡️ Admin-only route
router.get('/adminonly', protect, authorizeRoles('admin'), (req, res) => {
    res.status(200).json({ message: 'Welcome Admin!' });
});

// 🛡️ Owner-only route
router.get('/owneronly', protect, authorizeRoles('owner'), (req, res) => {
    res.status(200).json({ message: 'Welcome Salon Owner!' });
});

module.exports = router;
