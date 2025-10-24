require('dotenv').config();
const mongoose = require('mongoose');
const cloudinary = require('./cloudinary.config');
const BienModel = require('./models/Bien');

async function uploadToCloudinary(base64Data, fileName) {
  try {
    const result = await cloudinary.uploader.upload(base64Data, {
      folder: 'marli/biens',
      public_id: fileName,
      resource_type: 'auto'
    });
    const urlPath = result.url.split('/upload/')[1];
    console.log(`   ✅ ${fileName}`);
    return urlPath;
  } catch (error) {
    console.error(`   ❌ ${fileName}:`, error.message);
    return null;
  }
}

async function migrateBien(bien) {
  try {
    console.log(`\n📦 Bien: ${bien.ref}`);
    if (!bien._medias || typeof bien._medias !== 'object') {
      console.log('   ⚠️  Pas de médias');
      return;
    }
    let updated = false;
    for (const key of Object.keys(bien._medias)) {
      const media = bien._medias[key];
      if (media.url && media.url.includes('cloudinary.com')) {
        console.log(`   ⏭️  ${key} déjà migré`);
        continue;
      }
      if (media.url) {
        const fileName = `${bien.ref}_${key}_${Date.now()}`;
        let imageData = media.url;
        if (!imageData.startsWith('data:')) {
          imageData = `data:image/jpeg;base64,${imageData}`;
        }
        const cloudinaryPath = await uploadToCloudinary(imageData, fileName);
        if (cloudinaryPath) {
          bien._medias[key].url = cloudinaryPath;
          updated = true;
        }
      }
    }
    if (updated) {
      bien.markModified('_medias');
      await bien.save();
      console.log('   💾 Mis à jour');
    }
  } catch (error) {
    console.error(`   ❌ ${bien.ref}:`, error.message);
  }
}

async function migrateAll() {
  console.log('🚀 Migration MongoDB → Cloudinary\n');
  try {
    console.log('📡 Connexion MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté\n');
    const biens = await BienModel.find({});
    console.log(`📊 ${biens.length} biens\n`);
    let migrated = 0;
    for (const bien of biens) {
      await migrateBien(bien);
      migrated++;
    }
    console.log(`\n✅ ${migrated} biens traités\n🎉 Terminé!`);
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.connection.close();
  }
}

migrateAll();
