const crypto = require('node:crypto');

const ALGORITHM = 'aes-256-gcm';

// Lee la llave desde las variables de entorno.
const keyHex = process.env.DATA_ENCRYPTION_KEY;

// La llave debe contener exactamente 64 caracteres hexadecimales.
if (!keyHex || !/^[a-fA-F0-9]{64}$/.test(keyHex)) {
    throw new Error(
        'DATA_ENCRYPTION_KEY debe contener 64 caracteres hexadecimales.'
    );
}

const KEY = Buffer.from(keyHex, 'hex');

function cifrar(texto) {
    if (typeof texto !== 'string') {
        throw new TypeError('El dato que se va a cifrar debe ser un texto.');
    }

    // Genera un IV nuevo para cada cifrado.
    const iv = crypto.randomBytes(12);

    const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);

    const cifrado = Buffer.concat([
        cipher.update(texto, 'utf8'),
        cipher.final()
    ]);

    // Permite detectar modificaciones en los datos cifrados.
    const tag = cipher.getAuthTag();

    // Guarda versión, IV, etiqueta y contenido en una sola cadena.
    return [
        'v1',
        iv.toString('hex'),
        tag.toString('hex'),
        cifrado.toString('hex')
    ].join(':');
}

function descifrar(valor) {
    if (typeof valor !== 'string') {
        throw new TypeError('El dato cifrado debe ser un texto.');
    }

    const partes = valor.split(':');

    if (partes.length !== 4 || partes[0] !== 'v1') {
        throw new Error('Formato de dato cifrado inválido.');
    }

    const [, ivHex, tagHex, contenidoHex] = partes;

    if (
        !/^[a-fA-F0-9]{24}$/.test(ivHex) ||
        !/^[a-fA-F0-9]{32}$/.test(tagHex) ||
        !/^(?:[a-fA-F0-9]{2})*$/.test(contenidoHex)
    ) {
        throw new Error('Contenido del dato cifrado inválido.');
    }

    const decipher = crypto.createDecipheriv(
        ALGORITHM,
        KEY,
        Buffer.from(ivHex, 'hex')
    );

    decipher.setAuthTag(Buffer.from(tagHex, 'hex'));

    const original = Buffer.concat([
        decipher.update(Buffer.from(contenidoHex, 'hex')),
        decipher.final()
    ]);

    return original.toString('utf8');
}

module.exports = { cifrar, descifrar };