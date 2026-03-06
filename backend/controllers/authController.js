const FarmerUser = require('../models/FarmerUser');
const ProfileInfo = require('../models/ProfileInfo');
const admin = require('../config/firebase');
const jwt = require('jsonwebtoken');
const Joi = require('joi');

// Validation schema for firebase login
const loginSchema = Joi.object({
    idToken: Joi.string().required().messages({
        'string.empty': 'Firebase ID token is required',
        'any.required': 'Firebase ID token is required',
    }),
});

/**
 * Firebase Login / Signup
 * POST /api/auth/firebase-login
 *
 * Flow:
 * 1. Verify Firebase ID token
 * 2. Find or create user in farmer_user collection
 * 3. Auto-create profile_info document for new users
 * 4. Return JWT session token + user data
 */
exports.firebaseLogin = async (req, res) => {
    // Validate input
    const { error } = loginSchema.validate(req.body);
    if (error) {
        return res.status(400).json({
            success: false,
            message: error.details[0].message,
        });
    }

    const { idToken } = req.body;

    try {
        // Step 1: Verify Firebase ID token
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const { uid, email, name, picture, phone_number, firebase } = decodedToken;
        const provider = firebase?.sign_in_provider === 'phone' ? 'phone' : 'google';

        // Step 2: Find existing user by firebase_uid
        let user = await FarmerUser.findOne({ firebase_uid: uid });

        if (!user) {
            // Step 3: Create new user
            user = new FarmerUser({
                firebase_uid: uid,
                name: name || 'User',
                email: email || '',
                phone: phone_number || '',
                role: 'farmer', // default role, can be changed later
                language: 'en',
                location: '',
            });
            await user.save();

            // Step 4: Auto-create profile_info document
            const profile = new ProfileInfo({
                userId: user._id,
                profileImage: picture || '',
                email: email || '',
                phone: phone_number || '',
            });
            await profile.save();

            // Link profile to user
            user.profileId = profile._id;
            await user.save();
            console.log(`🆕 New User Registered: ${user.name} (${uid})`);
        } else {
            console.log(`🔑 User Logged In: ${user.name} (${uid})`);
        }

        // Step 5: Generate JWT session token
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );
        console.log(`🎟️ JWT Generated for user: ${user._id}`);

        // Step 6: Return response
        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                language: user.language,
                location: user.location,
                profileId: user.profileId,
            },
        });
    } catch (error) {
        console.error('Firebase Login Error:', error);
        res.status(401).json({
            success: false,
            message: 'Invalid Firebase token or authentication failed',
        });
    }
};
