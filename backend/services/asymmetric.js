const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const PRIV_KEY_PATH = path.join(__dirname, '../privkey.pem');
const PUB_KEY_PATH = path.join(__dirname, '../pubkey.pem');

let privateKey = null;
let publicKey = null;

function cargarOgenerarClaves() {
  if (privateKey && publicKey) return;

  if (fs.existsSync(PRIV_KEY_PATH)) {
    try {
      privateKey = fs.readFileSync(PRIV_KEY_PATH, 'utf8');
    } catch (e) {
      console.warn('No se pudo leer privkey.pem:', e.message);
    }
  }

  if (fs.existsSync(PUB_KEY_PATH)) {
    try {
      publicKey = fs.readFileSync(PUB_KEY_PATH, 'utf8');
    } catch (e) {
      console.warn('No se pudo leer pubkey.pem:', e.message);
    }
  } else if (privateKey) {
    try {
      publicKey = crypto.createPublicKey(privateKey).export({ type: 'spki', format: 'pem' });
      fs.writeFileSync(PUB_KEY_PATH, publicKey);
    } catch (e) {
      console.warn('No se pudo derivar la clave pública:', e.message);
    }
  }

  // Si no existen claves o hubo error, generar un par RSA de 2048 bits
  if (!privateKey || !publicKey) {
    const pair = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
    });
    privateKey = pair.privateKey;
    publicKey = pair.publicKey;
    try {
      if (!fs.existsSync(PRIV_KEY_PATH)) fs.writeFileSync(PRIV_KEY_PATH, privateKey);
      if (!fs.existsSync(PUB_KEY_PATH)) fs.writeFileSync(PUB_KEY_PATH, publicKey);
    } catch (e) {
      console.warn('No se pudieron persistir las claves generadas:', e.message);
    }
  }
}

cargarOgenerarClaves();

/**
 * Firma digitalmente una cadena o dato estructurado utilizando la clave privada (RSA-SHA256).
 * @param {string|object} datos - Contenido que se desea firmar.
 * @returns {string} Firma digital en formato hexadecimal.
 */
function firmarDatos(datos) {
  cargarOgenerarClaves();
  const contenido = typeof datos === 'object' ? JSON.stringify(datos) : String(datos);
  const signer = crypto.createSign('SHA256');
  signer.update(contenido, 'utf8');
  signer.end();
  return signer.sign(privateKey, 'hex');
}

/**
 * Verifica la firma digital y la integridad de los datos utilizando la clave pública (RSA-SHA256).
 * @param {string|object} datos - Contenido original.
 * @param {string} firmaHex - Firma en hexadecimal a verificar.
 * @returns {boolean} true si la firma es válida y los datos son auténticos, false de lo contrario.
 */
function verificarFirma(datos, firmaHex) {
  cargarOgenerarClaves();
  if (!firmaHex || typeof firmaHex !== 'string') return false;
  const contenido = typeof datos === 'object' ? JSON.stringify(datos) : String(datos);
  try {
    const verifier = crypto.createVerify('SHA256');
    verifier.update(contenido, 'utf8');
    verifier.end();
    return verifier.verify(publicKey, firmaHex, 'hex');
  } catch (err) {
    return false;
  }
}

module.exports = {
  get privateKey() {
    cargarOgenerarClaves();
    return privateKey;
  },
  get publicKey() {
    cargarOgenerarClaves();
    return publicKey;
  },
  firmarDatos,
  verificarFirma
};

