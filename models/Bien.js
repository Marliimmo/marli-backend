const mongoose = require('mongoose');
const uniqueValidator = require("mongoose-unique-validator");

const currentDate = new Date();
const options = { year: 'numeric', month: 'short' };

// Convertissez la date actuelle en français
const dateDeCrea = currentDate.toLocaleDateString('fr-FR', options);

const bienSchema = mongoose.Schema({ 
    status: {type: String, required: true, default: "non-disponible"},
    ref: {type: String, required: true},
    title: {type: String},
    index: {type: Number, default: 0},
    histoire : {type: String, required: true},
    localisation: {type: String, required: true},
    prix: {type: Number, required: true},
    caracteristiques: {type: String, required: true},
    dateCrea : {type: String, default: dateDeCrea},
    _medias : {
        image_galerie_0 : {
            url : {type: String}
        },
        image_galerie_1 : {
            url : {type: String}
        },
        image_galerie_2 : {
            url : {type: String}
        },
        image_galerie_3 : {
            url : {type: String}
        },
        image_galerie_4: {
            url : {type: String}
        },
        image_galerie_5: {
            url : {type: String}
        },
        image_galerie_6: {
            url : {type: String}
        },
        image_galerie_7: {
            url : {type: String}
        },
        image_galerie_8: {
            url : {type: String}
        },
        image_galerie_9: {
            url : {type: String}
        },
        image_galerie_10: {
            url : {type: String}
        },
        image_galerie_11: {
            url : {type: String}
        },
        image_galerie_12: {
            url : {type: String}
        },
        image_galerie_13: {
            url : {type: String}
        },
        image_galerie_14: {
            url : {type: String}
        },
        image_galerie_15: {
            url : {type: String}
        },
        image_galerie_16: {
            url : {type: String}
        },
        image_galerie_17: {
            url : {type: String}
        },
        image_galerie_18: {
            url : {type: String}
        },
        image_galerie_19: {
            url : {type: String}
        },
        image_galerie_20: {
            url : {type: String}
        },
        image_galerie_21: {
            url : {type: String}
        },
        image_galerie_22: {
            url : {type: String}
        },
        image_galerie_23: {
            url : {type: String}
        },
        image_galerie_24: {
            url : {type: String}
        },
        image_galerie_25: {
            url : {type: String}
        },
        image_galerie_26: {
            url : {type: String}
        },
        image_galerie_27: {
            url : {type: String}
        },
        image_galerie_28: {
            url : {type: String}
        },
        image_galerie_29: {
            url : {type: String}
        },
        image_galerie_30: {
            url : {type: String}
        },
    }
});

module.exports = mongoose.model("Bien", bienSchema);