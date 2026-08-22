const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() }); // stockage en mémoire avant S3
const auth = require("../midlewares/auth/auth");

const pageImageController = require("../controllers/pageImageController");

router.post("/upload", auth, upload.single("image"), pageImageController.uploadPageImage);
router.get("/:pageName", pageImageController.getImagePath);

module.exports = router;
