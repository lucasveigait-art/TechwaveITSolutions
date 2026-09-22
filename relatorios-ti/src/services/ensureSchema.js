import { sql } from '../db/index.js';

let ensured = false;

// Cria as tabelas caso ainda não existam. Roda uma vez por instância "fria"
// da função (cold start) — assim o app funciona com qualquer banco Postgres
// (Neon, Supabase, etc.) sem depender de um passo de migração separado.
export async function ensureSchema() {
  if (ensured) return;
  ensured = true;

  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS clients (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      sector TEXT,
      contact_name TEXT,
      contact_email TEXT NOT NULL,
      contact_email_cc TEXT,
      notes TEXT,
      active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS reports (
      id SERIAL PRIMARY KEY,
      client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
      period TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'draft',
      data_json TEXT NOT NULL DEFAULT '{}',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      sent_at TIMESTAMPTZ,
      UNIQUE (client_id, period)
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS email_log (
      id SERIAL PRIMARY KEY,
      report_id INTEGER NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
      to_email TEXT NOT NULL,
      status TEXT NOT NULL,
      error_message TEXT,
      sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
}
