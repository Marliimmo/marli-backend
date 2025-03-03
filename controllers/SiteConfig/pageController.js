// controllers/pageController.js
const Page = require('../../models/Page');


exports.getPages = async (req, res) => {
  try {
    const pages = await Page.findOne(); // Récupère le premier doc
    res.json(pages);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error });
  }
};

// Mise à jour ou création des paramètres
exports.updatePage = async (req, res) => {
  try {
    const updates = req.body;
    
    // On vérifie s'il existe déjà une page
    const existingPage = await Page.findOne();

    if (existingPage) {
      // Si la page existe, on fait un `PUT` (mise à jour)
      const updatedPage = await Page.findOneAndUpdate({}, updates, { new: true });
      return res.json({ message: 'Mise à jour réussie', data: updatedPage });
    } else {
      // Si la page n'existe pas, on fait un `POST` (création)
      const newPage = new Page(updates);
      await newPage.save();
      return res.status(201).json({ message: 'Page créée avec succès', data: newPage });
    }
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error });
  }
};