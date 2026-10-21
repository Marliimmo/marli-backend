const BienModel = require("../../../models/Bien");
const crypto = require('crypto');
const { deleteFile } = require("../../../midlewares/aws-s3-config/aws-config");
const { deleteFromCloudinary } = require("../../../midlewares/cloudinary-config");
const { str, escapeRegex } = require("../../../midlewares/security");

// Surface (m²) lue dans les caractéristiques "Type#120m²#..." ; null si illisible
const surfaceDe = (caracteristiques) => {
    const morceau = String(caracteristiques || '').split('#')[1] || '';
    const n = parseInt(morceau, 10);
    return Number.isFinite(n) ? n : null;
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
    const reference = str(req.query.ref, 20);
    if (!reference) return res.status(400).json({message: "Référence manquante"});
    
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
    const pageSize = Math.min(parseInt(req.query.pageSize) || 10, 1000);
    // La vue admin (biens non disponibles compris) est réservée au dashboard connecté.
    const getAdmin = req.query.getAdmin && req.isAdmin;

    if (page <= 0 || pageSize <= 0) {
        return res.status(400).json({ error: 'Mauvaise demande de pagination' });
    }
    const skip = (page - 1) * pageSize;

    // Tous les paramètres sont convertis en texte simple : un objet du type
    // status[$ne]=... ne peut plus être injecté dans la requête MongoDB.
    const filters = {};
    const bienId = str(req.query.bienId, 20);
    const status = str(req.query.status, 30);
    const typeBien = str(req.query.typeBien, 60);
    const localisation = str(req.query.localisation, 100);
    const budgets = parseInt(req.query.budgets, 10);
    const superficie = parseInt(req.query.superficie, 10);

    if (bienId) filters.ref = bienId;
    if (status) filters.status = status;
    if (typeBien) filters.caracteristiques = { $regex: new RegExp(escapeRegex(typeBien), 'i') };
    if (Number.isFinite(budgets)) filters.prix = { $lte: budgets };
    if (localisation) filters.localisation = { $regex: new RegExp(escapeRegex(localisation), 'i') };

    const baseFilter = getAdmin ? { ...filters } : { status: { $ne: "non-disponible" }, ...filters };
    if (!getAdmin && status) baseFilter.status = status === "non-disponible" ? "__aucun__" : status;

    try {
        let biens = await BienModel.find(baseFilter)
            .sort({ dateCrea: -1, index: 1 })
            .select('-__v -dateCrea -_id');

        // Filtre de surface appliqué AVANT la pagination (avant : après, d'où des pages incomplètes)
        if (!getAdmin && Number.isFinite(superficie)) {
            biens = biens.filter((b) => (surfaceDe(b.caracteristiques) ?? 0) >= superficie);
        }

        const biensAvecIndex = biens.filter(bien => bien.index > 0).sort((a, b) => a.index - b.index);
        const biensSansIndex = biens.filter(bien => !(bien.index > 0));
        const allSortedByIndex = [...biensAvecIndex, ...biensSansIndex];

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
        const hasMore = (page * pageSize) < allSortedByIndex.length;
        res.status(200).json({ biens: paginatedBiens, hasMore });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur lors de la récupération des biens' });
    }
}

// mise a jour d'un bien 
exports.updateBien = async (req, res, next) => {
    const reference = str(req.query.ref, 20);
    const newData = {...req.body};
    delete newData.ref;
    delete newData._id;
    
    try {
        const bien = await BienModel.findOne({ref: reference});
        if (!bien) {
            return res.status(404).json({message: "Bien non trouvé"});
        }
        
        if (!newData._medias && bien._medias) {
            newData._medias = bien._medias;
        }
        
        await BienModel.updateOne({ref: reference}, {...newData});
        return res.status(200).json({message: "Bien mis a jour avec succès"});
    } catch (error) {
        return res.status(500).json({message: "Erreur serveur"})
    }
}

// suppression d'un bien
exports.deleteBien = async (req, res, next) => {
    const reference = str(req.query.ref, 20);
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

        // Les médias sont sur Cloudinary (URL complète) ; les très anciens sur S3 ("repertoire/cle").
        // Un échec de suppression d'un média ne doit jamais empêcher la suppression du bien
        // (avant : une URL Cloudinary faisait planter la suppression S3 et le bien restait en ligne).
        for (const url of urlsToDelete) {
            try {
                if (url.startsWith('http')) {
                    await deleteFromCloudinary(url);
                } else {
                    const [repertoire, key] = url.split('/');
                    if (repertoire && key) await deleteFile(key, repertoire);
                }
            } catch (e) {
                console.error('Média non supprimé :', url, e.message);
            }
        }

        await BienModel.deleteOne({ ref: reference });
        return res.status(200).json({ message: "Bien supprimé avec succès" });
    } catch (error) {
        console.error('Erreur lors de la suppression du bien :', error);
        return res.status(500).json({ message: "Erreur serveur" });
    }
}
