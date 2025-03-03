const mongoose = require('mongoose');

const PagesSchema = new mongoose.Schema({
  phone: { type: String, required: true },
  email: { type: String, required: true },
  address: { type: String, required: true },
  presidente: { type: [String], required: true },
  agence: { type: [String], required: true }, 
}, { collection: 'pages' });

module.exports = mongoose.model('Pages', PagesSchema);
