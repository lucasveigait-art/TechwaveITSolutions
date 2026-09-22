import bcrypt from 'bcryptjs';
import { sql } from '../db/index.js';

let seeded = false;

// Garante que o usuário administrador definido em ADMIN_EMAIL/ADMIN_PASSWORD
// exista no banco. Roda uma vez por instância "fria" da função (cold start),
// o que evita depender de rodar um script manual separado em produção.
export async function ensureAdminUser() {
  if (seeded) return;
  seeded = true;

  const email = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) return;

  const existing = await sql`SELECT id, password_hash FROM users WHERE email = ${email}`;

  if (existing.length === 0) {
    const hash = bcrypt.hashSync(password, 10);
    await sql`INSERT INTO users (email, password_hash) VALUES (${email}, ${hash})`;
  }
}
