require('dotenv').config();
const mongoose = require('mongoose');
const BienModel = require('./models/Bien');

async function checkImages() {
  await mongoose.connect(process.env.MONGODB_URI);
  const bien = await BienModel.findOne({});
  console.log('\n📊 Structure d\'un bien:');
  console.log(JSON.stringify(bien._medias, null, 2));
  await mongoose.connection.close();
}

checkImages();
