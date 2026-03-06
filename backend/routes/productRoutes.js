const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { auth } = require('../middleware/authMiddleware');

router.post('/', auth, productController.createProduct);
router.get('/', productController.getProducts);

module.exports = router;
