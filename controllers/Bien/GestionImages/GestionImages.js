const fs = require("fs");
const util = require('util');
const unlink = util.promisify(fs.unlink)
const { uploadFile, getFileStream, deleteFile } = require("../../../midlewares/aws-s3-config/aws-config");
const BienModel = require("../../../models/Bien");
const WantedModel = require("../../../models/Wanted");
const crypto = require('crypto');

// Création d'un code aléatoire unique 
const generateRandomCode = () => {
    const currentDate = new Date();
    const milliseconds = currentDate.getMilliseconds().toString().padStart(3, "0"); // Obtenir les millisecondes actuelles et les formater sur 3 chiffres
    const seconds = currentDate.getSeconds().toString().padStart(2, "0"); // Obtenir les secondes actuelles et les formater sur 2 chiffres
    const randomBytes = crypto.randomBytes(3); // 3 octets pour obtenir plus de combinaisons
    const randomString = randomBytes.toString("base64");
    const randomCharacters = randomString
        .replace(/[+/=]/g, '') // Supprimer les caractères spéciaux de base64
        .slice(0, 6); // Garder les 6 premiers caractères

    const sixCharacterCode = randomCharacters + milliseconds + seconds;
    return sixCharacterCode.slice(0, 6); // Garder seulement les 6 premiers caractères
};
// Fin

// stream de l'image
exports.getImagesPath = async (req, res) =>{
  const key = req.params.key;
  const repertoire = req.params.repertoire;

  const readStream = await getFileStream(key, repertoire);
  if(!readStream){
    return res.status(404).send({error : "file not found"})
  } else{
    readStream.pipe(res);
  }
}
   
// mise a jour d'une image d'un bien.
exports.updateImagesBien = async (req, res) =>{
    const file = req.file;
    const index = req.query.index;
    const referenceBien = req.query.ref;
  
    const result = await uploadFile(file, "imagesBienMarli", referenceBien);
    await unlink(file.path);
  
    const updateKey = `_medias.image_galerie_${index}`;
    const imageUrl = result.key;
  
    BienModel.findOne({ ref: referenceBien })
      .then((bien) => {
        if (bien) {
          const updateQuery = {
            $set: {
              [updateKey]: {
                url: imageUrl,
              },
            },
          };
  
          BienModel.updateOne({ ref: referenceBien }, updateQuery)
            .then(() => res.status(200).json({ message: `Image galerie index ${index} mis à jour avec succès`, imagePath : imageUrl }))
            .catch((error) => res.status(400).json({ error }));
          return;
        }
        res.status(401).json({ error: 'Bien non trouvé' });
      })
      .catch((error) => res.status(500).json({ error }));
}
  
// suppression d'une image d'un bien.
exports.deleteImageBien = async (req, res) =>{
    const key = req.params.key;
    const repertoire = req.params.repertoire;
    const index = req.query.index;
    const referenceBien = req.query.ref;
    const updateKey = `_medias.image_galerie_${index}`;
  
    BienModel.findOne({ ref: referenceBien })
      .then( async () => {
        const updateQuery = {
          $set: {
            [updateKey]: {
              url: null,
            },
          },
        };
  
        await deleteFile(key, repertoire);
        BienModel.updateOne({ref : referenceBien}, updateQuery)
          .then(() => res.status(200).json({message: `Image galerie index ${index} supprimé avec succès`}))
          .catch(error => res.status(401).json({error}));
      })
      .catch((error) => res.status(500).json({ error }));
}

// ajout d'une image avis de recherche.
exports.imageWanted = async (req, res) =>{
  const file = req.file;

  const result = await uploadFile(file, "imagesWanted", generateRandomCode());
  await unlink(file.path);
  const imageUrl = result.key;

  try {
    const newWanted = new WantedModel({
      urlImage : imageUrl
    });

    await newWanted.save();
    return res.status(201).json({message: "Wanted save"})
  } catch (error) {
    return res.status(500).json({message: "Erreur serveur", error})
  }
}

// get avis de recherche.
exports.getWanted = async (req, res) =>{
  try {
    const wanteds = await WantedModel.find({}).select("-__v").sort({id: -1});
    return res.status(200).json(wanteds)
  } catch (error) {
    return res.status(500).json({message: "Erreur serveur", error})
  }
}

// suppression d'une image avis de recherche.
exports.deleteWanted = async (req, res) =>{
  const key = req.query.key;
  const id = req.query.id;
  await deleteFile(key, "imagesWanted");
  WantedModel.deleteOne({_id : id})
    .then(() => res.status(200).json({message: `Image supprimé avec succès`}))
    .catch(error => res.status(401).json({error}));
}