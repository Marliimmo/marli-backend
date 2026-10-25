const { notifForUser, NewContactUser } =  require("../../midlewares/notificationEmail/newContactUsNotif");
const { wantedUser, notifForUserWanted } =  require("../../midlewares/notificationEmail/wantedNotif");
const { sellingUser, notifForUserSelling } =  require("../../midlewares/notificationEmail/sellingNotif");
const { str, isEmail, escapeHtml } = require("../../midlewares/security");

// Nettoie et échappe les champs reçus : texte simple, longueur bornée, HTML neutralisé
// (ils sont insérés dans des e-mails HTML).
const clean = (body, fields) => {
    const out = {};
    for (const [name, max] of Object.entries(fields)) out[name] = escapeHtml(str(body?.[name], max));
    return out;
};

const checkIdentity = (body) => {
    const email = str(body?.email, 254);
    const name = str(body?.name, 120);
    if (!name || !isEmail(email)) return null;
    return { email, name: escapeHtml(name) };
};

exports.contactUs = async (req, res, next) =>{
    const who = checkIdentity(req.body);
    const d = clean(req.body, { titleMessage: 200, motif: 100, phone: 30, contenu: 5000 });
    if (!who || !d.contenu) return res.status(400).json({ message: "Nom, e-mail valide et message obligatoires" });
    try {
        await NewContactUser(d.titleMessage, d.motif, who.name, escapeHtml(who.email), d.phone, d.contenu);
        // L'accusé de réception au visiteur ne doit pas faire échouer l'envoi principal
        await notifForUser(who.email, who.name).catch((e) => console.error("accusé de réception :", e));
        return res.status(200).json({message: "message envoyé avec succès"});
    } catch (error) {
        console.error("contactUs:", error);
        return res.status(500).json({message: "Erreur serveur"})
    }
}

exports.wanted = async (req, res, next) =>{
    const who = checkIdentity(req.body);
    const d = clean(req.body, { localisation: 200, typeBien: 100, superficie: 30, pieces: 30, budget: 30, phone: 30, message: 5000 });
    if (!who) return res.status(400).json({ message: "Nom et e-mail valide obligatoires" });
    try {
        await wantedUser(d.localisation, d.typeBien, d.superficie, d.pieces, d.budget, who.name, escapeHtml(who.email), d.phone, d.message);
        // L'accusé de réception au visiteur ne doit pas faire échouer l'envoi principal
        await notifForUserWanted(who.email, who.name).catch((e) => console.error("accusé de réception :", e));
        return res.status(200).json({message: "message envoyé avec succès"});
    } catch (error) {
        console.error("wanted:", error);
        return res.status(500).json({message: "Erreur serveur"})
    }
}

exports.selling = async (req, res, next) =>{
    const who = checkIdentity(req.body);
    const d = clean(req.body, { localisation: 200, typeBien: 100, superficie: 30, pieces: 30, phone: 30, message: 5000 });
    if (!who) return res.status(400).json({ message: "Nom et e-mail valide obligatoires" });
    try {
        await sellingUser(d.localisation, d.typeBien, d.superficie, d.pieces, who.name, escapeHtml(who.email), d.phone, d.message);
        // L'accusé de réception au visiteur ne doit pas faire échouer l'envoi principal
        await notifForUserSelling(who.email, who.name).catch((e) => console.error("accusé de réception :", e));
        return res.status(200).json({message: "message envoyé avec succès"});
    } catch (error) {
        console.error("selling:", error);
        return res.status(500).json({message: "Erreur serveur"})
    }
}
