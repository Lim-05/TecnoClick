const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

async function enviarCorreoRecuperacion(correo, enlace) {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: correo,
    subject: 'Recuperación de contraseña',
    html: `
      <h2>Recuperación de contraseña</h2>

      <p>Recibimos una solicitud para cambiar tu contraseña.</p>

      <p>Haz clic en el siguiente enlace:</p>

      <a href="${enlace}">
        Restablecer contraseña
      </a>

      <p>Este enlace expirará en 30 minutos.</p>

      <p>Si tú no solicitaste este cambio, puedes ignorar este correo.</p>
    `
  });
}

module.exports = {
  enviarCorreoRecuperacion
};