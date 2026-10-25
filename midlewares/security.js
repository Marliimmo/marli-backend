// Outils de sécurité partagés : limites de débit, piège anti-robot, validation et échappement.
require("dotenv").config();
const rateLimit = require("express-rate-limit");
const jwt = require("jsonwebtoken");

// Formulaires publics (contact, vendre, recherche) : 5 envois / 15 min / IP
exports.formLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { message: "Trop d'envois depuis cette connexion, réessayez dans quelques minutes." },
});

// Dépôt d'avis : 3 / heure / IP
exports.reviewLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 3,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { message: "Trop d'avis envoyés depuis cette connexion, réessayez plus tard." },
});

// Champ piège invisible ("hp_marli") : un humain ne le remplit jamais, un robot si.
// Nom choisi pour ne jamais être prérempli par la saisie automatique des navigateurs
// (l'ancien nom "website" pouvait l'être). On répond "succès" sans rien faire.
exports.honeypot = (req, res, next) => {
  if (req.body && typeof req.body.hp_marli === "string" && req.body.hp_marli.trim() !== "") {
    return res.status(200).json({ message: "message envoyé avec succès" });
  }
  next();
};

// Authentification facultative : marque la requête comme admin si le jeton est valide,
// sans bloquer les visiteurs. Sert aux routes publiques qui ont une vue admin.
exports.optionalAuth = (req, res, next) => {
  req.isAdmin = false;
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (token) {
    try {
      jwt.verify(token, `${process.env.JWT_KEY}`);
      req.isAdmin = true;
    } catch (e) { /* jeton absent ou expiré : vue publique */ }
  }
  next();
};

// Convertit une valeur reçue en texte simple (refuse les objets du type {"$ne": ...})
exports.str = (value, max = 500) => {
  if (value === undefined || value === null) return "";
  if (typeof value !== "string" && typeof value !== "number") return "";
  return String(value).trim().slice(0, max);
};

exports.isEmail = (value) => /^[^\s@<>"']+@[^\s@<>"']+\.[^\s@<>"']{2,}$/.test(value) && value.length <= 254;

exports.escapeHtml = (value) => String(value ?? "")
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;").replace(/'/g, "&#39;");

exports.escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
