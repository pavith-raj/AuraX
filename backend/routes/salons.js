const express = require('express');
const router = express.Router();
const Salon = require('../models/salon');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

// fetch all salons from api/salons
router.get('/', async (req, res) => {
    try {
        const salons = await Salon.find();
        res.json(salons);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const salon = await Salon.findById(req.params.id);
        if (!salon) {
            return res.status(404).json({ error: 'Salon not found' });
        }
        res.json(salon);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update salon profile
router.put('/:id', protect, authorizeRoles('owner'), async (req, res) => {
    try {
        console.log('PUT /api/salons/:id called');
        console.log('req.params.id:', req.params.id);
        console.log('req.body:', req.body);
        console.log('req.user:', req.user);
        const { salonName, salonAddress, phone, openingTime, closingTime, profileImage } = req.body;
        
        const salon = await Salon.findById(req.params.id);
        if (!salon) {
            return res.status(404).json({ error: 'Salon not found' });
        }

        // Only allow the owner to update their own salon
        if (String(salon._id) !== String(req.user._id)) {
            return res.status(403).json({ error: 'Forbidden: You can only update your own salon' });
        }

        // Update fields
        if (salonName) salon.salonName = salonName;
        if (salonAddress) salon.salonAddress = salonAddress;
        if (phone) salon.phone = phone;
        if (openingTime) salon.openingTime = openingTime;
        if (closingTime) salon.closingTime = closingTime;
        if (profileImage) salon.profileImage = profileImage;

        await salon.save();
        res.json(salon);
    } catch (err) {
        console.error('Error in PUT /api/salons/:id:', err);
        res.status(500).json({ error: err.message || 'Internal server error' });
    }
});

module.exports = router;