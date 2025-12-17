require('dotenv').config();
const express = require("express");
const http = require('http');
const path = require('path');
const bodyParser = require("body-parser");

const app = express();
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
console.log('MongoDB URI:', mongoURI);
mongoose.connect(mongoURI)
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

app.use(express.json());

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
    'https://marli-dashboard.vercel.app'
  ],
  methods: 'GET,POST,PUT,DELETE,PATCH',
  allowedHeaders: 'Content-Type,Authorization',
};
origin: function (origin, callback) {
  const allowed = [
    'http://localhost:3000',
    'https://marli-immobilier.com',
    'https://admin.marli-immobilier.com'
  ];
  
  if (!origin || allowed.includes(origin) || origin.includes('.vercel.app')) {
    callback(null, true);
  } else {
    callback(new Error('Not allowed by CORS'));
  }
},
app.use(bodyParser.json({ limit: "10000mb" }));
app.use(bodyParser.urlencoded({ limit: "10000mb", extended: true }));

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

server.listen(port, (err) => {
  if(err) console.log(err.message);
  console.log(`Running on port ${port}`);
});

