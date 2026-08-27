const cloudinary = require('cloudinary').v2;
const sharp = require('sharp');
const fs = require('fs');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Le plan gratuit Cloudinary refuse toute IMAGE de plus de 10 Mo (les vidéos vont jusqu'à 100 Mo,
// donc on n'y touche pas). Les photos d'appareil photo/smartphone dépassent souvent largement cette
// limite : on les recompresse automatiquement ici pour qu'aucun envoi n'échoue silencieusement.
const CLOUDINARY_FREE_IMAGE_LIMIT = 9.5 * 1024 * 1024; // marge de sécurité sous les 10 Mo

const ensureUploadableSize = async (filePath, mimetype) => {
  const isImage = mimetype && mimetype.startsWith('image/');
  if (!isImage) return filePath; // vidéos et autres fichiers : inchangé

  const { size } = fs.statSync(filePath);
  if (size <= CLOUDINARY_FREE_IMAGE_LIMIT) return filePath; // déjà assez léger

  const compressedPath = `${filePath}-compressed.jpg`;
  let quality = 85;
  let buffer = await sharp(filePath).resize({ width: 2400, withoutEnlargement: true }).jpeg({ quality }).toBuffer();

  // Si même après redimensionnement à 2400px le fichier reste trop lourd, on baisse encore la qualité
  while (buffer.length > CLOUDINARY_FREE_IMAGE_LIMIT && quality > 40) {
    quality -= 15;
    buffer = await sharp(filePath).resize({ width: 2400, withoutEnlargement: true }).jpeg({ quality }).toBuffer();
  }

  fs.writeFileSync(compressedPath, buffer);
  return compressedPath;
};

const uploadToCloudinary = async (filePath, folder, mimetype) => {
  let pathToUpload = filePath;
  try {
    pathToUpload = await ensureUploadableSize(filePath, mimetype);
    const result = await cloudinary.uploader.upload(pathToUpload, {
      folder: folder,
      resource_type: 'auto'
    });
    return result.secure_url;
  } catch (error) {
    console.error('Erreur upload Cloudinary:', error);
    throw error;
  } finally {
    // Nettoyage du fichier compressé temporaire s'il a été créé
    if (pathToUpload !== filePath && fs.existsSync(pathToUpload)) {
      fs.unlink(pathToUpload, () => {});
    }
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
