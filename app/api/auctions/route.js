import { getDb } from '../../../lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const sql = getDb();
    const auctions = await sql`
      SELECT id, product_handle, product_title, image_url,
        starting_bid, reserve_price, current_bid, bid_count, starts_at, ends_at, status
      FROM auctions
      WHERE status = 'active'
      ORDER BY ends_at ASC
    `;
    return Response.json({ auctions }, {
      headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' },
    });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
