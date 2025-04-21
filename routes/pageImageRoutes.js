const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ dest: "uploads/" }); // stockage temporaire avant S3

const pageImageController = require("../controllers/pageImageController");

router.post("/upload", upload.single("image"), pageImageController.uploadPageImage);
router.get("/:pageName", pageImageController.getImagePath);

module.exports = router;
