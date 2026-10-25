const mongoose = require('mongoose');

// Copie de chaque message envoyé par les formulaires du site.
// Rien n'est perdu même si l'envoi de l'e-mail échoue ; consultable dans le dashboard.
const messageSchema = mongoose.Schema({
  type: { type: String, enum: ['contact', 'vendre', 'recherche'], required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, default: '' },
  titre: { type: String, default: '' },
  motif: { type: String, default: '' },
  localisation: { type: String, default: '' },
  typeBien: { type: String, default: '' },
  superficie: { type: String, default: '' },
  pieces: { type: String, default: '' },
  budget: { type: String, default: '' },
  contenu: { type: String, default: '' },
  emailEnvoye: { type: Boolean, default: false },
  lu: { type: Boolean, default: false },
  dateAdd: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Message', messageSchema);
