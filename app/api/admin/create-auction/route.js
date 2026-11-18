import { getDb } from '../../../../lib/db';

const SECRET = process.env.ADMIN_SECRET;

export async function POST(req) {
  try {
    const { secret, product_handle, product_title, variant_id, image_url, starting_bid, reserve_price, starts_at, ends_at } = await req.json();

    if (!SECRET || secret !== SECRET) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!product_handle || !product_title || !variant_id || !starts_at || !ends_at) {
      return Response.json({ error: 'Missing required fields: product_handle, product_title, variant_id, starts_at, ends_at' }, { status: 400 });
    }

    const sql = getDb();

    // Warn if this variant is already in an active auction (different handle)
    const existing = await sql`
      SELECT product_handle, product_title FROM auctions
      WHERE variant_id = ${variant_id} AND status = 'active' AND product_handle != ${product_handle}
    `;
    if (existing.length) {
      return Response.json({
        error: `This product is already in an active auction: "${existing[0].product_title}" (${existing[0].product_handle}). End that auction first.`
      }, { status: 409 });
    }

    const rows = await sql`
      INSERT INTO auctions (product_handle, product_title, variant_id, image_url, starting_bid, reserve_price, starts_at, ends_at, status)
      VALUES (
        ${product_handle},
        ${product_title},
        ${variant_id},
        ${image_url || null},
        ${starting_bid || 1.00},
        ${reserve_price || null},
        ${new Date(starts_at)},
        ${new Date(ends_at)},
        'active'
      )
      ON CONFLICT (product_handle) DO UPDATE SET
        product_title = EXCLUDED.product_title,
        variant_id = EXCLUDED.variant_id,
        image_url = EXCLUDED.image_url,
        starting_bid = EXCLUDED.starting_bid,
        reserve_price = EXCLUDED.reserve_price,
        starts_at = EXCLUDED.starts_at,
        ends_at = EXCLUDED.ends_at,
        status = 'active'
      RETURNING *
    `;

    return Response.json({ success: true, auction: rows[0] });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
