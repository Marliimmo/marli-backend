// models/PageImage.js
const mongoose = require('mongoose');

const PageImageSchema = new mongoose.Schema({
  pageName: String,  // Exemple : "homepage", "avisDeRecherche"
  imagePath: String, // Chemin relatif vers l'image
});

module.exports = mongoose.model('PageImage', PageImageSchema);
