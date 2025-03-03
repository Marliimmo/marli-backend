const express = require("express");
const ctrlUser = require("../../../controllers/User/UserLog/User");
const auth = require("../../../midlewares/auth/auth");

const router = express.Router();

// const multer = require("multer");
// const upload = multer({dest: "uploads/"});

// CRUD de base sur un user
router.post('/login', ctrlUser.login);
router.get('/tk-log', auth, ctrlUser.tk_log);
// router.post('/add-review', upload.single("photo"), ctrlUser.addReview);
router.post('/add-review', ctrlUser.addReview);
router.get('/reviews', ctrlUser.getReviews);
router.patch('/validation-review', auth, ctrlUser.validationReview);
router.delete('/delete-review/:id', ctrlUser.deleteReview);

module.exports = router;