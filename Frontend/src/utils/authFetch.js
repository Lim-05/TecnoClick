let renewal;

export function clearLocalSession() {
  localStorage.removeItem('usuario');
  localStorage.removeItem('token');
  localStorage.removeItem('session_start');
  window.dispatchEvent(new Event('usuarioChange'));
  window.dispatchEvent(new Event('sessionExpired'));
}

async function renew() {
  if (!renewal) {
    const work = async () => {
      // Another tab/request may already have renewed while we waited for the lock.
      const session = await fetch('/api/auth/sesion', { credentials: 'include', cache: 'no-store' });
      if (session.ok) return true;
      if (session.status !== 401) throw new Error('No se pudo verificar la sesión.');
      const response = await fetch('/api/auth/refresh', { method: 'POST', credentials: 'include', cache: 'no-store' });
      if (response.status === 401) { clearLocalSession(); return false; }
      if (!response.ok) throw new Error('No se pudo renovar la sesión. Intenta nuevamente.');
      return true;
    };
    renewal = (navigator.locks
      ? navigator.locks.request('tecnoclick-refresh', work)
      : work()).finally(() => { renewal = undefined; });
  }
  return renewal;
}

// API requests use the same origin so cookies and tab locks share one scope.
export async function authFetch(input, options = {}) {
  const path = input.replace(/^https:\/\/localhost:3000(?=\/api\/)/, '');
  const init = { ...options, credentials: 'include' };
  const response = await fetch(path, init);
  const authAction = /^\/api\/auth\/(login|logout|refresh|recuperar|restablecer)(?:[/?]|$)/.test(path);
  if (response.status !== 401 || authAction) return response;
  if (!await renew()) return response;
  // Retry exactly once: 403, network errors and server errors never trigger renewal.
  const retried = await fetch(path, init);
  if (retried.status === 401) clearLocalSession();
  return retried;
}
