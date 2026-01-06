import { neon } from '@neondatabase/serverless';

const POSTGRES_URL = process.env.POSTGRES_URL || process.env.DATABASE_URL;

if (!POSTGRES_URL) {
  throw new Error('POSTGRES_URL is not set');
}

export const sql = neon(POSTGRES_URL);
