const mongoose = require('mongoose');


const Wanted = mongoose.Schema({ 
    urlImage: {type: String, required: true},
    // champs envoyés par le dashboard, auparavant perdus faute d'être déclarés
    title: {type: String},
    caracteristiques: {type: String},
    history: {type: String},
    dateAdd : {type: String, default: () => new Date().toISOString()},
    
});

module.exports = mongoose.model("Wanted", Wanted);