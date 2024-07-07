const express = require("express");
const ctrlUser = require("../../../controllers/Bien/GestionBien/GestionBien");
const auth = require("../../../midlewares/auth/auth");

const router = express.Router();

router.post('/create', auth, ctrlUser.createNewBien);
router.patch('/update', auth, ctrlUser.updateBien);
router.delete('/delete', auth, ctrlUser.deleteBien);
router.get('/get-one', ctrlUser.getBien);
router.get('/all-biens', ctrlUser.getAllBien);

module.exports = router;