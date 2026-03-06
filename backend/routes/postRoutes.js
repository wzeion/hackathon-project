const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { auth } = require('../middleware/authMiddleware');
const { uploadPostMedia } = require('../middleware/uploadMiddleware');

// POST /api/posts/create - Create a new marketplace listing (auth required)
router.post('/create', auth, uploadPostMedia, postController.createPost);

// GET /api/posts/all - Get all marketplace listings (public)
router.get('/all', postController.getAllPosts);

// GET /api/posts/:id - Get a single post by ID (public)
router.get('/:id', postController.getPostById);

// PUT /api/posts/:id - Update a post (auth required, owner only)
router.put('/:id', auth, uploadPostMedia, postController.updatePost);

// DELETE /api/posts/:id - Delete a post (auth required, owner only)
router.delete('/:id', auth, postController.deletePost);

module.exports = router;
