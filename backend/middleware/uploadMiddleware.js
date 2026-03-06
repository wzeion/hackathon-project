const multer = require('multer');
const cloudinary = require('../config/cloudinary');

/**
 * Multer configuration with memory storage.
 * Files are stored in memory as Buffer objects for direct Cloudinary upload.
 */
const storage = multer.memoryStorage();

// File filter: allow images and videos only
const fileFilter = (req, file, cb) => {
    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const allowedVideoTypes = ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/webm'];

    if ([...allowedImageTypes, ...allowedVideoTypes].includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only images (JPEG, PNG, GIF, WebP) and videos (MP4, MPEG, MOV, WebM) are allowed.'), false);
    }
};

// Multer upload instance
const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50 MB max per file
        files: 6, // max 5 images + 1 video
    },
});

/**
 * Upload a single file buffer to Cloudinary.
 * @param {Buffer} fileBuffer - The file buffer from multer
 * @param {string} folder - Cloudinary folder name
 * @param {string} resourceType - 'image' or 'video'
 * @returns {Promise<object>} Cloudinary upload result with secure_url, public_id
 */
const uploadToCloudinary = (fileBuffer, folder = 'local-connect', resourceType = 'image') => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder,
                resource_type: resourceType,
                transformation: resourceType === 'image'
                    ? [{ width: 1200, height: 1200, crop: 'limit', quality: 'auto' }]
                    : undefined,
            },
            (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            }
        );
        uploadStream.end(fileBuffer);
    });
};

/**
 * Delete a file from Cloudinary by its public_id.
 * @param {string} publicId - The Cloudinary public_id
 * @param {string} resourceType - 'image' or 'video'
 */
const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
    try {
        await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    } catch (error) {
        console.error('Error deleting from Cloudinary:', error);
    }
};

// Middleware configurations for different upload scenarios
const uploadPostMedia = upload.fields([
    { name: 'images', maxCount: 5 },
    { name: 'video', maxCount: 1 },
]);

const uploadProfileImage = upload.single('profileImage');

module.exports = {
    uploadPostMedia,
    uploadProfileImage,
    uploadToCloudinary,
    deleteFromCloudinary,
};
