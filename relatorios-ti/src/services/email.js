const nodemailer = require('nodemailer');
const { formatPeriod } = require('./renderReport');

let cachedTransporter = null;

function getTransporter() {
  if (cachedTransporter) return cachedTransporter;

  const { SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    throw new Error(
      'Configuração de e-mail (SMTP) ausente. Preencha SMTP_HOST, SMTP_USER e SMTP_PASS no arquivo .env.'
    );
  }

  cachedTransporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: String(SMTP_SECURE).toLowerCase() === 'true',
    auth: { user: SMTP_USER, pass: SMTP_PASS },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 20000,
  });

  return cachedTransporter;
}

async function sendReportEmail({ client, report, html, pdfBuffer }) {
  const transporter = getTransporter();
  const fromName = process.env.MAIL_FROM_NAME || 'Techwave IT Solutions';
  const fromEmail = process.env.MAIL_FROM_EMAIL || process.env.SMTP_USER;
  const periodLabel = formatPeriod(report.period);

  const to = client.contact_email;
  const cc = client.contact_email_cc
    ? client.contact_email_cc.split(',').map((e) => e.trim()).filter(Boolean)
    : undefined;
  const bcc = process.env.MAIL_BCC ? process.env.MAIL_BCC.split(',').map((e) => e.trim()).filter(Boolean) : undefined;

  const fileNameSafe = client.name.replace(/[^a-z0-9]+/gi, '-');

  await transporter.sendMail({
    from: `"${fromName}" <${fromEmail}>`,
    to,
    cc,
    bcc,
    subject: `Relatório Mensal de TI · ${client.name} · ${periodLabel}`,
    html,
    attachments: [
      {
        filename: `relatorio-ti-${fileNameSafe}-${report.period}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf',
      },
    ],
  });
}

module.exports = { sendReportEmail, getTransporter };
