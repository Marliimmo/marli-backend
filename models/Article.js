const mongoose = require('mongoose')

const articleSchema = mongoose.Schema({
  title: { type: String, required: true },
  excerpt: { type: String, required: true },
  content: { type: String, required: true },
  urlImage: { type: String, required: true },
  // Publication automatique sur le site (GitHub Action du dépôt FRONT-MARLI)
  datePublication: { type: Date, default: Date.now },
  categorie: { type: String, default: '' },
  motsCles: { type: String, default: '' },
  slug: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model('Article', articleSchema)
