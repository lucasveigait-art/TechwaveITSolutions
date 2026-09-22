require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('../db');

const email = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD;

if (!email || !password) {
  console.error('Defina ADMIN_EMAIL e ADMIN_PASSWORD no arquivo .env antes de rodar este comando.');
  process.exit(1);
}

const hash = bcrypt.hashSync(password, 10);

const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
if (existing) {
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hash, existing.id);
  console.log(`Senha atualizada para o usuario ${email}.`);
} else {
  db.prepare('INSERT INTO users (email, password_hash) VALUES (?, ?)').run(email, hash);
  console.log(`Usuario administrador ${email} criado com sucesso.`);
}
