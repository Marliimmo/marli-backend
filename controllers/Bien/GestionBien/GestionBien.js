const BienModel = require("../../../models/Bien");
const crypto = require('crypto');
const { deleteFile } = require("../../../midlewares/aws-s3-config/aws-config");

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

    let ordreTri = -1;
    if(req.query.triPar === "croissant"){
        ordreTri= -1;
    } else if(req.query.triPar === "decroissant"){
        ordreTri = 1;
    }

    const filters = {};

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

    if (caracteristiques.length > 0) {
        filters.caracteristiques = { $all: caracteristiques };
    }

    if (req.query.budgets) {
        filters.prix = { $lte: parseInt(req.query.budgets) };
    }
    
    if (req.query.localisation) {
        const regex = new RegExp(req.query.localisation, 'i');
        filters.localisation = { $regex: regex };
    }

    try {
        const [biens, totalNumberOfBiens] = await Promise.all([
            BienModel.find({ status: { $nin: getAdmin ? null : "non-disponible" }, ...filters })
                .sort({ dateCrea: -1, index: 1 })
                .select('-__v -dateCrea -_id'),
            BienModel.countDocuments({ ...filters }).exec(),
        ]);

        // Trier d'abord par index (si besoin), puis par statut personnalisé
        const biensAvecIndex = biens.filter(bien => bien.index > 0).sort((a, b) => a.index - b.index);
        const biensSansIndex = biens.filter(bien => bien.index === 0);
        const allSortedByIndex = [...biensAvecIndex, ...biensSansIndex];

        // Tri des statuts personnalisé
        const statusOrder = {
            'disponible': 0,
            'sous-compromis': 1,
            'non-disponible': 2,
            'vendu': 3
        };

        allSortedByIndex.sort((a, b) => {
            return (statusOrder[a.status] ?? 4) - (statusOrder[b.status] ?? 4);
        });

        const paginatedBiens = allSortedByIndex.slice(skip, skip + pageSize);

        const superficie = req.query.superficie;
        const getAllBienForUser = [];

        if(!getAdmin){
            for(const bien of paginatedBiens){
                if(superficie){
                    if (parseInt((bien.caracteristiques.split("#")[1].split("m")[0])) >= parseInt(superficie)){
                        getAllBienForUser.push(bien);
                    }
                } else{
                    getAllBienForUser.push(bien);
                }
            }
        }

        const hasMore = (page * pageSize) < totalNumberOfBiens;
        res.status(200).json({ biens : !getAdmin ? getAllBienForUser : paginatedBiens, hasMore });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur lors de la récupération des biens' });
    }
}

// mise a jour d'un bien 
exports.updateBien = async (req, res, next) => {
    const reference = req.query.ref;
    const newData = {...req.body};
    delete newData.ref;
    delete newData._id;
    
    try {
        const bien = await BienModel.findOne({ref: reference});
        if (!bien) {
            return res.status(404).json({message: "Bien non trouvé"});
        }
        
        // Garder _medias existant si non fourni
        if (!newData._medias && bien._medias) {
            newData._medias = bien._medias;
        }
        
        await BienModel.updateOne({ref: reference}, {...newData});
        return res.status(200).json({message: "Bien mis a jour avec succès"});
    } catch (error) {
        return res.status(500).json({message: "Erreur serveur"})
    }
}
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

exports.deleteBien = async (req, res, next) => {
    const reference = req.query.ref;
    try {
        const bien = await BienModel.findOne({ ref: reference });
        if (!bien) {
            return res.status(404).json({ message: "Bien non trouvé" });
        }

        // Vérification que _medias existe et est un objet
        if (!bien._medias || typeof bien._medias !== 'object') {
            // Suppression du bien dans la base de données
            await BienModel.deleteOne({ ref: reference });
            return res.status(200).json({ message: "Bien supprimé avec succès" });
        }

        // Initialisation d'un tableau pour stocker toutes les URLs trouvées
        const urlsToDelete = [];

        // Parcours de chaque propriété de _medias
        for (const key in bien._medias) {
            if (Object.hasOwnProperty.call(bien._medias, key)) {
                const mediaItem = bien._medias[key];
                // Vérification que mediaItem est un objet avec une propriété 'url'
                if (mediaItem && mediaItem.url && typeof mediaItem.url === 'string') {
                    urlsToDelete.push(mediaItem.url);
                }
            }
        }

        // Suppression des images depuis le cloud AWS
        for (const url of urlsToDelete) {
            const key = url.split('/')[1];
            const repertoire = url.split('/')[0];
            await deleteFile (key, repertoire)
        }

        // Suppression du bien dans la base de données
        await BienModel.deleteOne({ ref: reference });
        return res.status(200).json({ message: "Bien supprimé avec succès" });
    } catch (error) {
        console.error('Erreur lors de la suppression du bien :', error);
        return res.status(500).json({ message: "Erreur serveur" });
    }
}
