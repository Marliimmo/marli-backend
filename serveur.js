require('dotenv').config();
const express = require("express");
const http = require('http');
const path = require('path');

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 8080;

// Importation des differentes routes
const userRouteur = require("./routes/User/UserLog/user");
const imagesBienRouteur = require("./routes/Bien/GestionImages/GestionImages");
const bienRouteur = require("./routes/Bien/GestionBien/GestionBien");
const formNotifRouteur = require("./routes/FormNotif/FormNotif");


// importation et configuration de MongoDB
const mongoose = require("mongoose");
const mongoURI = process.env.MONGODB_URI;

mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));
 

// exporte les requetes en json dans le body
app.use(express.json());


// Gestion du cors (requêtte depuis des url inconnue);
const cors = require('cors');
const corsOptions = {
  origin: ['http://localhost:3000', 'https://marli-dashboard.vercel.app','https://choosews.com', 'https://choosews.com/marli', 'https://marli-immobilier.com', 'https://choosews.com/dashboard'] 
};

// app.use(cors());
app.use(cors(corsOptions));

app.use('/user', [userRouteur]);
app.use('/bien', [bienRouteur, imagesBienRouteur]);
app.use('/form', [formNotifRouteur]);
app.use('/medias', express.static(path.join(__dirname, 'medias')));


server.listen(port, (err)=>{
  if(err) console.log(err.message)
  console.log(`Running on port ${port}`);
})
