const fs = require('fs')
const { uploadToCloudinary } = require('../../midlewares/cloudinary-config')

// Image de couverture d'article : même traitement que les photos de biens
// (recompression automatique si > 10 Mo, limite du plan Cloudinary gratuit)
exports.uploadImage = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Aucune image fournie' })
  }
  if (!req.file.mimetype || !req.file.mimetype.startsWith('image/')) {
    fs.unlink(req.file.path, () => {})
    return res.status(400).json({ error: 'Le fichier doit être une image' })
  }
  try {
    const url = await uploadToCloudinary(req.file.path, 'marli-articles', req.file.mimetype)
    res.status(200).json({ url })
  } catch (error) {
    console.error('uploadImage article:', error)
    res.status(500).json({ error: "Échec de l'envoi de l'image" })
  } finally {
    fs.unlink(req.file.path, () => {})
  }
}
