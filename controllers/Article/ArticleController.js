const Article = require('../../models/Article')
const cloudinary = require('cloudinary').v2

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

exports.createArticle = async (req, res) => {
  try {
    const { title, excerpt, content, urlImage } = req.body
    const article = new Article({ title, excerpt, content, urlImage })
    await article.save()
    res.status(201).json(article)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

exports.getArticles = async (req, res) => {
  try {
    const articles = await Article.find().sort({ createdAt: -1 })
    res.status(200).json(articles)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

exports.deleteArticle = async (req, res) => {
  try {
    await Article.findByIdAndDelete(req.params.id)
    res.status(200).json({ message: 'Article supprimé' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
