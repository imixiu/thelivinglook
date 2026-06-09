import { neon, neonConfig } from '@neondatabase/serverless';

neonConfig.fetchConnectionCache = true;
// Use fetch-based HTTP transport so Next.js can track and cache data requests
neonConfig.fetchFunction = (url: string, init?: RequestInit) =>
  fetch(url, { ...init, cache: 'no-store' });

function getDatabaseUrl(): string {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  const {
    PGUSER = 'postgres',
    PGPASSWORD = '',
    PGHOST,
    PGPORT = '5432',
    PGDATABASE = 'postgres',
  } = process.env;

  if (!PGHOST) {
    throw new Error('Database configuration missing: PGHOST or DATABASE_URL is required');
  }

  const password = PGPASSWORD ? `:${PGPASSWORD}` : '';
  return `postgresql://${PGUSER}${password}@${PGHOST}:${PGPORT}/${PGDATABASE}?sslmode=require`;
}

const sql = neon(getDatabaseUrl());

export async function query(text: string, params?: any[]): Promise<any> {
  if (params && params.length > 0) {
    return await sql.query(text, params);
  }
  return await sql.query(text);
}