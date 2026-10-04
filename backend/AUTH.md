# Sesiones JWT

Desde `backend`, `node scripts/setup-jwt.cjs` configura una clave permanente una
sola vez: agrega o reemplaza exclusivamente `JWT_SECRET` si falta o tiene menos
de 32 bytes. Conserva una clave válida y no modifica los datos de conexión.
No necesitas generar claves en cada arranque ni exportarlas en la terminal.
No subas `.env` al repositorio. En producción configura un secreto aleatorio propio desde
el gestor de secretos. El servidor rechaza secretos ausentes o demasiado cortos.
Las sesiones anteriores requieren volver a iniciar sesión después del despliegue.

Ejecuta manualmente `sql/003_refresh_tokens.sql` en la base `tecnoclick` que usa
el backend y después reinicia el servidor con `node server.js`. El archivo crea
tablas e índices y no elimina datos existentes. `scripts/setup-auth.cjs` es una
alternativa para aplicar ese SQL; ya no escribe en `.env`.

En este equipo, la conexión se verificó correctamente desde Ubuntu/WSL; desde
PowerShell PostgreSQL rechazó la contraseña. Usa la terminal WSL del proyecto.
Para comprobar conexión y existencia de tablas sin modificar nada, ejecuta
`node scripts/check-auth.cjs` desde `backend`.

- JWT de acceso: 15 minutos, HS256, emisor y audiencia verificados.
- Refresh token: 32 bytes aleatorios, siete días absolutos desde el login.
  Cada renovación lo sustituye; solamente se almacena su hash SHA-256.
- Cookies `HttpOnly`, `Secure`, `SameSite=Strict`, sin Domain. La cookie de
  renovación se limita a `/api/auth`; ninguna credencial se devuelve en JSON
  ni se guarda en localStorage.
- `POST /api/auth/refresh`: usa la cookie de renovación, sin exigir JWT vigente.
  Un token usado revoca toda su sesión, incluso el JWT más reciente.
- Logout revoca la sesión de la cookie refresh. Los cambios y recuperación de
  contraseña revocan todas las sesiones del usuario. Cada petición protegida
  verifica la sesión y vuelve a consultar permisos actuales.
- El frontend usa `/api` en el mismo origen (proxy Vite en desarrollo).
  Configura ese proxy también en producción y sirve HTTPS. Ante 401 renueva y
  reintenta una vez; 403 y errores de red no renuevan. Web Locks coordina pestañas
  del mismo origen en navegadores compatibles; sin Web Locks sólo se coordinan
  las solicitudes de cada pestaña y renovaciones simultáneas pueden cerrar sesión.
- Los hashes utilizados se conservan para detectar reutilización durante los siete
  días. Se pueden purgar periódicamente sesiones con `expires_at < NOW()` mediante
  `DELETE FROM auth_sessions WHERE expires_at < NOW();` (sus hashes se eliminan
  en cascada). No elimines los hashes usados de sesiones aún vigentes.

Validación: `npm test` en backend; `npm test` y `npm run build` en Frontend. Las pruebas HTTP
simulan PostgreSQL; no modifican cuentas ni sustituyen una prueba de integración
con el PostgreSQL del despliegue.
