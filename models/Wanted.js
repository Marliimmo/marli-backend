const mongoose = require('mongoose');

// Convertissez la date actuelle en français
const currentDate = new Date();
const dateDeCrea = currentDate.toISOString();

const Wanted = mongoose.Schema({ 
    urlImage: {type: String, required: true},
    dateAdd : {type: String, default: dateDeCrea},
    
});

module.exports = mongoose.model("Wanted", Wanted);