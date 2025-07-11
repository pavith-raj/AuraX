const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Salon = require('../models/salon');

exports.protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log('Decoded JWT:', decoded);

            // Try to find user in User model
            let user = await User.findById(decoded.id).select('-password');
            console.log('User found in User model:', user);
            if (!user) {
                // Try to find user in Salon model
                user = await Salon.findById(decoded.id).select('-password');
                console.log('User found in Salon model:', user);
            }
            if (!user) {
                return res.status(401).json({ message: 'Not authorized, user not found' });
            }
            req.user = user;
            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    } else {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};
