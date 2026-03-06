const ProfileInfo = require('../models/ProfileInfo');
const FarmerUser = require('../models/FarmerUser');
const { uploadToCloudinary } = require('../middleware/uploadMiddleware');
const Joi = require('joi');

// Validation schema for profile updates
const updateProfileSchema = Joi.object({
    bio: Joi.string().max(500).allow('').optional(),
    farmName: Joi.string().max(100).allow('').optional(),
    farmLocation: Joi.string().max(200).allow('').optional(),
    experienceYears: Joi.number().min(0).max(100).optional(),
    cropsGrown: Joi.alternatives().try(
        Joi.array().items(Joi.string()),
        Joi.string()
    ).optional(),
    phone: Joi.string().max(20).allow('').optional(),
    email: Joi.string().email().allow('').optional(),
    socialLinks: Joi.object().pattern(Joi.string(), Joi.string()).optional(),
    // Also allow updating user-level fields
    name: Joi.string().max(100).allow('').optional(),
    location: Joi.string().max(200).allow('').optional(),
    language: Joi.string().max(10).allow('').optional(),
    role: Joi.string().valid('farmer', 'buyer').optional(),
}).unknown(false);

/**
 * Get current user's profile
 * GET /api/profile/me
 */
exports.getProfile = async (req, res) => {
    try {
        const user = await FarmerUser.findById(req.user.id).populate('profileId');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        res.json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                language: user.language,
                location: user.location,
            },
            profile: user.profileId || null,
        });
    } catch (error) {
        console.error('Get Profile Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching profile',
        });
    }
};

/**
 * Update current user's profile
 * PUT /api/profile/update
 * Supports profile image upload via multipart form data
 */
exports.updateProfile = async (req, res) => {
    try {
        // Validate input (exclude file fields from Joi validation)
        const bodyData = { ...req.body };
        // Parse cropsGrown if it's a JSON string
        if (typeof bodyData.cropsGrown === 'string') {
            try {
                bodyData.cropsGrown = JSON.parse(bodyData.cropsGrown);
            } catch {
                bodyData.cropsGrown = bodyData.cropsGrown.split(',').map(s => s.trim()).filter(Boolean);
            }
        }
        // Parse socialLinks if it's a JSON string
        if (typeof bodyData.socialLinks === 'string') {
            try {
                bodyData.socialLinks = JSON.parse(bodyData.socialLinks);
            } catch {
                // ignore parse errors
            }
        }

        const { error } = updateProfileSchema.validate(bodyData);
        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message,
            });
        }

        // Find user
        const user = await FarmerUser.findById(req.user.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        // Update user-level fields if provided
        const userFields = ['name', 'location', 'language', 'role'];
        userFields.forEach((field) => {
            if (bodyData[field] !== undefined) {
                user[field] = bodyData[field];
            }
        });
        await user.save();

        // Find or create profile
        let profile = await ProfileInfo.findOne({ userId: user._id });
        if (!profile) {
            profile = new ProfileInfo({ userId: user._id });
        }

        // Handle profile image upload
        if (req.file) {
            const result = await uploadToCloudinary(
                req.file.buffer,
                'local-connect/profiles',
                'image'
            );
            profile.profileImage = result.secure_url;
        }

        // Update profile fields
        const profileFields = [
            'bio', 'farmName', 'farmLocation', 'experienceYears',
            'cropsGrown', 'phone', 'email', 'socialLinks',
        ];
        profileFields.forEach((field) => {
            if (bodyData[field] !== undefined) {
                profile[field] = bodyData[field];
            }
        });

        await profile.save();
        console.log(`👤 Profile Updated: ${user.name} (${user._id})`);
        if (req.file) console.log(`🖼️ Profile Image Updated: ${profile.profileImage}`);

        // Link profile if not already linked
        if (!user.profileId || user.profileId.toString() !== profile._id.toString()) {
            user.profileId = profile._id;
            await user.save();
        }

        res.json({
            success: true,
            message: 'Profile updated successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                language: user.language,
                location: user.location,
            },
            profile,
        });
    } catch (error) {
        console.error('Update Profile Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating profile',
        });
    }
};
