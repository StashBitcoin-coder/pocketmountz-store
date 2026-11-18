import { getDb } from '../../../../lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req, { params }) {
  const { handle } = await params;
  try {
    const sql = getDb();
    const rows = await sql`
      SELECT id, product_handle, product_title, variant_id, image_url,
        starting_bid, reserve_price, current_bid, current_winner_email,
        current_winner_name, bid_count, starts_at, ends_at, status, created_at,
        (SELECT json_agg(b ORDER BY b.created_at DESC)
         FROM bids b WHERE b.auction_id = auctions.id AND b.verified = true) as bids
      FROM auctions WHERE product_handle = ${handle}
    `;
    if (!rows.length) return Response.json({ error: 'Auction not found' }, { status: 404 });
    return Response.json(rows[0], {
      headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' },
    });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
