require('dotenv').config();
const mongoose = require('mongoose');
const cloudinary = require('./cloudinary.config');
const BienModel = require('./models/Bien');

const RENDER_URL = 'https://marli-backend.onrender.com';

async function downloadAndUpload(imagePath, fileName) {
  try {
    const imageUrl = `${RENDER_URL}/${imagePath}`;
    console.log(`   📥 ${imagePath}`);
    
    const result = await cloudinary.uploader.upload(imageUrl, {
      folder: 'marli/biens',
      public_id: fileName,
      resource_type: 'auto'
    });
    
    const urlPath = result.url.split('/upload/')[1];
    console.log(`   ✅ Uploadé`);
    return urlPath;
  } catch (error) {
    console.error(`   ❌ ${error.message}`);
    return null;
  }
}

async function migrateAll() {
  console.log('🚀 Migration Render → Cloudinary\n');
  await mongoose.connect(process.env.MONGODB_URI);
  const biens = await BienModel.find({});
  console.log(`📊 ${biens.length} biens\n`);
  
  let success = 0;
  for (const bien of biens) {
    console.log(`\n📦 ${bien.ref}`);
    let updated = false;
    
    for (const key in bien._medias) {
      const media = bien._medias[key];
      if (media.url && !media.url.includes('cloudinary')) {
        const fileName = `${bien.ref}_${key}`;
        const cloudinaryPath = await downloadAndUpload(media.url, fileName);
        if (cloudinaryPath) {
          bien._medias[key].url = cloudinaryPath;
          updated = true;
        }
      }
    }
    
    if (updated) {
      bien.markModified('_medias');
      await bien.save();
      console.log('   💾 Sauvegardé');
      success++;
    }
  }
  
  console.log(`\n✅ ${success} biens migrés!`);
  await mongoose.connection.close();
}

migrateAll();
