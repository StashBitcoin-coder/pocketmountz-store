import { getDb } from '../../../lib/db';

export async function POST(req) {
  try {
    var { name, email, drop_id } = await req.json();
    if (!name || !email || !email.includes('@')) {
      return Response.json({ error: 'Name and valid email required.' }, { status: 400 });
    }
    var sql = getDb();
    var did = drop_id || 'drop-1';

    // Check for duplicate entry in this drop
    var existing = await sql`
      SELECT id FROM drop_entries WHERE email = ${email.toLowerCase()} AND drop_id = ${did}
    `;
    if (existing.length > 0) {
      return Response.json({ success: true, duplicate: true });
    }

    await sql`
      INSERT INTO drop_entries (name, email, drop_id)
      VALUES (${name.trim()}, ${email.toLowerCase().trim()}, ${did})
    `;
    return Response.json({ success: true });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
