#!/bin/bash

echo "🚀 Configuration Cloudinary Express - AUTO"
echo "=========================================="
echo ""

# Vos credentials Cloudinary
CLOUD_NAME="dmsnf2wye"
API_KEY="139174873651433"
API_SECRET="2Ub_AKwt-Ruwy-Nb6PKFukwNsrI"

# 1. Créer le fichier .env
echo "💾 Création du fichier .env..."
cat > .env << EOF
CLOUDINARY_CLOUD_NAME=$CLOUD_NAME
CLOUDINARY_API_KEY=$API_KEY
CLOUDINARY_API_SECRET=$API_SECRET
PORT=5000
EOF

# 2. Installer les dépendances
echo ""
echo "📦 Installation de cloudinary..."
npm install cloudinary multer-storage-cloudinary --save --loglevel=error

# 3. Créer la config Cloudinary
echo ""
echo "⚙️ Configuration de Cloudinary..."
cat > cloudinary.config.js << 'EOF'
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

module.exports = cloudinary;
EOF

# 4. Créer le système d'upload
echo ""
echo "📤 Création du système d'upload..."
cat > uploadConfig.js << 'EOF'
const cloudinary = require('./cloudinary.config');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'marli/biens',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    transformation: [{ width: 1200, height: 800, crop: 'limit' }]
  }
});

const upload = multer({ storage: storage });

module.exports = upload;
EOF

# 5. Git add et commit
echo ""
echo "📤 Push vers Git..."
git add .
git commit -m "Fix: Configuration Cloudinary complète"
git push origin main

echo ""
echo "✅ TERMINÉ!"
echo ""
echo "🌐 Sur Netlify, ajoutez ces 3 variables:"
echo "   CLOUDINARY_CLOUD_NAME=dmsnf2wye"
echo "   CLOUDINARY_API_KEY=139174873651433"
echo "   CLOUDINARY_API_SECRET=2Ub_AKwt-Ruwy-Nb6PKFukwNsrI"
echo ""
echo "Puis redéployez. C'est tout! 🎉"
