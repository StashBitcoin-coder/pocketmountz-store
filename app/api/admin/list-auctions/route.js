import { getDb } from '../../../../lib/db';

const SECRET = process.env.ADMIN_SECRET;

export async function POST(req) {
  try {
    const { secret } = await req.json();
    if (!SECRET || secret !== SECRET) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const sql = getDb();
    const auctions = await sql`
      SELECT id, product_handle, product_title, variant_id, image_url,
        starting_bid, reserve_price, current_bid, bid_count, starts_at, ends_at, status
      FROM auctions ORDER BY created_at DESC
    `;
    return Response.json({ auctions });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
