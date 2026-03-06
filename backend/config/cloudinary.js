const cloudinary = require('cloudinary').v2;

/**
 * Configure Cloudinary SDK with environment variables.
 * Used for uploading images and videos for marketplace listings.
 */
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

if (cloudinary.config().cloud_name) {
    console.log(`✅ Cloudinary Connected: ${cloudinary.config().cloud_name}`);
} else {
    console.error('❌ Cloudinary Configuration Missing!');
}

module.exports = cloudinary;
