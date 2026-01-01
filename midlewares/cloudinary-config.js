const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadToCloudinary = async (filePath, folder) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: folder,
      resource_type: 'auto'
    });
    return result.secure_url;
  } catch (error) {
    console.error('Erreur upload Cloudinary:', error);
    throw error;
  }
};

// ✅ NOUVELLE FONCTION : Supprimer une image de Cloudinary
const deleteFromCloudinary = async (imageUrl) => {
  try {
    // Extraire le public_id de l'URL Cloudinary
    // URL exemple : https://res.cloudinary.com/xxx/image/upload/v123456/folder/image.jpg
    const urlParts = imageUrl.split('/');
    const uploadIndex = urlParts.indexOf('upload');
    
    if (uploadIndex === -1) {
      throw new Error('URL Cloudinary invalide');
    }
    
    // Récupérer la partie après "upload/v123456/"
    const pathParts = urlParts.slice(uploadIndex + 2); // Sauter "upload" et "v123456"
    const publicIdWithExtension = pathParts.join('/');
    
    // Enlever l'extension (.jpg, .png, etc.)
    const publicId = publicIdWithExtension.replace(/\.[^/.]+$/, '');
    
    console.log('Suppression Cloudinary public_id:', publicId);
    
    const result = await cloudinary.uploader.destroy(publicId);
    
    return result;
  } catch (error) {
    console.error('Erreur suppression Cloudinary:', error);
    // Ne pas throw l'erreur pour ne pas bloquer la suppression en base de données
    return { result: 'error', error: error.message };
  }
};

module.exports = { uploadToCloudinary, deleteFromCloudinary };
