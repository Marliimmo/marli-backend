const express = require('express');
const router = express.Router();
const pageController = require('../../controllers/SiteConfig/pageController');

router.get('/accueil', pageController.getPages);
router.put('/accueil', pageController.updatePage);

module.exports = router;
