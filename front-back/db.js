const mongoose = require('mongoose');

let connected = false;

async function connectDB() {
  if (connected) return;
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    connected = true;
    console.log('✅ MongoDB connecté');
  } catch(e) {
    console.error('❌ MongoDB erreur:', e.message);
  }
}

module.exports = { connectDB };
