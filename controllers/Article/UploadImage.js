const cloudinary = require('cloudinary').v2
const { unlink } = require('fs/promises')

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

exports.uploadImage = async (req, res) => {
  try {
    // ✅ LOGS DE DEBUG
    console.log('=== DEBUG UPLOAD IMAGE ===')
    console.log('req.file:', req.file)
    console.log('req.body:', req.body)
    console.log('=========================')

    if (!req.file) {
      console.error('ERREUR: req.file est undefined')
      return res.status(400).json({ error: 'Aucune image fournie - req.file is missing' })
    }

    console.log('Upload vers Cloudinary:', req.file.path)
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'marli-articles',
      resource_type: 'image'
    })

    console.log('Cloudinary OK:', result.secure_url)
    await unlink(req.file.path)

    res.status(200).json({ url: result.secure_url })
  } catch (error) {
    console.error('ERREUR uploadImage:', error)
    res.status(500).json({ error: error.message })
  }
}