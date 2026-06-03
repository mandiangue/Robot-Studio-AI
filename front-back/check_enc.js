require('dotenv').config();
const e = process.env.ANTHROPIC_KEY_ENC;
const parts = e.split(':');
const enc = parts[1];
console.log('enc length:', enc.length);
const nonHex = [...enc].filter(c => !/[0-9a-fA-F]/.test(c));
console.log('non-hex chars:', JSON.stringify(nonHex));
console.log('last 3 chars:', JSON.stringify(enc.slice(-3)));
