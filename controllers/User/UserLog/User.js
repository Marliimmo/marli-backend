require('dotenv').config();
const jwt = require("jsonwebtoken");
const { uploadFile } = require("../../../midlewares/aws-s3-config/aws-config");
const { reviewUserNotif } = require("../../../midlewares/notificationEmail/reviewUserNotif");
const UserAvisModel = require("../../../models/UserAvis");
const fs = require("fs");
const util = require('util');
const unlink = util.promisify(fs.unlink)

const crypto = require('crypto');
const { str, escapeHtml } = require("../../../midlewares/security");

// Comparaison à temps constant (évite de deviner l'identifiant caractère par caractère)
const safeEqual = (a, b) => {
  const ha = crypto.createHash('sha256').update(String(a ?? '')).digest();
  const hb = crypto.createHash('sha256').update(String(b ?? '')).digest();
  return crypto.timingSafeEqual(ha, hb);
};

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

  const okPseudo = safeEqual(pseudoUser, process.env.PSEUDO_ACCES_DASHBORD);
  const okKey = safeEqual(keyAccess, process.env.KEY_ACCES_DASHBORD);
  if(process.env.PSEUDO_ACCES_DASHBORD && process.env.KEY_ACCES_DASHBORD && okPseudo && okKey){
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
// Seuls les champs attendus sont acceptés : le statut reste toujours "not-valid"
// (un visiteur ne peut plus publier son avis sans modération).
exports.addReview = async (req, res, next) => {
  const pseudo = str(req.body?.pseudo, 60);
  const description = str(req.body?.description, 2000);
  const stars = parseInt(req.body?.stars, 10);
  const urlImage = str(req.body?.urlImage, 300);

  if (!pseudo || !description || !(stars >= 1 && stars <= 5)) {
    return res.status(400).json({ message: "Pseudo, avis et note (1 à 5) obligatoires" });
  }
  if (urlImage && /^\s*javascript:/i.test(urlImage)) {
    return res.status(400).json({ message: "Image invalide" });
  }

  try {
    const newAvis = new UserAvisModel({ pseudo, description, stars, urlImage: urlImage || undefined });
    await newAvis.save();
    await reviewUserNotif(escapeHtml(pseudo), stars, escapeHtml(description));
    return res.status(200).json({message: 'Avis ajouté avec succès'});
  } catch (error) {
    console.error("addReview:", error);
    return res.status(500).json({message: 'Erreur serveur'});
  }
}

// ajout d'un avis depuis le dashboard (avis reçu par téléphone, e-mail, Google...)
// Réservé à l'administratrice connectée ; publié directement sauf si "publier" vaut false.
const AVATARS = ['women_1', 'women_2', 'women_3', 'men_1', 'men_2', 'men_3'];
exports.adminAddReview = async (req, res, next) => {
  const pseudo = str(req.body?.pseudo, 60);
  const description = str(req.body?.description, 2000);
  const stars = parseInt(req.body?.stars, 10);
  const urlImage = AVATARS.includes(req.body?.urlImage) ? req.body.urlImage : 'women_1';
  if (!pseudo || !description || !(stars >= 1 && stars <= 5)) {
    return res.status(400).json({ message: "Nom, avis et note (1 à 5) obligatoires" });
  }
  try {
    const avis = new UserAvisModel({
      pseudo, description, stars, urlImage,
      status: req.body?.publier === false ? 'not-valid' : 'valid',
    });
    await avis.save();
    return res.status(201).json({ message: 'Avis ajouté' });
  } catch (error) {
    console.error("adminAddReview:", error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
}

// get de tous les avis client
// La vue complète (avis non validés compris) est réservée au dashboard connecté.
exports.getReviews = async (req, res, next) => {
  const allReviews = req.query.allreviews && req.isAdmin
  try {
    const reviews = await UserAvisModel.find(allReviews ? {} : {status: "valid"}).select("-__v -dateAdd")
    .sort({_id : -1});
    return res.status(200).json(reviews);
  } catch (error) {
    return res.status(500).json({message: 'Erreur serveur'})
  }
}

exports.deleteReview = async (req, res, next) => {
  const id = str(req.params.id, 40);

  try {
    const review = await UserAvisModel.findOne({ _id: id });
    if (!review) {
      return res.status(404).json({ message: "Avis non trouvé" });
    }

    await UserAvisModel.deleteOne({ _id: id });
    return res.status(200).json({ message: "Avis supprimé avec succès" });
  } catch (error) {
    return res.status(500).json({ message: "Erreur serveur", error });
  }
};


exports.validationReview = async (req, res, next) => {
  const status = str(req.query.status, 20);
  const id = str(req.query.id, 40);
  if (!["valid", "not-valid"].includes(status)) {
    return res.status(400).json({ message: "Statut invalide" });
  }

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