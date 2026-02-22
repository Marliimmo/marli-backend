const fs = require("fs");
const util = require('util');
const unlink = util.promisify(fs.unlink);
const { uploadFile, getFileStream, deleteFile } = require("../../../midlewares/aws-s3-config/aws-config");
const { uploadToCloudinary, deleteFromCloudinary } = require("../../../midlewares/cloudinary-config");
const BienModel = require("../../../models/Bien");
const WantedModel = require("../../../models/Wanted");
const crypto = require('crypto');

const generateRandomCode = () => {
    const currentDate = new Date();
    const milliseconds = currentDate.getMilliseconds().toString().padStart(3, "0");
    const seconds = currentDate.getSeconds().toString().padStart(2, "0");
    const randomBytes = crypto.randomBytes(3);
    const randomString = randomBytes.toString("base64");
    const randomCharacters = randomString.replace(/[+/=]/g, '').slice(0, 6);
    const sixCharacterCode = randomCharacters + milliseconds + seconds;
    return sixCharacterCode.slice(0, 6);
};

exports.getImagesPath = async (req, res) =>{
  const key = req.params.key;
  const repertoire = req.params.repertoire;
  const readStream = await getFileStream(key, repertoire);
  if(!readStream){
    return res.status(404).json({message: "Aucune Image"})
  }
  readStream.pipe(res)
}

exports.updateImagesBien = async (req, res) => {
  const file = req.file;
  const nomDeLaPropiete = req.body.nomDeLaPropiete;
  const reference = req.body.reference;
  try {
    const cloudinaryUrl = await uploadToCloudinary(file.path, 'marli-biens');
    await unlink(file.path);
    const data = { [nomDeLaPropiete]: { url: cloudinaryUrl } };
    await BienModel.updateOne({ ref: reference }, data);
    res.status(200).json({ message: "Image enregistrée", result: cloudinaryUrl });
  } catch (error) {
    res.status(500).json({ error: "Une erreur s'est produite lors de l'enregistrement de l'image." });
  }
};

exports.deleteImageBien = async (req, res) => {
  const imageUrl = req.params.key;
  const index = req.query.index;
  const reference = req.query.ref;
  
  try {
    if (imageUrl && imageUrl.startsWith("http")) {
      await deleteFromCloudinary(imageUrl);
    }
    
    if (reference && index !== undefined) {
      const updateData = {};
      updateData[`_medias.image_galerie_${index}`] = null;
      await BienModel.updateOne({ ref: reference }, { $unset: updateData });
    }
    
    res.status(200).json({ message: "Image supprimée" });
  } catch (error) {
    console.error("Erreur deleteImageBien:", error);
    res.status(500).json({ message: "Image non supprimée", error: error.message });
  }
};

// ✅ CORRECTION : Utiliser Cloudinary au lieu de AWS S3
exports.imageWanted = async (req, res) => {
  const file = req.file;
  const data = req.body;
  
  try {
    // Upload vers Cloudinary
    const cloudinaryUrl = await uploadToCloudinary(file.path, 'marli-wanted');
    await unlink(file.path);
    
    const newWanted = new WantedModel({
      title: data.title,
      caracteristiques: data.caracteristiques,
      history: data.history,
      urlImage: cloudinaryUrl, // Stocker l'URL Cloudinary complète
    });
    
    await newWanted.save();
    res.status(200).json({ message: "Avis enregistré", url: cloudinaryUrl });
  } catch (error) {
    console.error('Erreur imageWanted:', error);
    res.status(500).json({ message: "Avis non enregistré", error: error.message });
  }
};

exports.getWanted = async (req, res) => {
  try {
    const allWanted = await WantedModel.find();
    res.status(200).json(allWanted);
  } catch (error) {
    res.status(500).json({ message: "Erreur" });
  }
};

// ✅ CORRECTION : Supprimer de Cloudinary
exports.deleteWanted = async (req, res) => {
  const id = req.query.id || req.body.id;
  const urlImage = req.query.key || req.body.urlImage;
  
  try {
    // Si c'est une URL Cloudinary, la supprimer
    if (urlImage && urlImage.startsWith('http')) {
      await deleteFromCloudinary(urlImage);
    }
    // Sinon, c'est un ancien fichier S3 (on ignore, il n'existe plus de toute façon)
    
    await WantedModel.deleteOne({ _id: id });
    res.status(200).json({ message: "Avis supprimé" });
  } catch (error) {
    console.error('Erreur deleteWanted:', error);
    res.status(500).json({ message: "Avis non supprimé", error: error.message });
  }
};

exports.updateMultipleImages = async (req, res) => {
  try {
    const { reference, existingImages } = req.body;
    const files = req.files;

    if (!reference) {
      return res.status(400).json({ message: "Référence manquante" });
    }

    const bien = await BienModel.findOne({ ref: reference });
    if (!bien) {
      return res.status(404).json({ message: "Bien non trouvé" });
    }

    const existing = existingImages ? JSON.parse(existingImages) : [];

    const uploadedUrls = [];
    if (files && files.length > 0) {
      for (const file of files) {
        const cloudinaryUrl = await uploadToCloudinary(file.path, 'marli-biens');
        await unlink(file.path);
        uploadedUrls.push(cloudinaryUrl);
      }
    }

    const allImages = [...existing, ...uploadedUrls];

    const updateData = {};
    allImages.forEach((url, index) => {
      updateData[`_medias.image_galerie_${index}`] = { url };
    });

    await BienModel.updateOne({ ref: reference }, { $set: updateData });

    res.status(200).json({
      message: "Images enregistrées avec succès",
      images: allImages
    });
  } catch (error) {
    console.error('Erreur upload:', error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};
