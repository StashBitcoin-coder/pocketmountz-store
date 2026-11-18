import { getDb } from '../../../../lib/db';

const SECRET = process.env.ADMIN_SECRET;

export async function POST(req) {
  try {
    const { secret, product_handle } = await req.json();
    if (!SECRET || secret !== SECRET) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (!product_handle) return Response.json({ error: 'product_handle required' }, { status: 400 });

    const sql = getDb();

    // Only allow deleting non-active auctions
    const rows = await sql`SELECT status FROM auctions WHERE product_handle = ${product_handle}`;
    if (!rows.length) return Response.json({ error: 'Auction not found' }, { status: 404 });
    if (rows[0].status === 'active') return Response.json({ error: 'Cannot delete an active auction. End it first.' }, { status: 400 });

    await sql`DELETE FROM bids WHERE auction_id = (SELECT id FROM auctions WHERE product_handle = ${product_handle})`;
    await sql`DELETE FROM auctions WHERE product_handle = ${product_handle}`;

    return Response.json({ success: true });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
