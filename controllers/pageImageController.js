// controllers/pageImageController.js
const PageImage = require('../models/PageImage');
const fs = require('fs');
const path = require('path');

exports.uploadImage = async (req, res) => {
  const { pageName } = req.body;
  const imagePath = req.file.path;

  try {
    let existing = await PageImage.findOne({ pageName });

    if (existing) {
      // Supprimer l'ancienne image
      fs.unlinkSync(existing.imagePath);
      existing.imagePath = imagePath;
      await existing.save();
    } else {
      await PageImage.create({ pageName, imagePath });
    }

    res.status(200).json({ message: 'Image mise à jour', imagePath });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de l’upload', error });
  }
};

exports.getImagePath = async (req, res) => {
  const { pageName } = req.params;

  try {
    const image = await PageImage.findOne({ pageName });
    if (image) {
      res.sendFile(path.resolve(image.imagePath));
    } else {
      res.status(404).json({ message: 'Image non trouvée' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error });
  }
};
