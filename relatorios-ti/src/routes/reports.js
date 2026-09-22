import express from 'express';
import { sql } from '../db/index.js';
import { asyncHandler } from '../services/asyncHandler.js';
import { renderReportHtml } from '../services/renderReport.js';
import { generateReportPdf } from '../services/pdf.js';
import { sendReportEmail } from '../services/email.js';
import { reportNewPage, reportFormPage, reportPreviewPage } from '../views/reportsView.js';

const router = express.Router();

function currentPeriodDefault() {
  const now = new Date();
  now.setMonth(now.getMonth() - 1); // por padrão, relatório se refere ao mês anterior
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function parseData(row) {
  if (!row) return null;
  const raw = row.data_json;
  row.data = raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) : {};
  return row;
}

router.get('/new', asyncHandler(async (req, res) => {
  const clients = await sql`SELECT * FROM clients WHERE active = TRUE ORDER BY name ASC`;
  const selectedClientId = req.query.client_id ? Number(req.query.client_id) : (clients[0] && clients[0].id);
  res.send(reportNewPage({
    clients,
    selectedClientId,
    period: currentPeriodDefault(),
    userEmail: req.session.userEmail,
  }));
}));

// Carrega (ou cria) o rascunho de relatório para um cliente/período e redireciona para edição
router.post('/new', asyncHandler(async (req, res) => {
  const { client_id, period } = req.body;
  if (!client_id || !period) {
    return res.status(400).send('Cliente e período são obrigatórios.');
  }

  let rows = await sql`SELECT id FROM reports WHERE client_id = ${client_id} AND period = ${period}`;
  let report = rows[0];

  if (!report) {
    const inserted = await sql`
      INSERT INTO reports (client_id, period, status, data_json)
      VALUES (${client_id}, ${period}, 'draft', '{}')
      RETURNING id
    `;
    report = inserted[0];
  }

  res.redirect(`/reports/${report.id}/edit`);
}));

router.get('/:id/edit', asyncHandler(async (req, res) => {
  const rows = await sql`SELECT * FROM reports WHERE id = ${req.params.id}`;
  const report = parseData(rows[0]);
  if (!report) return res.status(404).send('Relatório não encontrado');

  const clientRows = await sql`SELECT * FROM clients WHERE id = ${report.client_id}`;
  const client = clientRows[0];

  res.send(reportFormPage({
    title: `Relatório ${client.name} · ${report.period}`,
    clientName: client.name,
    period: report.period,
    data: report.data,
    report,
    userEmail: req.session.userEmail,
  }));
}));

router.post('/:id/edit', asyncHandler(async (req, res) => {
  const rows = await sql`SELECT * FROM reports WHERE id = ${req.params.id}`;
  const report = rows[0];
  if (!report) return res.status(404).send('Relatório não encontrado');

  const { period, _action, ...fields } = req.body;

  await sql`
    UPDATE reports SET period = ${period || report.period}, data_json = ${JSON.stringify(fields)}, updated_at = NOW()
    WHERE id = ${report.id}
  `;

  const redirectTo = _action === 'preview' ? `/reports/${report.id}/preview` : `/reports/${report.id}/edit`;
  res.redirect(redirectTo);
}));

router.get('/:id/preview', asyncHandler(async (req, res) => {
  const rows = await sql`SELECT * FROM reports WHERE id = ${req.params.id}`;
  const report = parseData(rows[0]);
  if (!report) return res.status(404).send('Relatório não encontrado');

  const clientRows = await sql`SELECT * FROM clients WHERE id = ${report.client_id}`;
  const client = clientRows[0];

  const html = renderReportHtml({ client, report });
  res.send(reportPreviewPage({
    report,
    customer: client,
    reportHtml: html,
    sent: req.query.sent,
    sendError: req.query.sendError,
    userEmail: req.session.userEmail,
  }));
}));

router.get('/:id/pdf', asyncHandler(async (req, res) => {
  const rows = await sql`SELECT * FROM reports WHERE id = ${req.params.id}`;
  const report = parseData(rows[0]);
  if (!report) return res.status(404).send('Relatório não encontrado');

  const clientRows = await sql`SELECT * FROM clients WHERE id = ${report.client_id}`;
  const client = clientRows[0];

  const pdfBuffer = await generateReportPdf({ client, report });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="relatorio-${client.name.replace(/\s+/g, '-')}-${report.period}.pdf"`);
  res.send(pdfBuffer);
}));

// Finaliza o relatório e envia por e-mail em um único clique
router.post('/:id/send', asyncHandler(async (req, res) => {
  const rows = await sql`SELECT * FROM reports WHERE id = ${req.params.id}`;
  const report = parseData(rows[0]);
  if (!report) return res.status(404).send('Relatório não encontrado');

  const clientRows = await sql`SELECT * FROM clients WHERE id = ${report.client_id}`;
  const client = clientRows[0];

  try {
    const pdfBuffer = await generateReportPdf({ client, report });
    const html = renderReportHtml({ client, report });

    await sendReportEmail({ client, report, html, pdfBuffer });

    await sql`UPDATE reports SET status = 'sent', sent_at = NOW() WHERE id = ${report.id}`;
    await sql`INSERT INTO email_log (report_id, to_email, status) VALUES (${report.id}, ${client.contact_email}, 'success')`;

    res.redirect(`/reports/${report.id}/preview?sent=1`);
  } catch (err) {
    console.error('Falha ao enviar relatório por e-mail:', err);
    await sql`INSERT INTO email_log (report_id, to_email, status, error_message) VALUES (${report.id}, ${client.contact_email}, 'error', ${err.message})`;
    res.redirect(`/reports/${report.id}/preview?sendError=${encodeURIComponent(err.message)}`);
  }
}));

router.post('/:id/delete', asyncHandler(async (req, res) => {
  await sql`DELETE FROM reports WHERE id = ${req.params.id}`;
  res.redirect('/');
}));

export default router;
