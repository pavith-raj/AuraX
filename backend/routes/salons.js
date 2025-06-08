const express = require('express');
const router = express.Router();
const Salon = require('../models/salon'); 

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

module.exports = router;