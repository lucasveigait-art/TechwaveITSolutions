import { getDatabase } from '@netlify/database';

let _db;

// Banco de dados provisionado automaticamente pelo Netlify (Postgres).
// getDatabase() detecta sozinho a connection string do ambiente atual
// (produção, deploy preview, ou `netlify dev` local).
export function getDb() {
  if (!_db) _db = getDatabase();
  return _db;
}

export function sql(strings, ...values) {
  return getDb().sql(strings, ...values);
}
