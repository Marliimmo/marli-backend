const express = require("express");
const ctrlUser = require("../../controllers/FormNotif/FormNotif");

const router = express.Router();
const { formLimiter, honeypot } = require('../../midlewares/security');

router.post('/contact-us', formLimiter, honeypot, ctrlUser.contactUs);
router.post('/wanted', formLimiter, honeypot, ctrlUser.wanted);
router.post('/selling', formLimiter, honeypot, ctrlUser.selling);

module.exports = router;