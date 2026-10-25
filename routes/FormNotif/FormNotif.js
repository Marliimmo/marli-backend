const express = require("express");
const ctrlUser = require("../../controllers/FormNotif/FormNotif");
const auth = require("../../midlewares/auth/auth");
const { formLimiter, honeypot } = require('../../midlewares/security');

const router = express.Router();

router.post('/contact-us', formLimiter, honeypot, ctrlUser.contactUs);
router.post('/wanted', formLimiter, honeypot, ctrlUser.wanted);
router.post('/selling', formLimiter, honeypot, ctrlUser.selling);

// Messages reçus, consultables dans le dashboard
router.get('/messages', auth, ctrlUser.listMessages);
router.patch('/messages/:id', auth, ctrlUser.markMessage);
router.delete('/messages/:id', auth, ctrlUser.deleteMessage);

module.exports = router;
