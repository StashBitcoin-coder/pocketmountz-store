import { getDb } from '../../../lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const sql = getDb();

    const settingRows = await sql`SELECT value FROM site_settings WHERE key = 'multi_auction_mode'`.catch(() => []);
    const multiMode = settingRows[0]?.value === 'true';

    const auctions = await sql`
      SELECT id, product_handle, product_title, image_url,
        starting_bid, reserve_price, current_bid, bid_count, starts_at, ends_at, status
      FROM auctions
      WHERE status = 'active'
      ORDER BY ends_at ASC
    `;

    const result = multiMode ? auctions : auctions.slice(0, 1);

    return Response.json({ auctions: result, multi_mode: multiMode }, {
      headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' },
    });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
