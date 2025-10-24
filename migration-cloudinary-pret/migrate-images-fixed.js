// SCRIPT DE MIGRATION CLOUDINARY - VERSION CORRIGÉE
// Sans emojis pour éviter les erreurs d'encodage

require('dotenv').config();
const mongoose = require('mongoose');
const axios = require('axios');
const { uploadFromUrl } = require('./cloudinary.config');

// Configuration
const MONGODB_URI = process.env.MONGODB_URI;
const OLD_BACKEND_URL = process.env.OLD_BACKEND_URL || 'https://marli-backend.herokuapp.com';

// Schéma Bien
const bienSchema = new mongoose.Schema({}, { strict: false });
const Bien = mongoose.model('bien', bienSchema);

// Fonction pour migrer une image
async function migrateImage(oldUrl, bienId, imageKey) {
  try {
    console.log(`\nMigration: ${imageKey}`);
    
    // Construire l'URL complète
    let fullUrl = oldUrl;
    if (!oldUrl.startsWith('http')) {
      fullUrl = `${OLD_BACKEND_URL}/bien/images/${oldUrl}`;
    }
    
    console.log(`   URL source: ${fullUrl}`);
    
    // Vérifier l'accessibilité
    try {
      await axios.head(fullUrl, { timeout: 10000 });
      console.log(`   OK - Image accessible`);
    } catch (error) {
      console.log(`   ERREUR - Image non accessible: ${error.message}`);
      return null;
    }
    
    // Upload vers Cloudinary
    console.log(`   Upload vers Cloudinary...`);
    const result = await uploadFromUrl(fullUrl, `marli-biens/${bienId}`);
    
    console.log(`   OK - Upload reussi`);
    console.log(`   URL: ${result.secure_url}`);
    
    return {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      migratedAt: new Date().toISOString()
    };
    
  } catch (error) {
    console.error(`   ERREUR migration ${imageKey}:`, error.message);
    return null;
  }
}

// Fonction principale
async function migrateAll() {
  console.log('\n=========================================');
  console.log('   MIGRATION CLOUDINARY MARLI');
  console.log('=========================================\n');
  
  let totalImages = 0;
  let migratedImages = 0;
  let failedImages = 0;
  
  try {
    // Connexion MongoDB
    console.log('Connexion a MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('OK - Connecte a MongoDB\n');
    
    // Récupérer les biens
    const biens = await Bien.find({});
    console.log(`${biens.length} biens trouves dans la base de donnees\n`);
    
    // Pour chaque bien
    for (let i = 0; i < biens.length; i++) {
      const bien = biens[i];
      console.log('\n=========================================');
      console.log(`BIEN ${i + 1}/${biens.length}: ${bien.titre || bien._id}`);
      console.log('=========================================');
      
      if (!bien._medias) {
        console.log('   Aucun media trouve');
        continue;
      }
      
      const updatedMedias = { ...bien._medias };
      let bienModified = false;
      
      // Parcourir les images
      for (const [key, value] of Object.entries(bien._medias)) {
        if (value && value.url) {
          totalImages++;
          
          // Migrer l'image
          const result = await migrateImage(value.url, bien._id, key);
          
          if (result) {
            updatedMedias[key] = result;
            migratedImages++;
            bienModified = true;
          } else {
            failedImages++;
          }
          
          // Pause pour ne pas surcharger
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      // Sauvegarder dans MongoDB
      if (bienModified) {
        bien._medias = updatedMedias;
        await bien.save();
        console.log('\nOK - Bien mis a jour dans MongoDB');
      }
    }
    
    // Rapport final
    console.log('\n\n=========================================');
    console.log('   RAPPORT FINAL');
    console.log('=========================================');
    console.log(`Images migrees avec succes: ${migratedImages}/${totalImages}`);
    console.log(`Images en echec: ${failedImages}/${totalImages}`);
    console.log(`Biens traites: ${biens.length}`);
    console.log('=========================================\n');
    
    if (migratedImages === totalImages) {
      console.log('MIGRATION COMPLETE ! Toutes les images sont sur Cloudinary.\n');
    } else {
      console.log('Migration partielle. Verifiez les erreurs ci-dessus.\n');
    }
    
  } catch (error) {
    console.error('\nERREUR FATALE:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Deconnexion MongoDB');
  }
}

// Test sur un bien
async function testBien(bienId) {
  console.log('\n=========================================');
  console.log('   MODE TEST - Migration 1 bien');
  console.log('=========================================\n');
  
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('OK - Connecte a MongoDB\n');
    
    const bien = await Bien.findById(bienId);
    if (!bien) {
      console.log('ERREUR - Bien non trouve');
      return;
    }
    
    console.log(`Test sur: ${bien.titre || bien._id}\n`);
    
    if (!bien._medias) {
      console.log('ERREUR - Aucun media trouve');
      return;
    }
    
    // Migrer la première image
    const firstImageKey = Object.keys(bien._medias)[0];
    const firstImage = bien._medias[firstImageKey];
    
    if (firstImage && firstImage.url) {
      const result = await migrateImage(firstImage.url, bien._id, firstImageKey);
      
      if (result) {
        console.log('\nTEST REUSSI !');
        console.log('Nouvelle URL:', result.url);
        console.log('\nVous pouvez maintenant lancer la migration complete.');
      } else {
        console.log('\nTEST ECHOUE');
        console.log('Verifiez l\'URL du backend Heroku et reessayez.');
      }
    }
    
  } catch (error) {
    console.error('ERREUR:', error);
  } finally {
    await mongoose.disconnect();
  }
}

// Commandes
const command = process.argv[2];
const arg = process.argv[3];

if (command === 'test' && arg) {
  testBien(arg);
} else if (command === 'migrate' || !command) {
  migrateAll();
} else {
  console.log('Usage:');
  console.log('  node migrate-images-fixed.js          // Migration complete');
  console.log('  node migrate-images-fixed.js test <BIEN_ID>  // Tester sur un bien');
}
