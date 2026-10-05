const { httpError, positiveId } = require('./access');

function text(value, field, maxLength) {
  if (typeof value !== 'string') {
    throw httpError(400, `${field} debe ser texto.`);
  }
  const normalized = value.trim();
  if (!normalized || normalized.length > maxLength) {
    throw httpError(400, `${field} es obligatorio y no puede superar ${maxLength} caracteres.`);
  }
  return normalized;
}

function integer(value, field, { min = 1, max = Number.MAX_SAFE_INTEGER } = {}) {
  if (typeof value === 'string' && !/^\d+$/.test(value)) {
    throw httpError(400, `${field} debe ser un entero válido.`);
  }
  if (!Number.isSafeInteger(Number(value)) || Number(value) < min || Number(value) > max) {
    throw httpError(400, `${field} debe ser un entero válido.`);
  }
  return Number(value);
}

function products(value) {
  if (!Array.isArray(value) || value.length === 0 || value.length > 50) {
    throw httpError(400, 'La lista de productos no es válida.');
  }
  return value.map((product, index) => {
    if (!product || typeof product !== 'object') {
      throw httpError(400, `El producto ${index + 1} no es válido.`);
    }
    return {
      id: integer(product.id, `El ID del producto ${index + 1}`),
      quantity: integer(product.quantity, `La cantidad del producto ${index + 1}`, { max: 100 })
    };
  });
}

function card(value) {
  if (!value || typeof value !== 'object') {
    throw httpError(400, 'Los datos de la tarjeta son requeridos.');
  }
  const nombre_titular = text(value.nombre_titular, 'El nombre del titular', 120);
  const numero_tarjeta = String(value.numero_tarjeta || '').replace(/\s/g, '');
  const fecha_vencimiento = text(value.fecha_vencimiento, 'La fecha de vencimiento', 7);
  const cvv = String(value.cvv || '');

  if (!/^\d{12,19}$/.test(numero_tarjeta) ||
      !/^(0[1-9]|1[0-2])\/\d{2,4}$/.test(fecha_vencimiento) ||
      !/^\d{3,4}$/.test(cvv)) {
    throw httpError(400, 'Los datos de la tarjeta no tienen un formato válido.');
  }
  return { nombre_titular, numero_tarjeta, fecha_vencimiento, cvv };
}

module.exports = { text, integer, products, card, positiveId };
