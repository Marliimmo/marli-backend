const fs = require("fs");
const util = require('util');
const unlink = util.promisify(fs.unlink)
const { uploadFile, getFileStream, deleteFile } = require("../../../midlewares/aws-s3-config/aws-config");
const BienModel = require("../../../models/Bien");

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
  