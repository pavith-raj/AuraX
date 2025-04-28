const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ message: 'No token provided' });
    }

    // Format should be: Bearer <token>
    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Invalid token format' });
    }

    try {
        // Verify the token
        const decoded = jwt.verify(token, 'your_jwt_secret_key'); // Same secret key as login
        req.user = decoded; // add user info to request
        next(); // Allow access to route
    } catch (error) {
        console.error(error);
        res.status(401).json({ message: 'Invalid token' });
    }
};

module.exports = authMiddleware;
