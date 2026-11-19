import { getDb } from '../../../../lib/db';

const SECRET = process.env.ADMIN_SECRET;

export async function GET() {
  try {
    const sql = getDb();
    await sql`
      CREATE TABLE IF NOT EXISTS site_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      )
    `;
    const rows = await sql`SELECT key, value FROM site_settings`;
    const settings = {};
    rows.forEach(function (r) { settings[r.key] = r.value; });
    return Response.json({ settings }, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { secret, key, value } = await req.json();
    if (!SECRET || secret !== SECRET) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const sql = getDb();
    await sql`
      INSERT INTO site_settings (key, value) VALUES (${key}, ${value})
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
    `;
    return Response.json({ success: true });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
