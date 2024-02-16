require('dotenv').config();
const jwt = require("jsonwebtoken");
const { uploadFile } = require("../../../midlewares/aws-s3-config/aws-config");
const { reviewUserNotif } = require("../../../midlewares/notificationEmail/reviewUserNotif");
const UserAvisModel = require("../../../models/UserAvis");
const fs = require("fs");
const util = require('util');
const unlink = util.promisify(fs.unlink)

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


// Login d'un user avec génération d'un token
exports.login = (req, res, next) =>{
  const pseudoUser = req?.body?.pseudo
  const keyAccess = req?.body?.password

  if((pseudoUser === process.env.PSEUDO_ACCES_DASHBORD) && (keyAccess === process.env.KEY_ACCES_DASHBORD)){
    return res.status(200).json({
      pseudo : pseudoUser,
      token : jwt.sign(
        {pseudo : pseudoUser,},
        `${process.env.JWT_KEY}`,
        {expiresIn : "24h"}
      )
    })
  } else{
    return res.status(401).json({message: "Utilisateur ou mot de passe incorrect"});
  }
}

// verification du token de connexion
exports.tk_log = async (req, res, next) => {
  return res.status(200).json({message : "user connecté"});
}

// ajout d'un avis client
exports.addReview = async (req, res, next) => {
  const dataBody = {...req.body};
  // const file = req?.file;
  // let result;

  // if(file){
  //   const codeUnique = generateRandomCode();
  //   result = await uploadFile(file, 'userAvis', codeUnique);
  //   await unlink(file.path);
  // }

  try {
    const newAvis = new UserAvisModel({
      ...dataBody,
      // urlImage : result?.key ? result.key : null
    })

    await newAvis.save();
    await reviewUserNotif(dataBody.pseudo, dataBody.stars, dataBody.description)
    return res.status(200).json({message: 'Avis ajouté avec succès'});
  } catch (error) {
    return res.status(500).json({message: 'Erreur serveur', error});
  }
}

// get de tous les avis client
exports.getReviews = async (req, res, next) => {
  const allReviews = req.query.allreviews
  try {
    const reviews = await UserAvisModel.find(allReviews ? {} : {status: "valid"}).select("-__v -dateAdd")
    .sort({_id : -1});
    return res.status(200).json(reviews);
  } catch (error) {
    return res.status(500).json({message: 'Erreur serveur', error})
  }
}

exports.validationReview = async (req, res, next) => {
  const status = req.query.status;
  const id = req.query.id;

  try {
    const review = await UserAvisModel.findOne({_id : id});
    if(!review){
      return res.status(404).json({message: "Avis non trouvé"});
    }

    await UserAvisModel.updateOne({_id: id}, { "status" : status})
    return res.status(200).json({message: "Status mis a jour avec succès"});
  } catch (error) {
    return res.status(500).json({message: "Error serveur", error})
  }
}