const express = require('express')
const router = express.Router()
const articleController = require('../../controllers/Article/ArticleController')
const uploadController = require('../../controllers/Article/UploadImage')
const auth = require('../../midlewares/auth/auth')

router.post('/create', auth, articleController.createArticle)
router.get('/get-articles', articleController.getArticles)
router.delete('/delete/:id', auth, articleController.deleteArticle)
router.post('/upload-image', auth, uploadController.uploadImage)

module.exports = router
