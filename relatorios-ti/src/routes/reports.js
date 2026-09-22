const express = require('express');
const db = require('../db');
const schema = require('../services/reportSchema');
const { renderReportHtml } = require('../services/renderReport');
const { generateReportPdf } = require('../services/pdf');
const { sendReportEmail } = require('../services/email');

const router = express.Router();

function currentPeriodDefault() {
  const now = new Date();
  now.setMonth(now.getMonth() - 1); // por padrão, relatório se refere ao mês anterior
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function loadReport(id) {
  const report = db.prepare('SELECT * FROM reports WHERE id = ?').get(id);
  if (!report) return null;
  report.data = JSON.parse(report.data_json || '{}');
  return report;
}

router.get('/new', (req, res) => {
  const clients = db.prepare('SELECT * FROM clients WHERE active = 1 ORDER BY name ASC').all();
  const selectedClientId = req.query.client_id ? Number(req.query.client_id) : (clients[0] && clients[0].id);
  res.render('reports/form', {
    title: 'Novo Relatório Mensal',
    clients,
    selectedClientId,
    period: currentPeriodDefault(),
    data: {},
    report: null,
    schema,
    error: null,
  });
});

// Carrega (ou cria) o rascunho de relatório para um cliente/período e redireciona para edição
router.post('/new', (req, res) => {
  const { client_id, period } = req.body;
  if (!client_id || !period) {
    return res.status(400).send('Cliente e período são obrigatórios.');
  }

  let report = db.prepare('SELECT * FROM reports WHERE client_id = ? AND period = ?').get(client_id, period);
  if (!report) {
    const info = db.prepare(`
      INSERT INTO reports (client_id, period, status, data_json) VALUES (?, ?, 'draft', '{}')
    `).run(client_id, period);
    report = { id: info.lastInsertRowid };
  }

  res.redirect(`/reports/${report.id}/edit`);
});

router.get('/:id/edit', (req, res) => {
  const report = loadReport(req.params.id);
  if (!report) return res.status(404).send('Relatório não encontrado');
  const client = db.prepare('SELECT * FROM clients WHERE id = ?').get(report.client_id);
  const clients = db.prepare('SELECT * FROM clients WHERE active = 1 ORDER BY name ASC').all();

  res.render('reports/form', {
    title: `Relatório ${client.name} · ${report.period}`,
    clients,
    selectedClientId: report.client_id,
    period: report.period,
    data: report.data,
    report,
    schema,
    error: null,
  });
});

router.post('/:id/edit', (req, res) => {
  const report = db.prepare('SELECT * FROM reports WHERE id = ?').get(req.params.id);
  if (!report) return res.status(404).send('Relatório não encontrado');

  const { period, ...fields } = req.body;

  db.prepare(`
    UPDATE reports SET period = ?, data_json = ?, updated_at = datetime('now')
    WHERE id = ?
  `).run(period || report.period, JSON.stringify(fields), report.id);

  const redirectTo = req.body._action === 'preview' ? `/reports/${report.id}/preview` : `/reports/${report.id}/edit`;
  res.redirect(redirectTo);
});

router.get('/:id/preview', (req, res) => {
  const report = loadReport(req.params.id);
  if (!report) return res.status(404).send('Relatório não encontrado');
  const client = db.prepare('SELECT * FROM clients WHERE id = ?').get(report.client_id);

  const html = renderReportHtml({ client, report });
  res.render('reports/preview', {
    title: `Preview · ${client.name} · ${report.period}`,
    customer: client,
    report,
    reportHtml: html,
    sent: req.query.sent,
    sendError: req.query.sendError,
  });
});

router.get('/:id/pdf', async (req, res) => {
  const report = loadReport(req.params.id);
  if (!report) return res.status(404).send('Relatório não encontrado');
  const client = db.prepare('SELECT * FROM clients WHERE id = ?').get(report.client_id);

  const pdfBuffer = await generateReportPdf({ client, report });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="relatorio-${client.name.replace(/\s+/g, '-')}-${report.period}.pdf"`);
  res.send(pdfBuffer);
});

// Finaliza o relatório e envia por e-mail em um único clique
router.post('/:id/send', async (req, res) => {
  const report = loadReport(req.params.id);
  if (!report) return res.status(404).send('Relatório não encontrado');
  const client = db.prepare('SELECT * FROM clients WHERE id = ?').get(report.client_id);

  try {
    const pdfBuffer = await generateReportPdf({ client, report });
    const html = renderReportHtml({ client, report });

    await sendReportEmail({ client, report, html, pdfBuffer });

    db.prepare(`UPDATE reports SET status = 'sent', sent_at = datetime('now') WHERE id = ?`).run(report.id);
    db.prepare(`
      INSERT INTO email_log (report_id, to_email, status) VALUES (?, ?, 'success')
    `).run(report.id, client.contact_email);

    res.redirect(`/reports/${report.id}/preview?sent=1`);
  } catch (err) {
    console.error('Falha ao enviar relatório por e-mail:', err);
    db.prepare(`
      INSERT INTO email_log (report_id, to_email, status, error_message) VALUES (?, ?, 'error', ?)
    `).run(report.id, client.contact_email, err.message);

    res.redirect(`/reports/${report.id}/preview?sendError=${encodeURIComponent(err.message)}`);
  }
});

router.post('/:id/delete', (req, res) => {
  db.prepare('DELETE FROM reports WHERE id = ?').run(req.params.id);
  res.redirect('/');
});

module.exports = router;
