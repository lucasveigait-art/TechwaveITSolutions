const express = require('express');
const db = require('../db');

const router = express.Router();

router.get('/', (req, res) => {
  const clients = db.prepare('SELECT * FROM clients ORDER BY active DESC, name ASC').all();
  res.render('clients/list', { title: 'Clientes', clients });
});

router.get('/new', (req, res) => {
  res.render('clients/form', { title: 'Novo Cliente', customer: {}, error: null });
});

router.post('/new', (req, res) => {
  const { name, sector, contact_name, contact_email, contact_email_cc, notes } = req.body;

  if (!name || !contact_email) {
    return res.status(400).render('clients/form', {
      title: 'Novo Cliente',
      customer: req.body,
      error: 'Nome do cliente e e-mail de contato são obrigatórios.',
    });
  }

  db.prepare(`
    INSERT INTO clients (name, sector, contact_name, contact_email, contact_email_cc, notes)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(name.trim(), sector || null, contact_name || null, contact_email.trim(), contact_email_cc || null, notes || null);

  res.redirect('/clients');
});

router.get('/:id/edit', (req, res) => {
  const client = db.prepare('SELECT * FROM clients WHERE id = ?').get(req.params.id);
  if (!client) return res.status(404).send('Cliente não encontrado');
  res.render('clients/form', { title: `Editar ${client.name}`, customer: client, error: null });
});

router.post('/:id/edit', (req, res) => {
  const client = db.prepare('SELECT * FROM clients WHERE id = ?').get(req.params.id);
  if (!client) return res.status(404).send('Cliente não encontrado');

  const { name, sector, contact_name, contact_email, contact_email_cc, notes, active } = req.body;

  if (!name || !contact_email) {
    return res.status(400).render('clients/form', {
      title: `Editar ${client.name}`,
      customer: { ...client, ...req.body },
      error: 'Nome do cliente e e-mail de contato são obrigatórios.',
    });
  }

  db.prepare(`
    UPDATE clients SET name = ?, sector = ?, contact_name = ?, contact_email = ?,
      contact_email_cc = ?, notes = ?, active = ?
    WHERE id = ?
  `).run(
    name.trim(), sector || null, contact_name || null, contact_email.trim(),
    contact_email_cc || null, notes || null, active ? 1 : 0, req.params.id
  );

  res.redirect('/clients');
});

router.post('/:id/delete', (req, res) => {
  db.prepare('DELETE FROM clients WHERE id = ?').run(req.params.id);
  res.redirect('/clients');
});

module.exports = router;
