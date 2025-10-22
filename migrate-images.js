require('dotenv').config();
const mongoose = require('mongoose');
const axios = require('axios');
const { uploadFromUrl } = require('./cloudinary.config');

const MONGODB_URI = process.env.MONGODB_URI;
const OLD_BACKEND_URL = process.env.OLD_BACKEND_URL;

const bienSchema = new mongoose.Schema({}, { strict: false });
const Bien = mongoose.model('bien', bienSchema);

async function migrateImage(oldUrl, bienId, imageKey) {
  try {
    console.log(`\n📤 Migration: ${imageKey}`);
    let fullUrl = oldUrl.startsWith('http') ? oldUrl : `${OLD_BACKEND_URL}${oldUrl}`;
    const result = await uploadFromUrl(fullUrl, `marli-biens/${bienId}`);
    console.log('✅ Uploadé');
    return { url: result.secure_url, publicId: result.public_id };
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    return null;
  }
}

async function migrateAll() {
  console.log('\n🚀 MIGRATION COMPLÈTE\n');
  await mongoose.connect(MONGODB_URI);
  console.log('✅ MongoDB connecté\n');
  const biens = await Bien.find({});
  console.log(`📦 ${biens.length} biens trouvés\n');
  let migrated = 0;
  for (let bien of biens) {
    if (!bien._medias) continue;
    const updatedMedias = {...bien._medias};
    let changed = false;
    for (const [key, value] of Object.entries(bien._medias)) {
      if (value && value.url) {
        const result = await migrateImage(value.url, bien._id, key);
        if (result) {
          updatedMedias[key] = result;
          changed = true;
          migrated++;
        }
        await new Promise(r => setTimeout(r, 1000));
      }
    }
    if (changed) {
      bien._medias = updatedMedias;
      await bien.save();
    }
  }
  console.log(`\n✅ MIGRATION TERMINÉE: ${migrated} images\n');
  await mongoose.disconnect();
}

async function testOne(bienId) {
  console.log('\n🧪 TEST MIGRATION 1 BIEN\n');
  await mongoose.connect(MONGODB_URI);
  const bien = await Bien.findById(bienId);
  if (!bien) { console.log('❌ Bien non trouvé'); return; }
  const firstKey = Object.keys(bien._medias)[0];
  const firstImg = bien._medias[firstKey];
  if (firstImg) {
    const result = await migrateImage(firstImg.url, bien._id, firstKey);
    console.log(result ? '\n✅ TEST RÉUSSI' : '\n❌ TEST ÉCHOUÉ');
  }
  await mongoose.disconnect();
}

const cmd = process.argv[2];
const id = process.argv[3];
if (cmd === 'test' && id) testOne(id);
else migrateAll();
