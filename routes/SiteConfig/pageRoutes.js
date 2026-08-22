const express = require('express');
const router = express.Router();
const pageController = require('../../controllers/SiteConfig/pageController');
const auth = require('../../midlewares/auth/auth');

router.get('/accueil', pageController.getPages);
router.put('/accueil', auth, pageController.updatePage);

module.exports = router;
