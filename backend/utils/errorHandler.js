/**
 * Centralized error handler middleware.
 * Catches all unhandled errors and returns a consistent JSON response.
 */
const errorHandler = (err, req, res, next) => {
    console.error('Error:', err.stack || err.message || err);

    // Multer file size error
    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
            success: false,
            message: 'File too large. Maximum size is 50MB.',
        });
    }

    // Multer file count error
    if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({
            success: false,
            message: 'Too many files. Maximum is 5 images and 1 video.',
        });
    }

    // Multer unexpected field error
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({
            success: false,
            message: 'Unexpected file field. Use "images" for images and "video" for video.',
        });
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map((e) => e.message);
        return res.status(400).json({
            success: false,
            message: messages.join(', '),
        });
    }

    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        return res.status(400).json({
            success: false,
            message: 'Invalid ID format',
        });
    }

    // Mongoose duplicate key
    if (err.code === 11000) {
        return res.status(400).json({
            success: false,
            message: 'Duplicate field value entered',
        });
    }

    // Default server error
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode).json({
        success: false,
        message: err.message || 'Internal Server Error',
    });
};

module.exports = errorHandler;
