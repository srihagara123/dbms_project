// src/middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');

exports.verifyToken = (req, res, next) => {
    // Get token from the authorization header
    const authHeader = req.header('Authorization');
    if (!authHeader) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1]; // Extract token after "Bearer"
    
    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');
        req.user = verified; // Attach user info (userId, role) to the request
        next(); // Proceed to the controller
    } catch (error) {
        res.status(400).json({ error: 'Invalid token.' });
    }
};