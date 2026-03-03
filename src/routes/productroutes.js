const express = require('express');
const router = express.Router();
const productController = require('../controllers/productcontroller');

router.get('/', productController.getAllProducts);          // GET
router.post('/', productController.createProduct);          // POST
router.put('/:sku', productController.updateProduct);       // PUT
router.delete('/:sku', productController.deleteProduct);    // DELETE

module.exports = router;
