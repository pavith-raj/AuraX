const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController'); // Import functions
const { protect } = require('../middleware/authMiddleware'); 

// POST /register route
router.post('/register', register);

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

module.exports = router;
