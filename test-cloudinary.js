require('dotenv').config();
const { cloudinary } = require('./cloudinary.config');

async function testCloudinary() {
  console.log('\n🧪 TEST CLOUDINARY\n');
  try {
    const ping = await cloudinary.api.ping();
    console.log('✅ Connexion réussie:', ping.status);
    const usage = await cloudinary.api.usage();
    console.log('✅ Stockage:', (usage.storage.usage / 1024 / 1024).toFixed(2), 'MB');
    console.log('\n✅ TOUS LES TESTS RÉUSSIS !\n');
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

testCloudinary();
