const Article = require('../../models/Article')
const { str } = require('../../midlewares/security')

// Champs acceptés depuis le dashboard (texte simple, longueur bornée)
const champsArticle = (body) => {
  const data = {
    title: str(body.title, 200),
    excerpt: str(body.excerpt, 1000),
    content: typeof body.content === 'string' ? body.content.slice(0, 200000) : '',
    urlImage: str(body.urlImage, 500),
    categorie: str(body.categorie, 120),
    motsCles: str(body.motsCles, 500),
    slug: str(body.slug, 100),
  }
  const d = body.datePublication ? new Date(body.datePublication) : null
  if (d && !isNaN(d)) data.datePublication = d
  return data
}

exports.createArticle = async (req, res) => {
  try {
    const data = champsArticle(req.body)
    if (!data.title || !data.excerpt || !data.content || !data.urlImage) {
      return res.status(400).json({ error: 'Titre, extrait, contenu et image obligatoires' })
    }
    const article = new Article(data)
    await article.save()
    res.status(201).json(article)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

exports.getArticles = async (req, res) => {
  try {
    const articles = await Article.find().select('-__v').sort({ datePublication: -1, createdAt: -1 })
    res.status(200).json(articles)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// ✅ NOUVELLE FONCTION : Modifier un article
exports.updateArticle = async (req, res) => {
  try {
    const { id } = req.params
    const data = champsArticle(req.body)
    // ne pas écraser un champ avec une valeur vide envoyée par une ancienne version du dashboard
    for (const k of Object.keys(data)) if (data[k] === '') delete data[k]

    const article = await Article.findByIdAndUpdate(
      id,
      { ...data, updatedAt: Date.now() },
      { new: true } // Retourne l'article mis à jour
    )
    
    if (!article) {
      return res.status(404).json({ error: 'Article non trouvé' })
    }
    
    res.status(200).json(article)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

exports.deleteArticle = async (req, res) => {
  try {
    const article = await Article.findByIdAndDelete(req.params.id)
    if (!article) return res.status(404).json({ error: 'Article non trouvé' })
    res.status(200).json({ message: 'Article supprimé' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
