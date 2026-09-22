import express from 'express';
import { sql } from '../db/index.js';
import { asyncHandler } from '../services/asyncHandler.js';
import { clientsListPage, clientFormPage } from '../views/clientsView.js';

const router = express.Router();

router.get('/', asyncHandler(async (req, res) => {
  const clients = await sql`SELECT * FROM clients ORDER BY active DESC, name ASC`;
  res.send(clientsListPage({ clients, userEmail: req.session.userEmail }));
}));

router.get('/new', (req, res) => {
  res.send(clientFormPage({ title: 'Novo Cliente', customer: {}, error: null, userEmail: req.session.userEmail }));
});

router.post('/new', asyncHandler(async (req, res) => {
  const { name, sector, contact_name, contact_email, contact_email_cc, notes } = req.body;

  if (!name || !contact_email) {
    return res.status(400).send(clientFormPage({
      title: 'Novo Cliente',
      customer: req.body,
      error: 'Nome do cliente e e-mail de contato são obrigatórios.',
      userEmail: req.session.userEmail,
    }));
  }

  await sql`
    INSERT INTO clients (name, sector, contact_name, contact_email, contact_email_cc, notes)
    VALUES (${name.trim()}, ${sector || null}, ${contact_name || null}, ${contact_email.trim()}, ${contact_email_cc || null}, ${notes || null})
  `;

  res.redirect('/clients');
}));

router.get('/:id/edit', asyncHandler(async (req, res) => {
  const rows = await sql`SELECT * FROM clients WHERE id = ${req.params.id}`;
  const client = rows[0];
  if (!client) return res.status(404).send('Cliente não encontrado');
  res.send(clientFormPage({ title: `Editar ${client.name}`, customer: client, error: null, userEmail: req.session.userEmail }));
}));

router.post('/:id/edit', asyncHandler(async (req, res) => {
  const rows = await sql`SELECT * FROM clients WHERE id = ${req.params.id}`;
  const client = rows[0];
  if (!client) return res.status(404).send('Cliente não encontrado');

  const { name, sector, contact_name, contact_email, contact_email_cc, notes, active } = req.body;

  if (!name || !contact_email) {
    return res.status(400).send(clientFormPage({
      title: `Editar ${client.name}`,
      customer: { ...client, ...req.body },
      error: 'Nome do cliente e e-mail de contato são obrigatórios.',
      userEmail: req.session.userEmail,
    }));
  }

  await sql`
    UPDATE clients SET name = ${name.trim()}, sector = ${sector || null}, contact_name = ${contact_name || null},
      contact_email = ${contact_email.trim()}, contact_email_cc = ${contact_email_cc || null},
      notes = ${notes || null}, active = ${!!active}
    WHERE id = ${req.params.id}
  `;

  res.redirect('/clients');
}));

router.post('/:id/delete', asyncHandler(async (req, res) => {
  await sql`DELETE FROM clients WHERE id = ${req.params.id}`;
  res.redirect('/clients');
}));

export default router;
