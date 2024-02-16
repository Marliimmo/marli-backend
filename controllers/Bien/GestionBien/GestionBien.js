const BienModel = require("../../../models/Bien");
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

// creation d'un nouveau bien
exports.createNewBien = async (req, res, next) =>{
    const bodyData = req.body
    const reference = generateRandomCode()

    try {
        const Bien = new BienModel({
            ...bodyData,
            ref : reference,
        })
    
        await Bien.save();
        return res.status(201).json({ref: reference})
    } catch (error) {
        return res.status(500).json({message: "Erreur serveur", error})
    }
}

// retour d'un bien
exports.getBien = async (req, res, next) =>{
    const reference = req.query.ref;
    
    try {
        const bien = await BienModel.findOne({ref: reference}).select("-__v -dateCrea -_id");
        if(!bien){
            return res.status(404).json({message: "Bien non trouvé"});
        }

        return res.status(200).json(bien)
    } catch (error) {
        return res.status(500).json({message: "Erreur serveur"})
    }
}

// retour de tous les biens
exports.getAllBien = async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const getAdmin = req.query.getAdmin;

    if (page <= 0 || pageSize <= 0) {
        return res.status(400).json({ error: 'Mauvaise demande de pagination' });
    }
    const skip = (page - 1) * pageSize;

    // Tri des project par ordre croissant ou decroissant
    let ordreTri = -1;
    if(req.query.triPar === "croissant"){
        ordreTri= -1;
    } else if(req.query.triPar === "decroissant"){
        ordreTri = 1;
    }

    // Initialisation de filtres
    const filters = {};

    // Vérification des paramètres de requête pour les filtres
    if (req.query.bienId) {
        filters.ref =  req.query.bienId;
    }

    if (req.query.status) {
        filters.status =  req.query.status;
    }

    const caracteristiques = [];
    if (req.query.typeBien) {
        const typeBien = req.query.typeBien.toLowerCase();
        caracteristiques.push(new RegExp(typeBien, 'i'));
    }

    // Si des caractéristiques ont été ajoutées, les ajouter aux filtres
    if (caracteristiques.length > 0) {
        filters.caracteristiques = { $all: caracteristiques };
    }

    if (req.query.budgets) {
        filters.prix = { $lte: parseInt(req.query.budgets) }; // inférieur ou egale
    }
    
    if (req.query.localisation) {
        const regex = new RegExp(req.query.localisation, 'i'); // 'i' pour une correspondance insensible à la casse
        filters.localisation = { $regex: regex };
    }

    try {
        const [biens, totalNumberOfBiens] = await Promise.all([
            BienModel.find({ status: { $nin: getAdmin ? null : "non-disponible" }, ...filters })
                .sort({ _id: ordreTri })
                .skip(skip)
                .limit(pageSize)
                .select('-__v -dateCrea -_id'),
            BienModel.countDocuments({ ...filters }).exec(),
        ]);

        const biensFiltreSuperficie = [];
        const superficie = req.query.superficie;
        if(superficie){
            for(const bien of biens){
                if(parseInt((bien.caracteristiques.split("#")[1].split("m")[0])) >= parseInt(superficie)){
                    biensFiltreSuperficie.push(bien);
                }
            }
        }
    
        const hasMore = superficie ? (page * pageSize) < biensFiltreSuperficie.length : (page * pageSize) < totalNumberOfBiens;
        res.status(200).json({ biens : superficie ? biensFiltreSuperficie : biens, hasMore });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur lors de la récupération des biens' });
    }
}

// mise a jour d'un bien 
exports.updateBien = async (req, res, next) =>{
    const reference = req.query.ref;
    const newData = {...req.body}

    delete newData.ref;
    delete newData._id;

    try {
        const bien = await BienModel.findOne({ref: reference});
        if(!bien){
            return res.status(404).json({message: "Bien non trouvé"});
        }

        await BienModel.updateOne({ref: reference}, {...newData});
        return res.status(200).json({message: "Bien mis a jour avec succès"});
    } catch (error) {
        return res.status(500).json({message: "Erreur serveur"})
    }
}