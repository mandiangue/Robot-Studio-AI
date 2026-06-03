const crypto = require('crypto');
const readline = require('readline');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

const secret = crypto.randomBytes(32).toString('hex');
const providers = ['ANTHROPIC', 'OPENAI', 'GEMINI', 'MISTRAL'];
const results = { ENCRYPTION_SECRET: secret };
let i = 0;

function askNext() {
  if (i >= providers.length) {
    console.log('\n✅ Copie ces lignes dans .env (remplace tout) :\n');
    console.log('ENCRYPTION_SECRET=' + secret);
    Object.entries(results).forEach(([k,v]) => { if (k !== 'ENCRYPTION_SECRET') console.log(k + '_KEY_ENC=' + v); });
    rl.close();
    return;
  }
  rl.question(`Clé ${providers[i]} (Enter pour ignorer): `, (key) => {
    const trimmed = key.trim();
    if (trimmed) {
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(secret, 'hex'), iv);
      let enc = cipher.update(trimmed, 'utf8', 'hex');
      enc += cipher.final('hex');
      results[providers[i]] = iv.toString('hex') + ':' + enc;
      console.log(`  ✓ ${providers[i]} chiffré (enc length: ${enc.length})`);
    }
    i++;
    askNext();
  });
}

askNext();
