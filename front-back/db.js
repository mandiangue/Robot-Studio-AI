const mongoose = require('mongoose');

let connected = false;

async function connectDB() {
  if (connected) return;
  try {
    // serverSelectionTimeoutMS borne l'attente interne (defaut 30s) -> coherent avec le cap 8s
    // cote start(). Le catch avale l'erreur (connected reste false) -> le boot n'est jamais bloque.
    await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 8000 });
    connected = true;
    console.log('✅ MongoDB connecté');
  } catch(e) {
    console.error('❌ MongoDB erreur:', e.message);
  }
}

module.exports = { connectDB };
