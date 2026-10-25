// Envoi des e-mails du site.
// Render (offre gratuite) bloque les ports SMTP 25, 465 et 587 depuis septembre 2025 :
// l'envoi direct par le serveur mail LWS restait bloqué jusqu'au délai d'expiration,
// et le formulaire ne répondait plus. Si BREVO_API_KEY est défini, les e-mails partent
// par l'API HTTPS de Brevo (port 443, non bloqué). Sinon, SMTP LWS (fonctionne sur une
// offre Render payante), avec des délais courts pour ne jamais bloquer le formulaire.
require('dotenv').config();
const nodemailer = require('nodemailer');

const BREVO_URL = process.env.BREVO_API_URL || 'https://api.brevo.com/v3/smtp/email';

// '"Marli - Passeur..." <support@marli-immobilier.com>' -> { name, email }
const parseAddress = (value) => {
  const m = String(value || '').match(/^\s*"?([^"<]*?)"?\s*<([^>]+)>\s*$/);
  return m ? { name: m[1].trim(), email: m[2].trim() } : { email: String(value).trim() };
};

async function sendWithBrevo(cfg) {
  const to = String(cfg.to).split(',').map((e) => ({ email: e.trim() })).filter((e) => e.email);
  const body = {
    sender: parseAddress(cfg.from),
    to,
    subject: cfg.subject,
    htmlContent: cfg.html,
    ...(cfg.replyTo ? { replyTo: parseAddress(cfg.replyTo) } : {}),
  };
  const res = await fetch(BREVO_URL, {
    method: 'POST',
    headers: { 'api-key': process.env.BREVO_API_KEY, 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`Brevo ${res.status} : ${await res.text()}`);
  return res.json();
}

// Même interface que nodemailer (transporter.sendMail(config, callback))
exports.createTransport = () => {
  if (process.env.BREVO_API_KEY) {
    return {
      sendMail(cfg, cb) {
        sendWithBrevo(cfg).then((info) => cb(null, info), (err) => cb(err));
      },
    };
  }
  return nodemailer.createTransport({
    host: 'mail54.lwspanel.com',
    port: 465,
    secure: true,
    auth: { user: `${process.env.SEND_MAIL_USER}`, pass: `${process.env.SEND_MAIL_PASSWORD}` },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });
};
