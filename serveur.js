require('dotenv').config();
const express = require("express");
const cors = require('cors');
const http = require('http');
const path = require('path');
const bodyParser = require("body-parser");

const app = express();

// CORS en premier
app.use(cors({
  origin: '*',
  credentials: true
}));

const server = http.createServer(app);
const port = process.env.PORT || 8090;

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
app.use(bodyParser.json({ limit: "10000mb" }));
app.use(bodyParser.urlencoded({ limit: "10000mb", extended: true }));

// Routes
app.use('/user', [userRouteur]);
app.use('/bien', [bienRouteur, imagesBienRouteur]);
app.use('/form', [formNotifRouteur]);

// Routes statiques pour les images
app.use('/medias', express.static(path.join(__dirname, 'medias')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/imagesBienMarli', express.static(path.join(__dirname, 'imagesBienMarli')));

server.listen(port, (err)=>{
  if(err) console.log(err.message)
  console.log(`Running on port ${port}`);
});