const express = require('express');
const router = express.Router();
const Salon = require('../models/salon');
const { protect } = require('../middleware/authMiddleware');

// Get all salons 
router.get('/', async (req, res) => {
    try {
        const salons = await Salon.find({}).sort({ rating: -1, createdAt: -1 });
        res.json(salons);
    } catch (err) {
        console.error('GET /salons - Error:', err);
        res.status(500).json({ error: err.message });
    }
});



// Get top 5 salons with rating >= 4
router.get('/top', async (req, res) => {
    try {
        console.log('GET /salons/top - Starting query for top 5 salons with rating >= 4');
        
        const salons = await Salon.aggregate([
            {
                $match: { 
                    rating: { $gte: 4 }
                }
            },
            {
                $addFields: {
                    reviewCount: {
                        $cond: {
                            if: { $and: [
                                { $ne: ["$reviews", null] },
                                { $isArray: "$reviews" }
                            ]},
                            then: { $size: "$reviews" },
                            else: 0
                        }
                    }
                }
            },
            {
                $sort: { rating: -1, reviewCount: -1 }
            },
            {
                $limit: 5
            },
            {
                // Project only the fields you need for the frontend
                $project: {
                    name: 1,
                    email: 1,
                    salonName: 1,
                    salonAddress: 1,
                    locationAddress: 1,
                    location: 1,
                    services: 1,
                    rating: 1,
                    openingTime: 1,
                    closingTime: 1,
                    profileImage: 1,
                    galleryImages: 1,
                    reviews: 1,
                    reviewCount: 1
                }
            }
        ]);

        console.log('GET /salons/top - Query successful, found', salons.length, 'salons');
        res.json(salons);
    } catch (err) {
        console.error('GET /salons/top - Error details:', err);
        console.error('GET /salons/top - Error stack:', err.stack);
        
        // Fallback to simple query if aggregation fails
        try {
            console.log('Attempting fallback query...');
            const fallbackSalons = await Salon.find({ 
                rating: { $gte: 4 }
            })
            .sort({ rating: -1 })
            .limit(5)
            .lean();
            
            // Add review count in JavaScript
            const salonsWithReviewCount = fallbackSalons.map(salon => ({
                ...salon,
                reviewCount: (salon.reviews && Array.isArray(salon.reviews)) ? salon.reviews.length : 0
            }));
            
            // Sort by rating and review count
            salonsWithReviewCount.sort((a, b) => {
                if (b.rating !== a.rating) {
                    return b.rating - a.rating;
                }
                return b.reviewCount - a.reviewCount;
            });
            
            console.log('Fallback successful, found', salonsWithReviewCount.length, 'salons');
            res.json(salonsWithReviewCount);
        } catch (fallbackErr) {
            console.error('Fallback also failed:', fallbackErr);
            res.status(500).json({ 
                error: 'Database query failed', 
                originalError: err.message,
                fallbackError: fallbackErr.message 
            });
        }
    }
});

// Get a single salon by ID
router.get('/:id', async (req, res) => {
    try {
        const salon = await Salon.findById(req.params.id);
        if (!salon) {
            return res.status(404).json({ error: 'Salon not found' });
        }
        res.json(salon);
    } catch (err) {
        console.error('GET /salons/:id - Error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Get reviews for a single salon
router.get('/:id/reviews', async (req, res) => {
    try {
        const salon = await Salon.findById(req.params.id);
        if (!salon) {
            return res.status(404).json({ error: 'Salon not found' });
        }
        res.json(salon.reviews || []);
    } catch (err) {
        console.error('GET /salons/:id/reviews - Error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Post a review for a salon
router.post('/:id/reviews', protect, async (req, res) => {
    try {
        const { rating, text, images } = req.body;
        const salon = await Salon.findById(req.params.id);
        if (!salon) {
            return res.status(404).json({ error: 'Salon not found' });
        }

        // Get user info from auth middleware
        const userId = req.user.id;
        const userName = req.user.name;

        // Initialize reviews array if it doesn't exist
        if (!salon.reviews) {
            salon.reviews = [];
        }

        // Create new review
        const newReview = {
            userId,
            userName,
            rating: rating || 0,
            text: text || '',
            images: images || [],
            createdAt: new Date()
        };

        salon.reviews.push(newReview);

        // Calculate new average rating
        const totalRating = salon.reviews.reduce((sum, review) => sum + review.rating, 0);
        salon.rating = totalRating / salon.reviews.length;

        await salon.save();
        res.json(salon);
    } catch (err) {
        console.error('POST /salons/:id/reviews - Error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Edit a review
router.put('/:id/reviews/:reviewId', protect, async (req, res) => {
    try {
        const { rating, text, images } = req.body;
        const salon = await Salon.findById(req.params.id);
        if (!salon) {
            return res.status(404).json({ error: 'Salon not found' });
        }

        // Find the review
        const reviewIndex = salon.reviews.findIndex(review => review._id.toString() === req.params.reviewId);
        if (reviewIndex === -1) {
            return res.status(404).json({ error: 'Review not found' });
        }

        // Check if user owns this review
        const userId = req.user.id;
        if (salon.reviews[reviewIndex].userId.toString() !== userId) {
            return res.status(403).json({ error: 'Not authorized to edit this review' });
        }

        // Update review
        salon.reviews[reviewIndex] = {
            ...salon.reviews[reviewIndex],
            rating: rating !== undefined ? rating : salon.reviews[reviewIndex].rating,
            text: text !== undefined ? text : salon.reviews[reviewIndex].text,
            images: images !== undefined ? images : salon.reviews[reviewIndex].images
        };

        // Recalculate average rating
        const totalRating = salon.reviews.reduce((sum, review) => sum + review.rating, 0);
        salon.rating = totalRating / salon.reviews.length;

        await salon.save();
        res.json(salon);
    } catch (err) {
        console.error('PUT /salons/:id/reviews/:reviewId - Error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Delete a review
router.delete('/:id/reviews/:reviewId', protect, async (req, res) => {
    try {
        const salon = await Salon.findById(req.params.id);
        if (!salon) {
            return res.status(404).json({ error: 'Salon not found' });
        }

        // Find the review
        const reviewIndex = salon.reviews.findIndex(review => review._id.toString() === req.params.reviewId);
        if (reviewIndex === -1) {
            return res.status(404).json({ error: 'Review not found' });
        }

        // Check if user owns this review
        const userId = req.user.id;
        if (salon.reviews[reviewIndex].userId.toString() !== userId) {
            return res.status(403).json({ error: 'Not authorized to delete this review' });
        }

        // Remove the review
        salon.reviews.splice(reviewIndex, 1);

        // Recalculate average rating
        if (salon.reviews.length > 0) {
            const totalRating = salon.reviews.reduce((sum, review) => sum + review.rating, 0);
            salon.rating = totalRating / salon.reviews.length;
        } else {
            salon.rating = 0;
        }

        await salon.save();
        res.json(salon);
    } catch (err) {
        console.error('DELETE /salons/:id/reviews/:reviewId - Error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Update salon profile image
router.put('/:id/profile-image', async (req, res) => {
    try {
        const { profileImage } = req.body;
        const salon = await Salon.findByIdAndUpdate(
            req.params.id,
            { profileImage },
            { new: true }
        );
        if (!salon) {
            return res.status(404).json({ error: 'Salon not found' });
        }
        res.json(salon);
    } catch (err) {
        console.error('PUT /salons/:id/profile-image - Error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Update salon profile (general update)
router.put('/:id', async (req, res) => {
    try {
        const updateData = req.body;
        const salon = await Salon.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );
        if (!salon) {
            return res.status(404).json({ error: 'Salon not found' });
        }
        res.json(salon);
    } catch (err) {
        console.error('PUT /salons/:id - Error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Add gallery image to salon
router.post('/:id/gallery', async (req, res) => {
    try {
        const { imageUrl } = req.body;
        const salon = await Salon.findById(req.params.id);
        if (!salon) {
            return res.status(404).json({ error: 'Salon not found' });
        }
        
        // Initialize galleryImages array if it doesn't exist
        if (!salon.galleryImages) {
            salon.galleryImages = [];
        }
        
        // Add the new image URL
        salon.galleryImages.push(imageUrl);
        await salon.save();
        
        res.json(salon);
    } catch (err) {
        console.error('POST /salons/:id/gallery - Error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Remove gallery image from salon
router.delete('/:id/gallery', async (req, res) => {
    try {
        const { imageUrl } = req.body;
        const salon = await Salon.findById(req.params.id);
        if (!salon) {
            return res.status(404).json({ error: 'Salon not found' });
        }
        
        // Remove the image URL from galleryImages array
        if (salon.galleryImages) {
            salon.galleryImages = salon.galleryImages.filter(url => url !== imageUrl);
            await salon.save();
        }
        
        res.json(salon);
    } catch (err) {
        console.error('DELETE /salons/:id/gallery - Error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Add service to salon
router.post('/:id/services', async (req, res) => {
    try {
        const { name } = req.body;
        const salon = await Salon.findById(req.params.id);
        if (!salon) {
            return res.status(404).json({ error: 'Salon not found' });
        }
        
        // Initialize services array if it doesn't exist
        if (!salon.services) {
            salon.services = [];
        }
        
        // Add the new service with just the name
        const newService = {
            name: name || 'Unnamed Service'
        };
        
        salon.services.push(newService);
        await salon.save();
        
        res.json(salon);
    } catch (err) {
        console.error('POST /salons/:id/services - Error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Update service in salon
router.put('/:id/services/:serviceId', async (req, res) => {
    try {
        const { name } = req.body;
        const salon = await Salon.findById(req.params.id);
        if (!salon) {
            return res.status(404).json({ error: 'Salon not found' });
        }
        
        // Find and update the specific service
        const serviceIndex = salon.services.findIndex(service => service._id.toString() === req.params.serviceId);
        if (serviceIndex === -1) {
            return res.status(404).json({ error: 'Service not found' });
        }
        
        // Update only the name field
        salon.services[serviceIndex].name = name || salon.services[serviceIndex].name;
        
        await salon.save();
        res.json(salon);
    } catch (err) {
        console.error('PUT /salons/:id/services/:serviceId - Error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Delete service from salon
router.delete('/:id/services/:serviceId', async (req, res) => {
    try {
        const salon = await Salon.findById(req.params.id);
        if (!salon) {
            return res.status(404).json({ error: 'Salon not found' });
        }
        
        // Remove the specific service
        salon.services = salon.services.filter(service => service._id.toString() !== req.params.serviceId);
        await salon.save();
        
        res.json(salon);
    } catch (err) {
        console.error('DELETE /salons/:id/services/:serviceId - Error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Debug route to check salon data
router.get('/debug', async (req, res) => {
    try {
        console.log('Checking salon collection...');
        
        const totalCount = await Salon.countDocuments();
        const withRatingCount = await Salon.countDocuments({ rating: { $exists: true, $ne: null } });
        
        const sampleSalon = await Salon.findOne();
        
        res.json({
            totalSalons: totalCount,
            salonsWithRating: withRatingCount,
            sampleSalonFields: sampleSalon ? Object.keys(sampleSalon.toObject()) : null,
            sampleRating: sampleSalon ? sampleSalon.rating : null,
            sampleReviewsLength: sampleSalon && sampleSalon.reviews ? sampleSalon.reviews.length : 0
        });
        
    } catch (err) {
        console.error('Debug route error:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;