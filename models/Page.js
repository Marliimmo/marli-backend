const mongoose = require('mongoose');

const PagesSchema = new mongoose.Schema({
  phone: { type: String, required: true },
  email: { type: String, required: true },
  address: { type: String, required: true },
  presidente: { type: [String], required: true },
  agence: { type: [String], required: true },

  homepage: {
    intro: { type: String, default: "Nous souhaitons faciliter vos projets immobiliers de leur conception à leur aboutissement." },
    satisfaction: { type: String, default: "Votre satisfaction sera notre première gratitude." },
    acheter: { type: [String], default: ["Identification de votre besoin", "Sélection et visite ciblées", "Négociation financière", "Compromis, signature"] },
    vendre: { type: [String], default: ["Estimation", "Valorisation et mise en lumière", "Commercialisation", "Portefeuille clients acquéreurs conséquent"] },
    investir: { type: [String], default: ["Chasseur de bien", "Résidences secondaires au Sénégal, destination soleil 365/365j", "Accompagnement, étude de faisabilité et rentabilité"] }
  },
  vendrePage: {
    titre: { type: String, default: "Une estimation au prix juste" },
    textes: { type: [String], default: [
      "Chaque bien est unique. Sa valeur dépend de plusieurs variables.",
      "Année de construction, standing, rareté, état général du bien et du bâtiment.",
      "Environnement visuel et sonore, positionnement par rapport à des biens similaires, marché local.",
      "Plus notre petit doigt…"
    ]}
  },
  acheterPage: {
    titre: { type: String, default: "INVESTIR DANS L’IMMOBILIER" },
    textes: { type: [String], default: [
      "Accompagnement, étude de rentabilité",
      "Recherche de biens en France et au Sénégal",
      "Sénégal, destination soleil durant toute l’année, pour vous dénicher le bien qui correspond à vos attentes"
    ]}
  }
}, { collection: 'pages' });

module.exports = mongoose.model('Pages', PagesSchema);
