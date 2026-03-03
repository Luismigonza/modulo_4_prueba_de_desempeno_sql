const express = require('express');
const router = express.Router();
const biController = require('../controllers/bicontroller');

router.get('/suppliers', biController.getSupplierAnalysis);
router.get('/customers/:customerId/history', biController.getCustomerBehavior);
router.get('/categories/:categoryId/stars', biController.getStarProducts);

module.exports = router;
