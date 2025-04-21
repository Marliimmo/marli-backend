const PageImageModel = require("../models/PageImage");
const { uploadFile, getFileStream } = require("../midlewares/aws-s3-config/aws-config");
const fs = require("fs");
const util = require("util");
const unlink = util.promisify(fs.unlink);

// Upload d'une image d'une page
exports.uploadPageImage = async (req, res) => {
  const file = req.file;
  const pageName = req.body.pageName;

  if (!file || !pageName) {
    return res.status(400).json({ message: "Image ou nom de page manquant" });
  }

  const result = await uploadFile(file, "imagesPages", pageName);
  await unlink(file.path);

  const imagePath = result.key;

  try {
    const existing = await PageImageModel.findOne({ pageName });

    if (existing) {
      existing.imagePath = imagePath;
      await existing.save();
    } else {
      await PageImageModel.create({ pageName, imagePath });
    }

    res.status(200).json({ message: "Image uploadée avec succès", imagePath });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la sauvegarde", error });
  }
};

// Récupérer une image d'une page
// Récupérer une image d'une page
exports.getImagePath = async (req, res) => {
  const { pageName } = req.params;

  try {
    const image = await PageImageModel.findOne({ pageName });
    if (!image || !image.imagePath) {
      return res.status(404).json({ message: "Image non trouvée" });
    }

    const [repertoire, key] = image.imagePath.split("/");

    const stream = await getFileStream(key, repertoire);
    if (!stream) {
      return res.status(404).json({ message: "Fichier introuvable sur S3" });
    }

    stream.pipe(res);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur", error });
  }
};
