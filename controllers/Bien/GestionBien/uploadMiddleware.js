const upload = require('../../../uploadConfig');

// Middleware pour uploader les images
const uploadImages = upload.fields([
  { name: 'image_principale', maxCount: 1 },
  { name: 'image_galerie', maxCount: 30 }
]);

module.exports = { uploadImages };
