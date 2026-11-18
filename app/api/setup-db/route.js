import { getDb } from '../../../lib/db';

export async function GET() {
  try {
    const sql = getDb();

    await sql`
      CREATE TABLE IF NOT EXISTS auctions (
        id SERIAL PRIMARY KEY,
        product_handle TEXT NOT NULL UNIQUE,
        product_title TEXT NOT NULL,
        variant_id TEXT NOT NULL,
        image_url TEXT,
        starting_bid NUMERIC(10,2) NOT NULL DEFAULT 1.00,
        reserve_price NUMERIC(10,2),
        current_bid NUMERIC(10,2) NOT NULL DEFAULT 0.00,
        current_winner_email TEXT,
        current_winner_name TEXT,
        bid_count INTEGER NOT NULL DEFAULT 0,
        starts_at TIMESTAMPTZ NOT NULL,
        ends_at TIMESTAMPTZ NOT NULL,
        status TEXT NOT NULL DEFAULT 'active',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS bids (
        id SERIAL PRIMARY KEY,
        auction_id INTEGER NOT NULL REFERENCES auctions(id),
        bidder_name TEXT NOT NULL,
        bidder_email TEXT NOT NULL,
        amount NUMERIC(10,2) NOT NULL,
        max_amount NUMERIC(10,2),
        shopify_order_id TEXT,
        verified BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS email_verifications (
        id SERIAL PRIMARY KEY,
        email TEXT NOT NULL,
        code TEXT NOT NULL,
        expires_at TIMESTAMPTZ NOT NULL,
        used BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;

    return Response.json({ success: true, message: 'Tables created.' });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
