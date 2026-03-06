const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { auth } = require('../middleware/authMiddleware');
const { uploadProfileImage } = require('../middleware/uploadMiddleware');

// GET /api/profile/me - Get current user's profile (auth required)
router.get('/me', auth, profileController.getProfile);

// PUT /api/profile/update - Update profile with optional image upload (auth required)
router.put('/update', auth, uploadProfileImage, profileController.updateProfile);

module.exports = router;
