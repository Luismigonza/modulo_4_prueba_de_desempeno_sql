const express = require('express');
const router = express.Router();
const multer = require('multer');
const migrationController = require('../controllers/migrationcontroller');

const upload = multer({ dest: 'uploads/' });
router.post('/', upload.single('file'), migrationController.uploadMasterFile);

module.exports = router;
