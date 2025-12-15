require('dotenv').config();
const express = require("express");
const http = require('http');
const path = require('path');
const bodyParser = require("body-parser");

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 8090;

// Importation des differentes routes
const userRouteur = require("./routes/User/UserLog/user");
const imagesBienRouteur = require("./routes/Bien/GestionImages/GestionImages");
const bienRouteur = require("./routes/Bien/GestionBien/GestionBien");
const formNotifRouteur = require("./routes/FormNotif/FormNotif");
const pageRoutes = require("./routes/SiteConfig/pageRoutes");
const pageImageRoutes = require('./routes/pageImageRoutes');
const articleRouteur = require("./routes/Article/ArticleRoutes");
// importation et configuration de MongoDB
const mongoose = require("mongoose");
const mongoURI = process.env.MONGODB_URI;
console.log('MongoDB URI:', mongoURI);
mongoose.connect(mongoURI)
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));
 

// exporte les requetes en json dans le body
app.use(express.json());


// Gestion du cors (requêtte depuis des url inconnue);
const cors = require('cors');
const corsOptions = {
  origin: [
    'http://localhost:3000', 
    'http://localhost:3001',
    'https://marli-dashboard-three.vercel.app',
    'https://marli-dashboard-x1sb.vercel.app',
    'https://admin.marli-immobilier.com',
    'https://marli-immobilier.com',
    'https://front-marli.vercel.app',
    'https://marli-dashboard.vercel.app',
    'https://marli-backend.vercel.app'
  ],
  methods: 'GET,POST,PUT,DELETE,PATCH',
  allowedHeaders: 'Content-Type,Authorization',
};
```

**Commitez cette modification.**

---

## ⚡ EN ATTENDANT

**Testez le FRONT maintenant :**
```
https://front-marli.vercel.app

app.use(bodyParser.json({ limit: "10000mb" }));
app.use(bodyParser.urlencoded({ limit: "10000mb", extended: true }));


// app.use(cors());
// Gestion OPTIONS pour CORS
app.options('*', cors(corsOptions));
app.use(cors(corsOptions));

app.use('/user', [userRouteur]);
app.use('/bien', [bienRouteur, imagesBienRouteur]);
app.use('/form', [formNotifRouteur]);
app.use('/medias', express.static(path.join(__dirname, 'medias')));
app.use('/pages', pageRoutes);
app.use('/article', articleRouteur);
app.use('/page-images', pageImageRoutes);
app.use('/uploads', express.static('uploads'));
app.use('/imagesWanted', express.static(path.join(__dirname, 'imagesWanted')));

// Pour Vercel serverless
if (process.env.VERCEL) {
  module.exports = app;
} else {
  // Pour Render/serveurs classiques
  server.listen(port, (err) => {
    if(err) console.log(err.message);
    console.log(`Running on port ${port}`);
  });
}

