const BienModel = require("../../../models/Bien");
const crypto = require('crypto');
const { deleteFile } = require("../../../midlewares/aws-s3-config/aws-config");

const BASE_URL = 'https://res.cloudinary.com/dmsnf2wye/image/upload';

// Fonction pour ajouter l'URL complète aux images UNIQUEMENT si nécessaire
const addFullUrlToImages = (bien) => {
    if (bien._medias && typeof bien._medias === 'object') {
        for (const key in bien._medias) {
            if (bien._medias[key] && bien._medias[key].url) {
                const url = bien._medias[key].url;
                
                // Si l'URL commence déjà par http:// ou https://, on la laisse telle quelle
                if (!url.startsWith('http://') && !url.startsWith('https://')) {
                    // Sinon, on ajoute le BASE_URL
                    bien._medias[key].url = `${BASE_URL}/${url}`;
                }
                // Sinon l'URL est déjà complète, on ne fait rien
            }
        }
    }
    return bien;
};

// Création d'un code aléatoire unique 
const generateRandomCode = () => {
    const currentDate = new Date();
    const milliseconds = currentDate.getMilliseconds().toString().padStart(3, "0");
    const seconds = currentDate.getSeconds().toString().padStart(2, "0");
    const randomBytes = crypto.randomBytes(3);
    const randomString = randomBytes.toString("base64");
    const randomCharacters = randomString
        .replace(/[+/=]/g, '')
        .slice(0, 6);

    const sixCharacterCode = randomCharacters + milliseconds + seconds;
    return sixCharacterCode.slice(0, 6);
};

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
        let bien = await BienModel.findOne({ref: reference}).select("-__v -dateCrea -_id");
        if(!bien){
            return res.status(404).json({message: "Bien non trouvé"});
        }

        bien = bien.toObject();
        bien = addFullUrlToImages(bien);

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
                .sort({ _id: ordreTri })
                .select('-__v -dateCrea -_id'),
            BienModel.countDocuments({ ...filters }).exec(),
        ]);
    
        const biensAvecIndex = await biens.filter(bien => bien.index > 0).sort((a, b) => a.index - b.index);
        const biensSansIndex = await biens.filter(bien => bien.index === 0);
        const sortedBiens = [...biensAvecIndex, ...biensSansIndex];
    
        const paginatedBiens = sortedBiens.slice(skip, skip + pageSize);

        const superficie = req.query.superficie;
        const getAllBienForUser = [];
        if(!getAdmin){
            for(const bien of paginatedBiens){
                let bienObj = bien.toObject();
                bienObj = addFullUrlToImages(bienObj);
                
                if(superficie){
                    if (parseInt((bienObj.caracteristiques.split("#")[1].split("m")[0])) >= parseInt(superficie)){
                        getAllBienForUser.push(bienObj);
                    }
                } else{
                    getAllBienForUser.push(bienObj);
                }
            }
        } else {
            for(const bien of paginatedBiens){
                let bienObj = bien.toObject();
                bienObj = addFullUrlToImages(bienObj);
                getAllBienForUser.push(bienObj);
            }
        }
    
        const hasMore = (page * pageSize) < totalNumberOfBiens;
        res.status(200).json({ biens : getAllBienForUser, hasMore });
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

exports.deleteBien = async (req, res, next) => {
    const reference = req.query.ref;
    try {
        const bien = await BienModel.findOne({ ref: reference });
        if (!bien) {
            return res.status(404).json({ message: "Bien non trouvé" });
        }

        if (!bien._medias || typeof bien._medias !== 'object') {
            await BienModel.deleteOne({ ref: reference });
            return res.status(200).json({ message: "Bien supprimé avec succès" });
        }

        const urlsToDelete = [];

        for (const key in bien._medias) {
            if (Object.hasOwnProperty.call(bien._medias, key)) {
                const mediaItem = bien._medias[key];
                if (mediaItem && mediaItem.url && typeof mediaItem.url === 'string') {
                    urlsToDelete.push(mediaItem.url);
                }
            }
        }

        for (const url of urlsToDelete) {
            const key = url.split('/')[1];
            const repertoire = url.split('/')[0];
            await deleteFile (key, repertoire)
        }

        await BienModel.deleteOne({ ref: reference });
        return res.status(200).json({ message: "Bien supprimé avec succès" });
    } catch (error) {
        console.error('Erreur lors de la suppression du bien :', error);
        return res.status(500).json({ message: "Erreur serveur" });
    }
}
