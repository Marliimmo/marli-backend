require('dotenv').config();
const express = require("express");
const http = require('http');
const path = require('path');
const bodyParser = require("body-parser");
const app = express();
// Render place l'app derrière un proxy : nécessaire pour que les limites de débit
// voient la vraie IP du visiteur (sinon tous les visiteurs partagent le même compteur).
app.set('trust proxy', 1);
app.disable('x-powered-by');
app.get("/health", (req, res) => res.status(200).send("ok"));
const server = http.createServer(app);
const port = process.env.PORT || 8090;
const userRouteur = require("./routes/User/UserLog/user");
const imagesBienRouteur = require("./routes/Bien/GestionImages/GestionImages");
const bienRouteur = require("./routes/Bien/GestionBien/GestionBien");
const formNotifRouteur = require("./routes/FormNotif/FormNotif");
const pageRoutes = require("./routes/SiteConfig/pageRoutes");
const pageImageRoutes = require('./routes/pageImageRoutes');
const articleRouteur = require("./routes/Article/ArticleRoutes");
const mongoose = require("mongoose");

const mongoURI = process.env.MONGODB_URI;

mongoose.connect(mongoURI)
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch((err) => console.error('Connexion à MongoDB échouée !', err.message));


const cors = require('cors');
const corsOptions = {
  origin: function (origin, callback) {
    const allowed = [
      'http://localhost:3000',
      'http://localhost:3001',
      'https://marli-dashboard-three.vercel.app',
      'https://marli-dashboard-x1sb.vercel.app',
      'https://marli-dashboard-zeta.vercel.app',
      'https://admin.marli-immobilier.com',
      'https://marli-immobilier.com',
      'https://www.marli-immobilier.com',
      'https://front-marli.vercel.app',
      'https://marli-dashboard.vercel.app'
    ];
    
    // Autorise les déploiements de prévisualisation Vercel de TES projets uniquement
    // (ex: front-marli-git-ma-branche-marliimmo.vercel.app), plus la liste fixe ci-dessus.
    // Avant, n'importe quel site déployé sur vercel.app (même d'un inconnu) était autorisé.
    const isOwnVercelPreview = origin && /^https:\/\/(front-marli|marli-dashboard)[a-z0-9-]*\.vercel\.app$/.test(origin);

    if (!origin || allowed.includes(origin) || isOwnVercelPreview) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: 'GET,POST,PUT,DELETE,PATCH',
  allowedHeaders: 'Content-Type,Authorization',
};

// Les fichiers passent par multer (upload.js) : le JSON n'a besoin que de quelques Mo.
app.use(bodyParser.json({ limit: "5mb" }));
app.use(bodyParser.urlencoded({ limit: "5mb", extended: true }));

// En-têtes de sécurité de base
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});
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

// Gestion d'erreurs centralisée : réponses JSON propres au lieu de pages d'erreur HTML
app.use((err, req, res, next) => {
  if (err && err.message === 'Not allowed by CORS') {
    return res.status(403).json({ message: 'Origine non autorisée' });
  }
  if (err && err.name === 'MulterError') {
    return res.status(400).json({ message: `Fichier refusé : ${err.message}` });
  }
  if (err && err.type === 'entity.too.large') {
    return res.status(413).json({ message: 'Requête trop volumineuse' });
  }
  console.error(err);
  return res.status(500).json({ message: 'Erreur serveur' });
});

server.listen(port, (err) => {
  if(err) console.log(err.message);
  console.log(`Running on port ${port}`);
});
