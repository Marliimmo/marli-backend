require('dotenv').config();
const express = require("express");
const cors = require('cors');
const http = require('http');
const path = require('path');
const bodyParser = require("body-parser");
const app = express();
const cors = require('cors');
app.use(cors({
  origin: ['https://marli-immobilier.com', 'https://marli.netlify.app', 'http://localhost:3000'],
  credentials: true
}));
const server = http.createServer(app);
const port = process.env.PORT || 8090;

// Importation des differentes routes
const userRouteur = require("./routes/User/UserLog/user");
const imagesBienRouteur = require("./routes/Bien/GestionImages/GestionImages");
const bienRouteur = require("./routes/Bien/GestionBien/GestionBien");
const formNotifRouteur = require("./routes/FormNotif/FormNotif");
// const pageRoutes = require("./routes/SiteConfig/pageRoutes");
// const pageImageRoutes = require('./routes/pageImageRoutes');

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
  origin: [
    'http://localhost:3000',
    'http://localhost:3001/dashboard/connexion',
    'http://localhost:3001',
    'https://marli-dashboard-three.vercel.app',
    'https://marli-dashboard-three.vercel.app/dashboard/connexion',
    'https://marli-immobilier.com',
    'https://front-marli-ochre.vercel.app',
    'https://front-marli-git-main-marli-immobiliers-projects.vercel.app'
  ],
  methods: 'GET,POST,PUT,DELETE,PATCH',
  allowedHeaders: 'Content-Type,Authorization'
};

app.use(bodyParser.json({ limit: "10000mb" }));
app.use(bodyParser.urlencoded({ limit: "10000mb", extended: true }));


// app.use(cors());
app.use(cors(corsOptions));

app.use('/user', [userRouteur]);
app.use('/bien', [bienRouteur, imagesBienRouteur]);
app.use('/form', [formNotifRouteur]);
app.use('/medias', express.static(path.join(__dirname, 'medias')));
// app.use('/pages', pageRoutes);
// app.use('/page-images', pageImageRoutes);
app.use('/uploads', express.static('uploads')); // pour servir les images

server.listen(port, (err)=>{
  if(err) console.log(err.message)
  console.log(`Running on port ${port}`);
})
