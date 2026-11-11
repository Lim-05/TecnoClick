const { test } = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const jwt = require('jsonwebtoken');

const { privateKey, publicKey, firmarDatos, verificarFirma } = require('../services/asymmetric');
const tokens = require('../services/tokens');

test('Punto 2: Par de claves asimétricas RSA cargado correctamente', () => {
  assert.ok(privateKey && privateKey.includes('BEGIN PRIVATE KEY'), 'Debe existir la clave privada RSA');
  assert.ok(publicKey && publicKey.includes('BEGIN PUBLIC KEY'), 'Debe existir la clave pública RSA');
});

test('Punto 2: Firma digital y verificación de comprobantes / datos', () => {
  const comprobante = {
    idPedido: 456,
    folio: 'TEC-12345678',
    total: 2500.50,
    fecha: '2026-11-09T20:30:00Z',
    metodoPago: 'tarjeta'
  };

  // 1. Firma con la clave privada
  const firma = firmarDatos(comprobante);
  assert.ok(typeof firma === 'string' && firma.length > 0, 'La firma generada debe ser una cadena');

  // 2. Verificación válida con clave pública
  const valido = verificarFirma(comprobante, firma);
  assert.equal(valido, true, 'La firma original debe ser válida');

  // 3. Intento de manipulación de datos (anti-tampering)
  const comprobanteAlterado = { ...comprobante, total: 10.00 };
  const invalidoPorDatos = verificarFirma(comprobanteAlterado, firma);
  assert.equal(invalidoPorDatos, false, 'Los datos manipulados deben invalidar la firma');

  // 4. Intento con firma corrupta
  const firmaCorrupta = firma.slice(0, -4) + 'abcd';
  const invalidoPorFirma = verificarFirma(comprobante, firmaCorrupta);
  assert.equal(invalidoPorFirma, false, 'Una firma corrupta debe ser rechazada');
});

test('Punto 2: Autenticación con tokens JWT firmados asimétricamente (RS256)', () => {
  const resMock = {
    cookies: {},
    set() {},
    cookie(nombre, valor) { this.cookies[nombre] = valor; }
  };

  tokens.setCookies(resMock, {
    session: { id: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', id_usuario: 99, expires_at: new Date(Date.now() + 60000) },
    refreshToken: 'b'.repeat(64)
  });

  const token = resMock.cookies['token'];
  assert.ok(token, 'Debe emitir la cookie de token JWT');

  // Inspeccionar header del JWT
  const [headerB64] = token.split('.');
  const header = JSON.parse(Buffer.from(headerB64, 'base64').toString('utf8'));
  assert.equal(header.alg, 'RS256', 'El token debe estar firmado con el algoritmo asimétrico RS256');

  // Verificar con clave pública
  const decodificado = tokens.verifyAccess(token);
  assert.equal(decodificado.id_usuario, 99);
  assert.equal(decodificado.type, 'access');

  // Rechazar token firmado con otra clave privada no autorizada
  const otraClave = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
  });
  const tokenFalso = jwt.sign(
    { id_usuario: 99, sid: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', type: 'access' },
    otraClave.privateKey,
    { algorithm: 'RS256', expiresIn: 900, issuer: 'tecnoclick', audience: 'tecnoclick-api' }
  );

  assert.throws(() => {
    tokens.verifyAccess(tokenFalso);
  }, /invalid signature/i);
});

