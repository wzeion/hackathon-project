const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// POST /api/auth/firebase-login - Authenticate via Firebase ID token
router.post('/firebase-login', authController.firebaseLogin);

module.exports = router;
