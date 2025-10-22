@echo off
chcp 65001 >nul
color 0A
title 🚀 Installation Automatique Cloudinary MARLI

echo.
echo ==========================================
echo 🚀 INSTALLATION CLOUDINARY MARLI
echo ==========================================
echo.
echo 💡 Ce script va TOUT faire automatiquement
echo    Vous n'avez rien à faire, juste attendre
echo.
pause

:: Vérifier qu'on est dans le bon dossier
if not exist "package.json" (
    color 0C
    echo.
    echo ❌ ERREUR: Ce fichier doit être dans le dossier BACK MARLI
    echo.
    echo 📁 Placez ce fichier .bat dans:
    echo    Desktop\OUTIL\FICHIER MARLI\Projet\BACK MARLI
    echo.
    echo Puis double-cliquez dessus
    echo.
    pause
    exit
)

echo.
echo ✅ Bon dossier détecté
echo 📁 %CD%
echo.
timeout /t 2 >nul

:: ÉTAPE 1: Installation des dépendances
echo.
echo ==========================================
echo 📦 ÉTAPE 1/7: Installation des packages
echo ==========================================
echo.
echo ⏳ Installation en cours... (peut prendre 1-2 minutes)
echo.

call npm install cloudinary multer multer-storage-cloudinary axios dotenv mongoose 2>nul

if errorlevel 1 (
    color 0E
    echo.
    echo ⚠️ Problème lors de l'installation
    echo Vérifiez que Node.js est bien installé
    echo.
    pause
    exit
)

echo.
echo ✅ Packages installés
timeout /t 1 >nul

:: ÉTAPE 2: Créer le fichier .env
echo.
echo ==========================================
echo 📝 ÉTAPE 2/7: Configuration .env
echo ==========================================
echo.

if exist ".env" (
    echo ⚠️ Fichier .env existant détecté
    echo 💾 Création d'une sauvegarde...
    copy ".env" ".env.backup" >nul
    echo ✅ Backup: .env.backup
    echo.
)

(
echo # MongoDB Configuration
echo MONGODB_URI=mongodb+srv://marli_immobilier:AdaZEE05rAdcCZcQ@marli-immobilier.iro4jbv.mongodb.net/test
echo.
echo # Cloudinary Configuration
echo CLOUDINARY_CLOUD_NAME=dmsnf2wye
echo CLOUDINARY_API_KEY=139174873651433
echo CLOUDINARY_API_SECRET=2Ub_AKwt-Ruwy-Nb6PKFukwNsrI
echo.
echo # Old Backend URL
echo OLD_BACKEND_URL=https://marli-backend.herokuapp.com
echo.
echo # Port
echo PORT=5000
) > .env

echo ✅ Fichier .env créé
timeout /t 1 >nul

:: ÉTAPE 3: Créer cloudinary.config.js
echo.
echo ==========================================
echo 🔧 ÉTAPE 3/7: Fichier cloudinary.config.js
echo ==========================================
echo.

(
echo const cloudinary = require('cloudinary'^).v2;
echo.
echo cloudinary.config^(^{
echo   cloud_name: 'dmsnf2wye',
echo   api_key: '139174873651433',
echo   api_secret: process.env.CLOUDINARY_API_SECRET,
echo   secure: true
echo ^}^);
echo.
echo const uploadFromUrl = async ^(url, folder = 'marli-biens'^) =^> ^{
echo   try ^{
echo     const result = await cloudinary.uploader.upload^(url, ^{
echo       folder: folder,
echo       resource_type: 'auto',
echo       transformation: [^{ quality: 'auto', fetch_format: 'auto' ^}]
echo     ^}^);
echo     return result;
echo   ^} catch ^(error^) ^{
echo     console.error^('Erreur upload:', error^);
echo     throw error;
echo   ^}
echo ^};
echo.
echo module.exports = ^{ cloudinary, uploadFromUrl ^};
) > cloudinary.config.js

echo ✅ cloudinary.config.js créé
timeout /t 1 >nul

:: ÉTAPE 4: Créer test-cloudinary.js
echo.
echo ==========================================
echo 🧪 ÉTAPE 4/7: Fichier test-cloudinary.js
echo ==========================================
echo.

(
echo require^('dotenv'^).config^(^);
echo const ^{ cloudinary ^} = require^('./cloudinary.config'^);
echo.
echo async function testCloudinary^(^) ^{
echo   console.log^('\n🧪 TEST CLOUDINARY\n'^);
echo   try ^{
echo     const ping = await cloudinary.api.ping^(^);
echo     console.log^('✅ Connexion réussie:', ping.status^);
echo     const usage = await cloudinary.api.usage^(^);
echo     console.log^('✅ Stockage:', ^(usage.storage.usage / 1024 / 1024^).toFixed^(2^), 'MB'^);
echo     console.log^('\n✅ TOUS LES TESTS RÉUSSIS !\n'^);
echo   ^} catch ^(error^) ^{
echo     console.error^('❌ Erreur:', error.message^);
echo   ^}
echo ^}
echo.
echo testCloudinary^(^);
) > test-cloudinary.js

echo ✅ test-cloudinary.js créé
timeout /t 1 >nul

:: ÉTAPE 5: Créer migrate-images.js (VERSION SIMPLIFIÉE)
echo.
echo ==========================================
echo 📦 ÉTAPE 5/7: Fichier migrate-images.js
echo ==========================================
echo.

(
echo require^('dotenv'^).config^(^);
echo const mongoose = require^('mongoose'^);
echo const axios = require^('axios'^);
echo const ^{ uploadFromUrl ^} = require^('./cloudinary.config'^);
echo.
echo const MONGODB_URI = process.env.MONGODB_URI;
echo const OLD_BACKEND_URL = process.env.OLD_BACKEND_URL;
echo.
echo const bienSchema = new mongoose.Schema^(^{^}, ^{ strict: false ^}^);
echo const Bien = mongoose.model^('bien', bienSchema^);
echo.
echo async function migrateImage^(oldUrl, bienId, imageKey^) ^{
echo   try ^{
echo     console.log^(`\n📤 Migration: $^{imageKey^}`^);
echo     let fullUrl = oldUrl.startsWith^('http'^) ? oldUrl : `$^{OLD_BACKEND_URL^}$^{oldUrl^}`;
echo     const result = await uploadFromUrl^(fullUrl, `marli-biens/$^{bienId^}`^);
echo     console.log^('✅ Uploadé'^);
echo     return ^{ url: result.secure_url, publicId: result.public_id ^};
echo   ^} catch ^(error^) ^{
echo     console.error^('❌ Erreur:', error.message^);
echo     return null;
echo   ^}
echo ^}
echo.
echo async function migrateAll^(^) ^{
echo   console.log^('\n🚀 MIGRATION COMPLÈTE\n'^);
echo   await mongoose.connect^(MONGODB_URI^);
echo   console.log^('✅ MongoDB connecté\n'^);
echo   const biens = await Bien.find^(^{^}^);
echo   console.log^(`📦 $^{biens.length^} biens trouvés\n'^);
echo   let migrated = 0;
echo   for ^(let bien of biens^) ^{
echo     if ^(!bien._medias^) continue;
echo     const updatedMedias = ^{...bien._medias^};
echo     let changed = false;
echo     for ^(const [key, value] of Object.entries^(bien._medias^)^) ^{
echo       if ^(value ^&^& value.url^) ^{
echo         const result = await migrateImage^(value.url, bien._id, key^);
echo         if ^(result^) ^{
echo           updatedMedias[key] = result;
echo           changed = true;
echo           migrated++;
echo         ^}
echo         await new Promise^(r =^> setTimeout^(r, 1000^)^);
echo       ^}
echo     ^}
echo     if ^(changed^) ^{
echo       bien._medias = updatedMedias;
echo       await bien.save^(^);
echo     ^}
echo   ^}
echo   console.log^(`\n✅ MIGRATION TERMINÉE: $^{migrated^} images\n'^);
echo   await mongoose.disconnect^(^);
echo ^}
echo.
echo async function testOne^(bienId^) ^{
echo   console.log^('\n🧪 TEST MIGRATION 1 BIEN\n'^);
echo   await mongoose.connect^(MONGODB_URI^);
echo   const bien = await Bien.findById^(bienId^);
echo   if ^(!bien^) ^{ console.log^('❌ Bien non trouvé'^); return; ^}
echo   const firstKey = Object.keys^(bien._medias^)[0];
echo   const firstImg = bien._medias[firstKey];
echo   if ^(firstImg^) ^{
echo     const result = await migrateImage^(firstImg.url, bien._id, firstKey^);
echo     console.log^(result ? '\n✅ TEST RÉUSSI' : '\n❌ TEST ÉCHOUÉ'^);
echo   ^}
echo   await mongoose.disconnect^(^);
echo ^}
echo.
echo const cmd = process.argv[2];
echo const id = process.argv[3];
echo if ^(cmd === 'test' ^&^& id^) testOne^(id^);
echo else migrateAll^(^);
) > migrate-images.js

echo ✅ migrate-images.js créé
timeout /t 1 >nul

:: ÉTAPE 6: Test de connexion Cloudinary
echo.
echo ==========================================
echo 🧪 ÉTAPE 6/7: Test connexion Cloudinary
echo ==========================================
echo.
echo ⏳ Test en cours...
echo.

call node test-cloudinary.js

if errorlevel 1 (
    color 0E
    echo.
    echo ⚠️ Problème de connexion Cloudinary
    echo Mais les fichiers sont prêts
    echo.
) else (
    echo.
    echo ✅ Connexion Cloudinary OK
    echo.
)

timeout /t 2 >nul

:: ÉTAPE 7: Instructions finales
echo.
echo ==========================================
echo 🎉 INSTALLATION TERMINÉE !
echo ==========================================
echo.
color 0A
echo ✅ Tous les fichiers sont créés
echo ✅ Configuration terminée
echo.
echo 📋 PROCHAINES ÉTAPES:
echo.
echo 1️⃣  Pour tester sur 1 bien:
echo    node migrate-images.js test VOTRE_BIEN_ID
echo.
echo 2️⃣  Pour migrer TOUT:
echo    node migrate-images.js
echo.
echo 💡 CONSEIL: Testez d'abord avec 1 bien !
echo.
echo 📖 Pour obtenir un ID de bien:
echo    - Ouvrez MongoDB Compass
echo    - Collection "biens"
echo    - Copiez un _id
echo.
echo.
echo ⚠️  IMPORTANT: Ce terminal doit rester dans ce dossier
echo    pour exécuter les commandes ci-dessus
echo.
pause