// Generates the signing key once. Never changes PostgreSQL settings.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const dotenv = require('dotenv');

const envPath = path.join(__dirname, '../.env');
const original = fs.readFileSync(envPath, 'utf8');
const before = dotenv.parse(original);
if (before.JWT_SECRET && Buffer.byteLength(before.JWT_SECRET) >= 32) {
  console.log('JWT_SECRET permanente ya está configurado; no se modificó .env.');
} else {
  const line = 'JWT_SECRET=' + crypto.randomBytes(48).toString('hex');
  const pattern = /^[\t ]*(?:export[\t ]+)?JWT_SECRET[\t ]*=[^\r\n]*/gm;
  const newline = original.includes('\r\n') ? '\r\n' : '\n';
  const updated = pattern.test(original)
    ? original.replace(pattern, line)
    : original + (original.endsWith('\n') ? '' : newline) + line + newline;
  const after = dotenv.parse(updated);
  for (const key of new Set([...Object.keys(before), ...Object.keys(after)])) {
    if (key !== 'JWT_SECRET' && before[key] !== after[key]) {
      throw new Error('Se canceló la escritura para preservar la configuración existente.');
    }
  }
  fs.writeFileSync(envPath, updated);
  console.log('JWT_SECRET permanente guardado. Los demás valores de .env se conservaron sin cambios.');
}
