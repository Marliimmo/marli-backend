require('dotenv').config();
const jwt = require("jsonwebtoken");


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