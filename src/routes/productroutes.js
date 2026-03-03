const express = require('express');
const router = express.Router();
const productController = require('../controllers/productcontroller');

router.get('/', productController.getAllProducts);
router.delete('/:sku', productController.deleteProduct);

module.exports = router;
