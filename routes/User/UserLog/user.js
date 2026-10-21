const express = require("express");
const ctrlUser = require("../../../controllers/User/UserLog/User");
const auth = require("../../../midlewares/auth/auth");
const rateLimit = require("express-rate-limit");

const router = express.Router();
const { reviewLimiter, honeypot, optionalAuth } = require('../../../midlewares/security');

// const multer = require("multer");
// const upload = multer({dest: "uploads/"});

// Anti brute-force : 10 tentatives de connexion max toutes les 15 minutes par IP
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: "Trop de tentatives de connexion, réessayez dans quelques minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

// CRUD de base sur un user
router.post('/login', loginLimiter, ctrlUser.login);
router.get('/tk-log', auth, ctrlUser.tk_log);
// router.post('/add-review', upload.single("photo"), ctrlUser.addReview);
router.post('/add-review', reviewLimiter, honeypot, ctrlUser.addReview);
router.post('/admin-review', auth, ctrlUser.adminAddReview);
router.get('/reviews', optionalAuth, ctrlUser.getReviews);
router.patch('/validation-review', auth, ctrlUser.validationReview);
router.delete('/delete-review/:id', auth, ctrlUser.deleteReview);

module.exports = router;