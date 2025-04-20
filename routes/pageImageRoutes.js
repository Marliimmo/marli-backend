// routes/pageImageRoutes.js
const express = require('express');
const router = express.Router();
const upload = require('../midlewares/upload');
const controller = require('../controllers/pageImageController');

router.post('/upload', upload.single('image'), controller.uploadImage);
router.get('/:pageName', controller.getImagePath);

module.exports = router;
