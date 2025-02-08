const express = require("express");
const ctrlUser = require("../../controllers/FormNotif/FormNotif");

const router = express.Router();

router.post('/contact-us', ctrlUser.contactUs);
router.post('/wanted', ctrlUser.wanted);
router.post('/selling', ctrlUser.selling);

module.exports = router;