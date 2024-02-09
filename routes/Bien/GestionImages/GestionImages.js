const express = require("express");
const ctrlUserImages = require("../../../controllers/Bien/GestionImages/GestionImages");
const auth = require("../../../midlewares/auth/auth");

const multer = require("multer");
const upload = multer({dest: "uploads/"});

const router = express.Router();

// routes gestion des images user
router.get('/images/:repertoire/:key', ctrlUserImages.getImagesPath);
router.put('/update-image', auth, upload.single("image"), ctrlUserImages.updateImagesBien);
router.delete('/medias/:repertoire/:key', auth, ctrlUserImages.deleteImageBien);

module.exports = router;