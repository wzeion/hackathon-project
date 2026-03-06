const jwt = require('jsonwebtoken');

/**
 * Auth Middleware
 * Verifies JWT session token from the Authorization header.
 * Attaches decoded user payload (id, role) to req.user.
 */
const auth = (req, res, next) => {
    const authHeader = req.header('Authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'No token provided, authorization denied',
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({
            success: false,
            message: 'Token is not valid or has expired',
        });
    }
};

module.exports = { auth };
