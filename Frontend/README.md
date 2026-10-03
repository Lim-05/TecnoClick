BEGIN + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.


## Modificaciones

Se agrego un nuevo page, llamado productDetails.js junto con su propio css, en el app.jsx se agrego un 
 import ProductDetail from './pages/ProductDetail';
para importar el componente productdetails, también para visualizar  sus detalles se utilizo
 <Route path="/product/:id" element={<ProductDetail />} /> 
que esto hace que por base de id detecte que producto se esta llamando 

# Cambiar contraseña olvidada

# EN BASE DE DATOS CREAR TABLA
CREATE TABLE IF NOT EXISTS recuperacion_contrasena (
    id_recuperacion SERIAL PRIMARY KEY,
    id_usuario INTEGER NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    expiracion TIMESTAMP NOT NULL,
    usado BOOLEAN NOT NULL DEFAULT FALSE,

    CONSTRAINT fk_recuperacion_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuario(id_usuario)
        ON DELETE CASCADE
);

# DESDE TERMINAL WSL EN BACKEND
npm install nodemailer

# AGREGAR EN .ENV
EMAIL_USER= tecnoclick.sistema@gmail.com
EMAIL_PASSWORD=ciqzhnpnxguqxdjy

## Comunicación segura (HTTPS/TLS) y Cookies seguras para JWT (Puntos 5 y 7)
Se implementó el cifrado de extremo a extremo mediante certificados SSL/TLS tanto en el servidor Backend (`https://localhost:3000`) como en el Frontend (`https://localhost:5173`). Además, se migró el almacenamiento del token JWT de `localStorage` a cookies seguras con los atributos `HttpOnly`, `Secure` y `SameSite=Strict` para prevenir ataques

# DESDE TERMINAL WSL EN BACKEND (Instalar dependencia para leer cookies)
cd backend
npm install cookie-parser

# GENERAR CERTIFICADOS SSL LOCALES (Estando dentro de la carpeta backend)
mkdir -p certs
openssl req -x509 -newkey rsa:2048 -nodes -sha256 -days 365 \
  -subj "/CN=localhost" \
  -addext "subjectAltName=DNS:localhost,IP:127.0.0.1" \
  -keyout certs/key.pem -out certs/cert.pem

  Estos comandos crean los dos archivos criptográficos necesarios para que Node.js y Vite puedan cifrar el tráfico con HTTPS: una llave privada (key.pem) y un certificado público (cert.pem).

# Protección contra intentos automatizados - Implementación de rate limiting
    En backend ejecutar lo siguiente: 
    npm install express-rate-limit

    