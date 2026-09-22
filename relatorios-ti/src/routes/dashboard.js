import express from 'express';
import { sql } from '../db/index.js';
import { asyncHandler } from '../services/asyncHandler.js';
import { formatPeriod } from '../services/renderReport.js';
import { dashboardPage } from '../views/dashboardView.js';

const router = express.Router();

router.get('/', asyncHandler(async (req, res) => {
  const clients = await sql`SELECT * FROM clients WHERE active = TRUE ORDER BY name ASC`;
  const reports = await sql`
    SELECT r.*, c.name as client_name
    FROM reports r JOIN clients c ON c.id = r.client_id
    ORDER BY r.period DESC, c.name ASC
  `;

  const now = new Date();
  now.setMonth(now.getMonth() - 1);
  const refPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const pendingClients = clients.filter(
    (c) => !reports.some((r) => r.client_id === c.id && r.period === refPeriod && r.status === 'sent')
  );

  const stats = {
    totalClients: clients.length,
    totalReports: reports.length,
    sentReports: reports.filter((r) => r.status === 'sent').length,
    draftReports: reports.filter((r) => r.status === 'draft').length,
  };

  res.send(dashboardPage({
    clients,
    reports: reports.slice(0, 30),
    pendingClients,
    refPeriodLabel: formatPeriod(refPeriod),
    stats,
    formatPeriod,
    userEmail: req.session.userEmail,
  }));
}));

export default router;
