const { test } = require('node:test');
const assert = require('node:assert/strict');
require('dotenv').config();

const { cifrar, descifrar } = require('../services/encryption');

test('Punto 1: Cifrado y descifrado simétrico AES-256-GCM', () => {
  const numeroTarjeta = '4916123456789012';

  // 1. Cifrado
  const datoCifrado = cifrar(numeroTarjeta);
  assert.ok(typeof datoCifrado === 'string');
  assert.notEqual(datoCifrado, numeroTarjeta);

  // Formato v1:iv:tag:contenido
  const partes = datoCifrado.split(':');
  assert.equal(partes.length, 4);
  assert.equal(partes[0], 'v1');

  // 2. Descifrado
  const datoDescifrado = descifrar(datoCifrado);
  assert.equal(datoDescifrado, numeroTarjeta);
});

test('Punto 1: Detección de alteración o datos corruptos en AES-256-GCM', () => {
  const cifrado = cifrar('4111222233334444');
  const partes = cifrado.split(':');

  // Modificar el texto cifrado
  const corruptoCifrado = [partes[0], partes[1], partes[2], 'ff' + partes[3].slice(2)].join(':');
  assert.throws(() => {
    descifrar(corruptoCifrado);
  });
});

