const mongoose = require('mongoose');

/**
 * ProfileInfo Schema
 * Stores extended profile details for users.
 * Referenced by FarmerUser via profileId.
 */
const ProfileInfoSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'FarmerUser',
            required: true,
            unique: true,
        },
        profileImage: {
            type: String,
            default: '',
        },
        bio: {
            type: String,
            trim: true,
            default: '',
        },
        farmName: {
            type: String,
            trim: true,
            default: '',
        },
        farmLocation: {
            type: String,
            trim: true,
            default: '',
        },
        experienceYears: {
            type: Number,
            default: 0,
        },
        cropsGrown: {
            type: [String],
            default: [],
        },
        phone: {
            type: String,
            trim: true,
            default: '',
        },
        email: {
            type: String,
            trim: true,
            lowercase: true,
            default: '',
        },
        socialLinks: {
            type: Map,
            of: String,
            default: {},
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('ProfileInfo', ProfileInfoSchema);
