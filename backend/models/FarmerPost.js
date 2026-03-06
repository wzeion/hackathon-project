const mongoose = require('mongoose');

/**
 * FarmerPost Schema
 * Stores marketplace listings created by farmers.
 * Images and videos are stored as Cloudinary URLs.
 */
const FarmerPostSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'FarmerUser',
            required: true,
            index: true,
        },
        cropName: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            trim: true,
            default: '',
        },
        price: {
            type: Number,
            required: true,
            min: 0,
        },
        quantity: {
            type: String,
            trim: true,
            default: '',
        },
        location: {
            type: String,
            trim: true,
            default: '',
        },
        images: {
            type: [String],
            default: [],
        },
        video: {
            type: String,
            default: '',
        },
        status: {
            type: String,
            enum: ['active', 'sold'],
            default: 'active',
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('FarmerPost', FarmerPostSchema);
