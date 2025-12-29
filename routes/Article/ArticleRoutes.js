const express = require('express')
const router = express.Router()
const articleController = require('../../controllers/Article/ArticleController')
const uploadController = require('../../controllers/Article/UploadImage')
const auth = require('../../midlewares/auth/auth')
const upload = require('../../midlewares/upload') // ✅ AJOUT

router.post('/create', auth, articleController.createArticle)
router.get('/get-articles', articleController.getArticles)
router.put('/update/:id', auth, articleController.updateArticle)
router.delete('/delete/:id', auth, articleController.deleteArticle)
router.post('/upload-image', auth, upload.single("image"), uploadController.uploadImage) // ✅ CORRECTION
module.exports = router
