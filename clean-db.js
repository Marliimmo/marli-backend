require('dotenv').config();
const mongoose = require('mongoose');
const BienModel = require('./models/Bien');

async function clean() {
  await mongoose.connect(process.env.MONGODB_URI);
  const biens = await BienModel.find({});
  
  for (const bien of biens) {
    for (const key in bien._medias) {
      if (bien._medias[key].url && !bien._medias[key].url.includes('cloudinary')) {
        delete bien._medias[key];
      }
    }
    bien.markModified('_medias');
    await bien.save();
  }
  
  console.log('✅ Base nettoyée');
  await mongoose.connection.close();
}

clean();
