const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: 'dmsnf2wye',
  api_key: '139174873651433',
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

const uploadFromUrl = async (url, folder = 'marli-biens') => {
  try {
    const result = await cloudinary.uploader.upload(url, {
      folder: folder,
      resource_type: 'auto',
      transformation: [{ quality: 'auto', fetch_format: 'auto' }]
    });
    return result;
  } catch (error) {
    console.error('Erreur upload:', error);
    throw error;
  }
};

module.exports = { cloudinary, uploadFromUrl };
