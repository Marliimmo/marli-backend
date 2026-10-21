const fs = require("fs");
const util = require('util');
const unlink = util.promisify(fs.unlink);
const { uploadFile, getFileStream, deleteFile } = require("../../../midlewares/aws-s3-config/aws-config");
const { uploadToCloudinary, deleteFromCloudinary } = require("../../../midlewares/cloudinary-config");
const BienModel = require("../../../models/Bien");
const WantedModel = require("../../../models/Wanted");
const crypto = require('crypto');
const { str } = require("../../../midlewares/security");

// Dossiers de l'ancien stockage S3 pouvant être lus publiquement
const REPERTOIRES_PUBLICS = ['imagesBienMarli', 'imagesWanted', 'userAvis', 'imagesPages'];

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
  const key = str(req.params.key, 300);
  const repertoire = str(req.params.repertoire, 50);
  if (!REPERTOIRES_PUBLICS.includes(repertoire) || !/^[\w.\-]+$/.test(key)) {
    return res.status(404).json({message: "Aucune Image"})
  }
  const readStream = await getFileStream(key, repertoire);
  if(!readStream){
    return res.status(404).json({message: "Aucune Image"})
  }
  readStream.pipe(res)
}

exports.updateImagesBien = async (req, res) => {
  const file = req.file;
  const nomDeLaPropiete = str(req.body.nomDeLaPropiete, 40);
  const reference = str(req.body.reference, 20);

  // Correctif : la fonction utilisait une variable "data" inexistante, l'image partait sur
  // Cloudinary puis la requête échouait sans rien enregistrer.
  if (!file) return res.status(400).json({ error: "Aucun fichier reçu" });
  if (!reference || !/^(image_galerie_\d{1,2}|video_bien)$/.test(nomDeLaPropiete)) {
    if (fs.existsSync(file.path)) await unlink(file.path);
    return res.status(400).json({ error: "Référence ou emplacement d'image invalide" });
  }
  try {
    const cloudinaryUrl = await uploadToCloudinary(file.path, 'marli-biens', file.mimetype);
    const result = await BienModel.updateOne(
      { ref: reference },
      { $set: { [`_medias.${nomDeLaPropiete}.url`]: cloudinaryUrl } }
    );
    if (result.matchedCount === 0) return res.status(404).json({ error: "Bien non trouvé" });
    res.status(200).json({ message: "Image enregistrée", result: cloudinaryUrl });
  } catch (error) {
    console.error("updateImagesBien:", error);
    res.status(500).json({ error: "Une erreur s'est produite lors de l'enregistrement de l'image." });
  } finally {
    if (fs.existsSync(file.path)) await unlink(file.path);
  }
};

exports.deleteImageBien = async (req, res) => {
  const imageUrl = req.params.key;
  const index = req.query.index;
  const reference = req.query.ref;
  // "field" est optionnel : chemin Mongo complet (ex: _medias.video_bien) pour supprimer
  // un média qui n'est pas indexé comme la galerie (ex: la vidéo). Si absent, comportement
  // inchangé (suppression d'une image de galerie via son index).
  const field = req.query.field ? str(req.query.field, 60) : undefined;
  if (field && !/^_medias\.\w+$/.test(field)) {
    return res.status(400).json({ message: "Champ de média invalide" });
  }

  try {
    if (imageUrl && imageUrl.startsWith("http")) {
      await deleteFromCloudinary(imageUrl);
    }

    if (reference && (field || index !== undefined)) {
      const updateData = {};
      const targetField = field || `_medias.image_galerie_${index}`;
      updateData[targetField] = null;
      await BienModel.updateOne({ ref: reference }, { $unset: updateData });
    }

    res.status(200).json({ message: "Média supprimé" });
  } catch (error) {
    console.error("Erreur deleteImageBien:", error);
    res.status(500).json({ message: "Média non supprimé", error: error.message });
  }
};

// ✅ CORRECTION : Utiliser Cloudinary au lieu de AWS S3
exports.imageWanted = async (req, res) => {
  const file = req.file;
  const data = req.body;
  if (!file) return res.status(400).json({ message: "Aucune image reçue" });
  
  try {
    // Upload vers Cloudinary
    const cloudinaryUrl = await uploadToCloudinary(file.path, 'marli-wanted', file.mimetype);
    if (fs.existsSync(file.path)) await unlink(file.path);
    
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
    const { reference, keepUrls } = req.body;
    const files = req.files ? req.files.filter(f => f.fieldname === "images") : [];

    if (!reference) {
      return res.status(400).json({ message: "Référence manquante" });
    }

    const bien = await BienModel.findOne({ ref: reference });
    if (!bien) {
      return res.status(404).json({ message: "Bien non trouvé" });
    }

    // URLs existantes à conserver (envoyées par le frontend)
    let keptUrls = [];
    if (keepUrls) {
      try { keptUrls = JSON.parse(keepUrls); }
      catch(e) { keptUrls = Array.isArray(keepUrls) ? keepUrls : [keepUrls]; }
    }

    // Uploader les nouvelles images (chaque fichier est indépendant : si l'un échoue,
    // les autres sont quand même enregistrés au lieu de tout annuler)
    const uploadedUrls = [];
    const failedFiles = [];
    if (files && files.length > 0) {
      for (const file of files) {
        try {
          const cloudinaryUrl = await uploadToCloudinary(file.path, 'marli-biens', file.mimetype);
          uploadedUrls.push(cloudinaryUrl);
        } catch (fileError) {
          console.error(`Échec upload pour ${file.originalname}:`, fileError.message);
          failedFiles.push(file.originalname);
        } finally {
          if (fs.existsSync(file.path)) await unlink(file.path);
        }
      }
    }

    // Images finales = gardées + nouvelles
    const allImages = [...keptUrls, ...uploadedUrls];

    // Compter les anciens slots
    let oldCount = 0;
    while (bien._medias && bien._medias[`image_galerie_${oldCount}`]) oldCount++;

    // Construire $set et $unset
    const setData = {};
    const unsetData = {};
    allImages.forEach((url, index) => { setData[`_medias.image_galerie_${index}`] = { url }; });
    for (let j = allImages.length; j < oldCount; j++) { unsetData[`_medias.image_galerie_${j}`] = ""; }

    const updateOp = { $set: setData };
    if (Object.keys(unsetData).length > 0) updateOp.$unset = unsetData;

    await BienModel.updateOne({ ref: reference }, updateOp);

    if (failedFiles.length > 0) {
      res.status(200).json({
        message: `${uploadedUrls.length} image(s) enregistrée(s), mais ${failedFiles.length} ont échoué : ${failedFiles.join(', ')}`,
        images: allImages,
        failedFiles,
      });
    } else {
      res.status(200).json({ message: "Images enregistrées avec succès", images: allImages });
    }
  } catch (error) {
    console.error('Erreur upload:', error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

