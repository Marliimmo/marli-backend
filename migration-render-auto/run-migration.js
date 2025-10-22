// Script de migration automatique pour Render
require('dotenv').config();
const mongoose = require('mongoose');
const axios = require('axios');
const { uploadFromUrl } = require('./cloudinary.config');

const MONGODB_URI = process.env.MONGODB_URI;
const OLD_BACKEND_URL = process.env.OLD_BACKEND_URL || 'https://marli-backend.onrender.com';

const bienSchema = new mongoose.Schema({}, { strict: false });
const Bien = mongoose.model('bien', bienSchema);

async function migrateImage(oldUrl, bienId, imageKey) {
  try {
    let fullUrl = oldUrl;
    if (!oldUrl.startsWith('http')) {
      fullUrl = `${OLD_BACKEND_URL}/bien/images/${oldUrl}`;
    }
    
    console.log(`Migration: ${imageKey} - ${fullUrl.substring(0, 80)}...`);
    
    await axios.head(fullUrl, { timeout: 10000 });
    
    const result = await uploadFromUrl(fullUrl, `marli-biens/${bienId}`);
    
    console.log(`OK - ${result.secure_url.substring(0, 60)}...`);
    
    return {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      migratedAt: new Date().toISOString()
    };
    
  } catch (error) {
    console.error(`ERREUR ${imageKey}:`, error.message);
    return null;
  }
}

async function migrateAll() {
  console.log('\n=== MIGRATION CLOUDINARY AUTOMATIQUE ===\n');
  
  let totalImages = 0;
  let migratedImages = 0;
  
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('OK - MongoDB connecte\n');
    
    const biens = await Bien.find({});
    console.log(`${biens.length} biens trouves\n`);
    
    for (let i = 0; i < biens.length; i++) {
      const bien = biens[i];
      console.log(`\n=== BIEN ${i + 1}/${biens.length}: ${bien.title || bien._id} ===`);
      
      if (!bien._medias) continue;
      
      const updatedMedias = { ...bien._medias };
      let modified = false;
      
      for (const [key, value] of Object.entries(bien._medias)) {
        if (value && value.url) {
          totalImages++;
          
          if (value.url.includes('cloudinary.com')) {
            console.log(`${key}: Deja sur Cloudinary`);
            migratedImages++;
            continue;
          }
          
          const result = await migrateImage(value.url, bien._id, key);
          
          if (result) {
            updatedMedias[key] = result;
            migratedImages++;
            modified = true;
          }
          
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      if (modified) {
        bien._medias = updatedMedias;
        await bien.save();
        console.log('Bien mis a jour dans MongoDB');
      }
    }
    
    console.log('\n=== RAPPORT FINAL ===');
    console.log(`Images migrees: ${migratedImages}/${totalImages}`);
    console.log(`Biens traites: ${biens.length}`);
    
    if (migratedImages === totalImages) {
      console.log('\nMIGRATION COMPLETE !');
    }
    
  } catch (error) {
    console.error('ERREUR FATALE:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\nMongoDB deconnecte');
  }
}

migrateAll();
