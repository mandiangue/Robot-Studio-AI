// Usage: node setup_encryption_all.js anthropicKey openaiKey geminiKey mistralKey
const crypto = require('crypto');
const keys = process.argv.slice(2);
if (keys.length < 1) {
  console.error('Usage: node setup_encryption_all.js <anthropic> <openai> <gemini> <mistral>');
  process.exit(1);
}

// Un seul secret pour tous
const secret = crypto.randomBytes(32).toString('hex');
const names = ['ANTHROPIC', 'OPENAI', 'GEMINI', 'MISTRAL'];

console.log('\n✅ Ajoute ces lignes dans ton .env :\n');
console.log(`ENCRYPTION_SECRET=${secret}`);

keys.forEach((key, i) => {
  if (!key) return;
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(secret, 'hex'), iv);
  let enc = cipher.update(key, 'utf8', 'hex');
  enc += cipher.final('hex');
  console.log(`${names[i]}_KEY_ENC=${iv.toString('hex')}:${enc}`);
});

console.log('\n⚠️  Remplace les anciennes valeurs dans .env\n');
