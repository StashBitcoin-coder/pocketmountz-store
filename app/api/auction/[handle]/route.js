import { getDb } from '../../../../lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req, { params }) {
  const { handle } = await params;
  try {
    const sql = getDb();
    const rows = await sql`
      SELECT a.*,
        (SELECT json_agg(b ORDER BY b.created_at DESC)
         FROM bids b WHERE b.auction_id = a.id AND b.verified = true) as bids
      FROM auctions a WHERE a.product_handle = ${handle}
    `;
    if (!rows.length) return Response.json({ error: 'Auction not found' }, { status: 404 });
    return Response.json(rows[0]);
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
