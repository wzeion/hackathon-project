const mongoose = require('mongoose');

/**
 * FarmerUser Schema
 * Stores basic account information for farmers and buyers.
 * Links to ProfileInfo via profileId for extended profile details.
 */
const FarmerUserSchema = new mongoose.Schema(
    {
        firebase_uid: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
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
        role: {
            type: String,
            enum: ['farmer', 'buyer'],
            default: 'farmer',
        },
        language: {
            type: String,
            default: 'en',
        },
        location: {
            type: String,
            trim: true,
            default: '',
        },
        profileId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ProfileInfo',
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('FarmerUser', FarmerUserSchema);
