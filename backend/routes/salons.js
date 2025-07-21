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

// Add a service
router.post('/:salonId/services', async (req, res) => {
  try {
    console.log('POST /:salonId/services', req.params.salonId, req.body);
    const { name, price, duration, description } = req.body;
    const salon = await Salon.findById(req.params.salonId);
    console.log('Salon found:', salon ? salon._id : null);
    if (!salon) return res.status(404).json({ message: 'Salon not found' });
    salon.services.push({ name, price, duration, description });
    await salon.save();
    res.json({ services: salon.services });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Edit a service
router.put('/:salonId/services/:serviceId', async (req, res) => {
  try {
    const { name, price, duration, description } = req.body;
    const salon = await Salon.findById(req.params.salonId);
    if (!salon) return res.status(404).json({ message: 'Salon not found' });
    const service = salon.services.id(req.params.serviceId);
    if (!service) return res.status(404).json({ message: 'Service not found' });
    if (name !== undefined) service.name = name;
    if (price !== undefined) service.price = price;
    if (duration !== undefined) service.duration = duration;
    if (description !== undefined) service.description = description;
    await salon.save();
    res.json({ services: salon.services });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete a service
router.delete('/:salonId/services/:serviceId', async (req, res) => {
  try {
    const salon = await Salon.findById(req.params.salonId);
    if (!salon) return res.status(404).json({ message: 'Salon not found' });
    salon.services.id(req.params.serviceId).remove();
    await salon.save();
    res.json({ services: salon.services });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add a gallery image to the salon
router.post('/:id/gallery', protect, authorizeRoles('owner'), async (req, res) => {
    try {
        const { imageUrl } = req.body;
        if (!imageUrl) return res.status(400).json({ error: 'imageUrl is required' });
        const salon = await Salon.findById(req.params.id);
        if (!salon) return res.status(404).json({ error: 'Salon not found' });
        if (String(salon._id) !== String(req.user._id)) {
            return res.status(403).json({ error: 'Forbidden: You can only update your own salon' });
        }
        salon.galleryImages.push(imageUrl);
        await salon.save();
        res.json({ galleryImages: salon.galleryImages });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Remove a gallery image from the salon
router.delete('/:id/gallery', protect, authorizeRoles('owner'), async (req, res) => {
    try {
        const { imageUrl } = req.body;
        if (!imageUrl) return res.status(400).json({ error: 'imageUrl is required' });
        const salon = await Salon.findById(req.params.id);
        if (!salon) return res.status(404).json({ error: 'Salon not found' });
        if (String(salon._id) !== String(req.user._id)) {
            return res.status(403).json({ error: 'Forbidden: You can only update your own salon' });
        }
        salon.galleryImages = salon.galleryImages.filter(url => url !== imageUrl);
        await salon.save();
        res.json({ galleryImages: salon.galleryImages });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add a review to a salon
router.post('/:id/reviews', protect, async (req, res) => {
    try {
        const { rating, text, images } = req.body;
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ error: 'Rating must be between 1 and 5' });
        }
        const salon = await Salon.findById(req.params.id);
        if (!salon) return res.status(404).json({ error: 'Salon not found' });
        const review = {
            userId: req.user._id,
            userName: req.user.name,
            rating,
            text,
            images: images || [],
            createdAt: new Date()
        };
        salon.reviews.push(review);
        // Update average rating
        const ratings = salon.reviews.map(r => r.rating);
        salon.rating = ratings.reduce((a, b) => a + b, 0) / ratings.length;
        await salon.save();
        res.status(201).json({ success: true, review });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all reviews for a salon
router.get('/:id/reviews', async (req, res) => {
    try {
        const salon = await Salon.findById(req.params.id);
        if (!salon) return res.status(404).json({ error: 'Salon not found' });
        res.json(salon.reviews || []);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Edit a review
router.put('/:salonId/reviews/:reviewId', protect, async (req, res) => {
    try {
        const { rating, text, images } = req.body;
        const salon = await Salon.findById(req.params.salonId);
        if (!salon) return res.status(404).json({ error: 'Salon not found' });
        const review = salon.reviews.id(req.params.reviewId);
        if (!review) return res.status(404).json({ error: 'Review not found' });
        if (String(review.userId) !== String(req.user._id)) {
            return res.status(403).json({ error: 'You can only edit your own review' });
        }
        if (rating) review.rating = rating;
        if (text !== undefined) review.text = text;
        if (images) review.images = images;
        review.createdAt = new Date();
        // Update average rating
        const ratings = salon.reviews.map(r => r.rating);
        salon.rating = ratings.reduce((a, b) => a + b, 0) / ratings.length;
        await salon.save();
        res.json({ success: true, review });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete a review
router.delete('/:salonId/reviews/:reviewId', protect, async (req, res) => {
    try {
        const salon = await Salon.findById(req.params.salonId);
        if (!salon) return res.status(404).json({ error: 'Salon not found' });
        const review = salon.reviews.id(req.params.reviewId);
        if (!review) return res.status(404).json({ error: 'Review not found' });
        if (String(review.userId) !== String(req.user._id)) {
            return res.status(403).json({ error: 'You can only delete your own review' });
        }
        review.remove();
        // Update average rating
        const ratings = salon.reviews.map(r => r.rating);
        salon.rating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
        await salon.save();
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all salons with rating >= 4 (Featured Salons)
router.get('/featured', async (req, res) => {
    try {
        const salons = await Salon.find({ rating: { $gte: 4 } }).sort({ rating: -1 });
        res.json(salons);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get top salons by rating and review count
router.get('/top', async (req, res) => {
    try {
        const salons = await Salon.aggregate([
            { $addFields: { reviewCount: { $size: { $ifNull: ["$reviews", []] } } } },
            { $sort: { rating: -1, reviewCount: -1 } },
            { $limit: 5 }
        ]);
        res.json(salons);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;