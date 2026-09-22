import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { sql } from '../db/index.js';

const email = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD;

if (!email || !password) {
  console.error('Defina ADMIN_EMAIL e ADMIN_PASSWORD (no .env ou nas variáveis de ambiente do Netlify) antes de rodar este comando.');
  process.exit(1);
}

const hash = bcrypt.hashSync(password, 10);

const existing = await sql`SELECT id FROM users WHERE email = ${email}`;

if (existing.length > 0) {
  await sql`UPDATE users SET password_hash = ${hash} WHERE id = ${existing[0].id}`;
  console.log(`Senha atualizada para o usuário ${email}.`);
} else {
  await sql`INSERT INTO users (email, password_hash) VALUES (${email}, ${hash})`;
  console.log(`Usuário administrador ${email} criado com sucesso.`);
}

process.exit(0);
