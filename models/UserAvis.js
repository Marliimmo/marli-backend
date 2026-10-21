const mongoose = require('mongoose');


const userAvisSchema = mongoose.Schema({ 
    status: {type: String, required: true, default: "not-valid"},
    urlImage: {type: String},
    stars: {type: Number, required: true},
    pseudo: {type: String, required: true},
    description: {type: String, required: true},
    dateAdd : {type: String, default: () => new Date().toISOString()},
    
});

module.exports = mongoose.model("UserAvis", userAvisSchema);