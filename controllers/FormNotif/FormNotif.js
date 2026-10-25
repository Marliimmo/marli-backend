const { notifForUser, NewContactUser } =  require("../../midlewares/notificationEmail/newContactUsNotif");
const { wantedUser, notifForUserWanted } =  require("../../midlewares/notificationEmail/wantedNotif");
const { sellingUser, notifForUserSelling } =  require("../../midlewares/notificationEmail/sellingNotif");
const { str, isEmail, escapeHtml } = require("../../midlewares/security");
const Message = require("../../models/Message");

// Texte simple, longueur bornée
const lire = (body, fields) => {
    const out = {};
    for (const [name, max] of Object.entries(fields)) out[name] = str(body?.[name], max);
    return out;
};
const echapper = (obj) => Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, escapeHtml(v)]));

// 1. enregistre le message (rien ne se perd), 2. prévient l'agence, 3. accuse réception
async function traiter(res, type, data, envoiAdmin, accuse) {
    if (!data.name || !isEmail(data.email)) {
        return res.status(400).json({ message: "Nom et e-mail valide obligatoires" });
    }
    let message = null;
    try {
        message = await Message.create({ type, ...data });
    } catch (e) {
        console.error(`${type} : enregistrement impossible`, e.message);
    }
    const h = echapper(data);
    try {
        await envoiAdmin(h);
        if (message) await Message.updateOne({ _id: message._id }, { emailEnvoye: true }).catch(() => {});
    } catch (error) {
        console.error(`${type} : e-mail à l'agence non envoyé`, error);
        // Message enregistré : l'internaute n'a pas à recommencer, il sera visible dans le dashboard
        if (!message) return res.status(500).json({ message: "Erreur serveur" });
    }
    // L'accusé de réception au visiteur ne doit pas faire échouer la demande
    await accuse(data.email, h.name).catch((e) => console.error("accusé de réception :", e));
    return res.status(200).json({ message: "message envoyé avec succès" });
}

exports.contactUs = (req, res) => {
    const d = lire(req.body, { name: 120, email: 254, phone: 30, titleMessage: 200, motif: 100, contenu: 5000 });
    if (!d.contenu) return res.status(400).json({ message: "Message obligatoire" });
    const data = { name: d.name, email: d.email, phone: d.phone, titre: d.titleMessage, motif: d.motif, contenu: d.contenu };
    return traiter(res, 'contact', data,
        (h) => NewContactUser(h.titre, h.motif, h.name, h.email, h.phone, h.contenu), notifForUser);
};

exports.wanted = (req, res) => {
    const d = lire(req.body, { name: 120, email: 254, phone: 30, localisation: 200, typeBien: 100, superficie: 30, pieces: 30, budget: 30, message: 5000 });
    const data = { name: d.name, email: d.email, phone: d.phone, localisation: d.localisation, typeBien: d.typeBien,
        superficie: d.superficie, pieces: d.pieces, budget: d.budget, contenu: d.message };
    return traiter(res, 'recherche', data,
        (h) => wantedUser(h.localisation, h.typeBien, h.superficie, h.pieces, h.budget, h.name, h.email, h.phone, h.contenu), notifForUserWanted);
};

exports.selling = (req, res) => {
    const d = lire(req.body, { name: 120, email: 254, phone: 30, localisation: 200, typeBien: 100, superficie: 30, pieces: 30, message: 5000 });
    const data = { name: d.name, email: d.email, phone: d.phone, localisation: d.localisation, typeBien: d.typeBien,
        superficie: d.superficie, pieces: d.pieces, contenu: d.message };
    return traiter(res, 'vendre', data,
        (h) => sellingUser(h.localisation, h.typeBien, h.superficie, h.pieces, h.name, h.email, h.phone, h.contenu), notifForUserSelling);
};

// ---------- Dashboard (connexion requise)
exports.listMessages = async (req, res) => {
    try {
        const messages = await Message.find().select('-__v').sort({ dateAdd: -1 }).limit(500);
        res.status(200).json(messages);
    } catch (e) { res.status(500).json({ message: "Erreur serveur" }); }
};

exports.markMessage = async (req, res) => {
    try {
        const r = await Message.updateOne({ _id: str(req.params.id, 40) }, { lu: req.body?.lu !== false });
        if (!r.matchedCount) return res.status(404).json({ message: "Message introuvable" });
        res.status(200).json({ message: "ok" });
    } catch (e) { res.status(400).json({ message: "Identifiant invalide" }); }
};

exports.deleteMessage = async (req, res) => {
    try {
        const r = await Message.deleteOne({ _id: str(req.params.id, 40) });
        if (!r.deletedCount) return res.status(404).json({ message: "Message introuvable" });
        res.status(200).json({ message: "Message supprimé" });
    } catch (e) { res.status(400).json({ message: "Identifiant invalide" }); }
};
