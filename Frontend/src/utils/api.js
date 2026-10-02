import { getAuthHeaders } from './authUtils';
export async function api(path, options = {}) {
  const response = await fetch('https://localhost:3000/api' + path, {
    ...options,
    credentials: 'include',
    headers: { ...getAuthHeaders(), ...options.headers },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.mensaje || 'No se pudo completar la solicitud.');
  return data;
}
