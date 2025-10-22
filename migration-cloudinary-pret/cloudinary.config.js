require('dotenv').config();
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

async function uploadFromUrl(imageUrl, folder = 'marli-biens') {
  try {
    const result = await cloudinary.uploader.upload(imageUrl, {
      folder: folder,
      resource_type: 'auto'
    });
    return result;
  } catch (error) {
    throw error;
  }
}

module.exports = { cloudinary, uploadFromUrl };
