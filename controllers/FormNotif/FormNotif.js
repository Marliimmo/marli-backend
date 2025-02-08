const { notifForUser, NewContactUser } =  require("../../midlewares/notificationEmail/newContactUsNotif");
const { wantedUser, notifForUserWanted } =  require("../../midlewares/notificationEmail/wantedNotif");
const { sellingUser, notifForUserSelling } =  require("../../midlewares/notificationEmail/sellingNotif");

exports.contactUs = async (req, res, next) =>{
    const bodyData = req.body;
    try {
        await NewContactUser(bodyData?.titleMessage, bodyData?.motif, bodyData?.name, bodyData?.email, bodyData?.phone, bodyData?.contenu);
        await notifForUser(bodyData?.email, bodyData?.name);
    
        return res.status(200).json({message: "message envoyé avec succès"});
    } catch (error) {
        return res.status(500).json({message: "Erreur serveur", error})
    }
}

exports.wanted = async (req, res, next) =>{
    const bodyData = req.body;
    try {
        await wantedUser(bodyData?.localisation, bodyData?.typeBien, bodyData?.superficie, bodyData?.pieces, bodyData?.budget, bodyData?.name, bodyData?.email, bodyData?.phone, bodyData?.message);
        await notifForUserWanted(bodyData?.email, bodyData?.name);
    
        return res.status(200).json({message: "message envoyé avec succès"});
    } catch (error) {
        return res.status(500).json({message: "Erreur serveur", error})
    }
}

exports.selling = async (req, res, next) =>{
    const bodyData = req.body;
    try {
        await sellingUser(bodyData?.localisation, bodyData?.typeBien, bodyData?.superficie, bodyData?.pieces, bodyData?.name, bodyData?.email, bodyData?.phone, bodyData?.message);
        await notifForUserSelling(bodyData?.email, bodyData?.name);
    
        return res.status(200).json({message: "message envoyé avec succès"});
    } catch (error) {
        return res.status(500).json({message: "Erreur serveur", error})
    }
}