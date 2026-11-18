import { getDb } from '../../../../lib/db';

const SECRET = process.env.ADMIN_SECRET;

export async function POST(req) {
  try {
    const { secret, product_handle, ...fields } = await req.json();

    if (!SECRET || secret !== SECRET) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (!product_handle) return Response.json({ error: 'product_handle required' }, { status: 400 });

    const sql = getDb();

    if (fields.image_url !== undefined) {
      await sql`UPDATE auctions SET image_url = ${fields.image_url} WHERE product_handle = ${product_handle}`;
    }
    if (fields.product_title !== undefined) {
      await sql`UPDATE auctions SET product_title = ${fields.product_title} WHERE product_handle = ${product_handle}`;
    }
    if (fields.starting_bid !== undefined) {
      await sql`UPDATE auctions SET starting_bid = ${fields.starting_bid} WHERE product_handle = ${product_handle}`;
    }
    if (fields.ends_at !== undefined) {
      await sql`UPDATE auctions SET ends_at = ${new Date(fields.ends_at)} WHERE product_handle = ${product_handle}`;
    }
    if (fields.status !== undefined) {
      await sql`UPDATE auctions SET status = ${fields.status} WHERE product_handle = ${product_handle}`;
    }

    const rows = await sql`SELECT * FROM auctions WHERE product_handle = ${product_handle}`;
    return Response.json({ success: true, auction: rows[0] });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
