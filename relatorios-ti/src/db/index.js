import { neon } from '@neondatabase/serverless';

let _sql;

function getConnectionString() {
  const connectionString = process.env.DATABASE_URL || process.env.NETLIFY_DB_URL;
  if (!connectionString) {
    throw new Error(
      'Banco de dados não configurado. Defina a variável de ambiente DATABASE_URL com a connection string do Postgres (Neon, Supabase, etc).'
    );
  }
  return connectionString;
}

export function sql(strings, ...values) {
  if (!_sql) _sql = neon(getConnectionString());
  return _sql(strings, ...values);
}
