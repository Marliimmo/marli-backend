const cloudinary = require('cloudinary').v2
const { unlink } = require('fs/promises')

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

exports.uploadImage = async (req, res) => {
  try {
    // ✅ CORRECTION : Vérifier req.file au lieu de req.body.image
    if (!req.file) {
      return res.status(400).json({ error: 'Aucune image fournie' })
    }

    // ✅ CORRECTION : Upload depuis le chemin du fichier temporaire
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'marli-articles',
      resource_type: 'image'
    })

    // ✅ Supprimer le fichier temporaire après upload
    await unlink(req.file.path)

    res.status(200).json({ url: result.secure_url })
  } catch (error) {
    console.error('Erreur upload image article:', error)
    res.status(500).json({ error: error.message })
  }
}
