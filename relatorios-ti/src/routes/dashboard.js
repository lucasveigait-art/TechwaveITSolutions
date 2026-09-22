const express = require('express');
const db = require('../db');
const { formatPeriod } = require('../services/renderReport');

const router = express.Router();

router.get('/', (req, res) => {
  const clients = db.prepare('SELECT * FROM clients WHERE active = 1 ORDER BY name ASC').all();
  const reports = db.prepare(`
    SELECT r.*, c.name as client_name
    FROM reports r JOIN clients c ON c.id = r.client_id
    ORDER BY r.period DESC, c.name ASC
  `).all();

  const now = new Date();
  const refPeriod = `${now.getFullYear()}-${String(now.getMonth()).padStart(2, '0')}`; // mês anterior (padrão de referência)

  const pendingClients = clients.filter(
    (c) => !reports.some((r) => r.client_id === c.id && r.period === refPeriod && r.status === 'sent')
  );

  const stats = {
    totalClients: clients.length,
    totalReports: reports.length,
    sentReports: reports.filter((r) => r.status === 'sent').length,
    draftReports: reports.filter((r) => r.status === 'draft').length,
  };

  res.render('dashboard', {
    title: 'Dashboard',
    clients,
    reports: reports.slice(0, 30),
    pendingClients,
    refPeriod,
    stats,
    formatPeriod,
  });
});

module.exports = router;
