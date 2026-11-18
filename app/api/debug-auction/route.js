import { getDb } from '../../../lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const sql = getDb();
  const rows = await sql`SELECT id, product_handle, image_url, status FROM auctions`;
  return Response.json({ rows, db_url_prefix: process.env.DATABASE_URL?.slice(0, 40) });
}
