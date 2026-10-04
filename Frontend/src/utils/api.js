import { authFetch } from './authFetch.js';
import { getAuthHeaders } from './authUtils';
export async function api(path, options = {}) {
  const response = await authFetch('/api' + path, {
    ...options,
    credentials: 'include',
    cache: 'no-store',
    headers: { ...getAuthHeaders(), ...options.headers },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    throw new Error('El servidor no respondió correctamente. Comprueba que el backend esté iniciado.');
  }
  const data = await response.json();
  if (!response.ok) throw new Error(data.mensaje || 'No se pudo completar la solicitud.');
  return data;
}
