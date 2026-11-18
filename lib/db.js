import { neon } from '@neondatabase/serverless';

export function sql() {
  const client = neon(process.env.DATABASE_URL);
  return client;
}

export async function query(text, params) {
  const client = neon(process.env.DATABASE_URL);
  return client(text, params);
}
