const cloudinary = require('cloudinary').v2

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

exports.uploadImage = async (req, res) => {
  try {
    if (!req.body.image) {
      return res.status(400).json({ error: 'Aucune image fournie' })
    }

    const result = await cloudinary.uploader.upload(req.body.image, {
      folder: 'articles',
      resource_type: 'image'
    })

    res.status(200).json({ url: result.secure_url })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
