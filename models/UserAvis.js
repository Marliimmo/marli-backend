const mongoose = require('mongoose');

// Convertissez la date actuelle en français
const currentDate = new Date();
const dateDeCrea = currentDate.toISOString();

const userAvisSchema = mongoose.Schema({ 
    status: {type: String, required: true, default: "not-valid"},
    urlImage: {type: String},
    stars: {type: Number, required: true},
    pseudo: {type: String, required: true},
    description: {type: String, required: true},
    dateAdd : {type: String, default: dateDeCrea},
    
});

module.exports = mongoose.model("UserAvis", userAvisSchema);