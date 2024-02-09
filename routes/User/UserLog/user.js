const express = require("express");
const ctrlUser = require("../../../controllers/User/UserLog/User");
const auth = require("../../../midlewares/auth/auth");

const router = express.Router();

// CRUD de base sur un user
router.post('/login', ctrlUser.login);
router.get('/tk-log', auth, ctrlUser.tk_log);

module.exports = router;