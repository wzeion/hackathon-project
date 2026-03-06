const FarmerPost = require('../models/FarmerPost');
const FarmerUser = require('../models/FarmerUser');
const { uploadToCloudinary, deleteFromCloudinary } = require('../middleware/uploadMiddleware');
const Joi = require('joi');

// Validation schema for creating a post
const createPostSchema = Joi.object({
    cropName: Joi.string().required().max(100).messages({
        'string.empty': 'Crop name is required',
        'any.required': 'Crop name is required',
    }),
    description: Joi.string().max(1000).allow('').optional(),
    price: Joi.number().required().min(0).messages({
        'number.base': 'Price must be a number',
        'any.required': 'Price is required',
    }),
    quantity: Joi.string().max(100).allow('').optional(),
    location: Joi.string().max(200).allow('').optional(),
    status: Joi.string().valid('active', 'sold').optional(),
}).unknown(true); // allow file fields

// Validation schema for updating a post
const updatePostSchema = Joi.object({
    cropName: Joi.string().max(100).optional(),
    description: Joi.string().max(1000).allow('').optional(),
    price: Joi.number().min(0).optional(),
    quantity: Joi.string().max(100).allow('').optional(),
    location: Joi.string().max(200).allow('').optional(),
    status: Joi.string().valid('active', 'sold').optional(),
}).unknown(true);

/**
 * Create a new marketplace listing
 * POST /api/posts/create
 */
exports.createPost = async (req, res) => {
    try {
        // Validate input
        const { error } = createPostSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message,
            });
        }

        const { cropName, description, price, quantity, location, status } = req.body;

        // Upload images to Cloudinary
        const imageUrls = [];
        if (req.files?.images) {
            for (const file of req.files.images) {
                const result = await uploadToCloudinary(
                    file.buffer,
                    'local-connect/posts',
                    'image'
                );
                imageUrls.push(result.secure_url);
            }
        }

        // Upload video to Cloudinary
        let videoUrl = '';
        if (req.files?.video?.[0]) {
            const result = await uploadToCloudinary(
                req.files.video[0].buffer,
                'local-connect/posts',
                'video'
            );
            videoUrl = result.secure_url;
        }

        // Create post document
        const post = new FarmerPost({
            userId: req.user.id,
            cropName,
            description: description || '',
            price,
            quantity: quantity || '',
            location: location || '',
            images: imageUrls,
            video: videoUrl,
            status: status || 'active',
        });

        await post.save();
        console.log(`✨ Farmer Post Created: "${post.cropName}" by user ${req.user.id}`);
        console.log(`📦 Media: ${post.images.length} images, ${post.video ? '1 video' : 'no video'}`);

        // Populate user info for response
        const populatedPost = await FarmerPost.findById(post._id)
            .populate('userId', 'name email phone location');

        res.status(201).json({
            success: true,
            message: 'Post created successfully',
            post: populatedPost,
        });
    } catch (error) {
        console.error('Create Post Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating post',
        });
    }
};

/**
 * Get all marketplace listings
 * GET /api/posts/all
 */
exports.getAllPosts = async (req, res) => {
    try {
        const posts = await FarmerPost.find()
            .populate('userId', 'name email phone location')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: posts.length,
            posts,
        });
    } catch (error) {
        console.error('Get Posts Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching posts',
        });
    }
};

/**
 * Get a single post by ID
 * GET /api/posts/:id
 */
exports.getPostById = async (req, res) => {
    try {
        const post = await FarmerPost.findById(req.params.id)
            .populate('userId', 'name email phone location');

        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found',
            });
        }

        res.json({
            success: true,
            post,
        });
    } catch (error) {
        console.error('Get Post Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching post',
        });
    }
};

/**
 * Update a post (owner only)
 * PUT /api/posts/:id
 */
exports.updatePost = async (req, res) => {
    try {
        // Validate input
        const { error } = updatePostSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message,
            });
        }

        const post = await FarmerPost.findById(req.params.id);

        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found',
            });
        }

        // Check ownership
        if (post.userId.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this post',
            });
        }

        // Update text fields
        const { cropName, description, price, quantity, location, status } = req.body;
        if (cropName !== undefined) post.cropName = cropName;
        if (description !== undefined) post.description = description;
        if (price !== undefined) post.price = price;
        if (quantity !== undefined) post.quantity = quantity;
        if (location !== undefined) post.location = location;
        if (status !== undefined) post.status = status;

        // Handle new image uploads (append to existing)
        if (req.files?.images) {
            for (const file of req.files.images) {
                const result = await uploadToCloudinary(
                    file.buffer,
                    'local-connect/posts',
                    'image'
                );
                post.images.push(result.secure_url);
            }
        }

        // Handle new video upload (replace existing)
        if (req.files?.video?.[0]) {
            const result = await uploadToCloudinary(
                req.files.video[0].buffer,
                'local-connect/posts',
                'video'
            );
            post.video = result.secure_url;
        }

        await post.save();

        const updatedPost = await FarmerPost.findById(post._id)
            .populate('userId', 'name email phone location');

        res.json({
            success: true,
            message: 'Post updated successfully',
            post: updatedPost,
        });
    } catch (error) {
        console.error('Update Post Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating post',
        });
    }
};

/**
 * Delete a post (owner only)
 * DELETE /api/posts/:id
 */
exports.deletePost = async (req, res) => {
    try {
        const post = await FarmerPost.findById(req.params.id);

        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found',
            });
        }

        // Check ownership
        if (post.userId.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this post',
            });
        }

        await FarmerPost.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'Post deleted successfully',
        });
    } catch (error) {
        console.error('Delete Post Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting post',
        });
    }
};
