const express = require("express");
const ctrlUserImages = require("../../../controllers/Bien/GestionImages/GestionImages");
const auth = require("../../../midlewares/auth/auth");
const upload = require("../../../midlewares/upload");

const router = express.Router();

// routes gestion des images user
router.get('/images/:repertoire/:key', ctrlUserImages.getImagesPath);
router.put('/update-image', auth, upload.single("image"), ctrlUserImages.updateImagesBien);
router.delete('/medias/:repertoire/:key', auth, ctrlUserImages.deleteImageBien);
router.post('/wanted-image', auth, upload.single("image"), ctrlUserImages.imageWanted);
router.get('/get-wanteds', ctrlUserImages.getWanted);
router.delete('/delete-wanted', auth, ctrlUserImages.deleteWanted);
router.post('/update-multiple-images', auth, upload.array("images", 20), ctrlUserImages.updateMultipleImages);

module.exports = router;

