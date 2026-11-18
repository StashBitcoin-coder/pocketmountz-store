import { getDb } from '../../../../lib/db';

const DOMAIN = 'qwgc1w-vx.myshopify.com';
const TOKEN = '8cd7493b55b1de0d87a7fbdd991fae1a';
const REGISTRATION_VARIANT = 'gid://shopify/ProductVariant/68166643613995';
const EXTEND_MINUTES = 10;
const MIN_INCREMENT = 1.00;

async function sfetch(query, variables) {
  const res = await fetch(`https://${DOMAIN}/api/2024-01/graphql.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Shopify-Storefront-Access-Token': TOKEN },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  return json.data;
}

export async function POST(req) {
  try {
    const { auction_id, bidder_name, bidder_email, amount, max_amount, code } = await req.json();

    if (!bidder_name || !bidder_email || !amount || !code || !auction_id) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const sql = getDb();

    // Verify email code
    const verifications = await sql`
      SELECT * FROM email_verifications
      WHERE email = ${bidder_email.toLowerCase()} AND code = ${code}
        AND expires_at > NOW() AND used = false
      ORDER BY created_at DESC LIMIT 1
    `;
    if (!verifications.length) return Response.json({ error: 'Invalid or expired verification code' }, { status: 400 });

    // Get auction
    const auctions = await sql`SELECT * FROM auctions WHERE id = ${auction_id} AND status = 'active'`;
    if (!auctions.length) return Response.json({ error: 'Auction not found or ended' }, { status: 404 });
    const auction = auctions[0];

    // Validate bid amount
    const minBid = Number(auction.current_bid) === 0
      ? Number(auction.starting_bid)
      : Number(auction.current_bid) + MIN_INCREMENT;
    if (Number(amount) < minBid) {
      return Response.json({ error: `Minimum bid is $${minBid.toFixed(2)}` }, { status: 400 });
    }

    // Mark code as used
    await sql`UPDATE email_verifications SET used = true WHERE id = ${verifications[0].id}`;

    // Create $1 Shopify cart for registration deposit
    const cartData = await sfetch(
      `mutation cartCreate($lines:[CartLineInput!]!){cartCreate(input:{lines:$lines}){cart{id checkoutUrl}}}`,
      { lines: [{ merchandiseId: REGISTRATION_VARIANT, quantity: 1 }] }
    );
    const checkoutUrl = cartData.cartCreate.cart.checkoutUrl.replace(/^https?:\/\/[^/]+/, `https://${DOMAIN}`);

    // Insert bid
    const bids = await sql`
      INSERT INTO bids (auction_id, bidder_name, bidder_email, amount, max_amount, verified)
      VALUES (${auction_id}, ${bidder_name}, ${bidder_email.toLowerCase()}, ${amount}, ${max_amount || null}, true)
      RETURNING id
    `;
    const bidId = bids[0].id;

    // Run auto-bid: check if someone else has a higher max
    const competing = await sql`
      SELECT * FROM bids
      WHERE auction_id = ${auction_id} AND bidder_email != ${bidder_email.toLowerCase()}
        AND max_amount IS NOT NULL AND max_amount > ${amount} AND verified = true
      ORDER BY max_amount DESC LIMIT 1
    `;

    let finalBid = Number(amount);
    let winner_email = bidder_email.toLowerCase();
    let winner_name = bidder_name;

    if (competing.length) {
      const rival = competing[0];
      const counter = Math.min(Number(rival.max_amount), Number(amount) + MIN_INCREMENT);
      finalBid = counter;
      winner_email = rival.bidder_email;
      winner_name = rival.bidder_name;
    }

    // Auto-extend: if bid in last EXTEND_MINUTES minutes, push end time
    const endsAt = new Date(auction.ends_at);
    const now = new Date();
    const minsLeft = (endsAt - now) / 60000;
    let newEndsAt = endsAt;
    if (minsLeft < EXTEND_MINUTES) {
      newEndsAt = new Date(now.getTime() + EXTEND_MINUTES * 60000);
    }

    // Update auction
    await sql`
      UPDATE auctions SET
        current_bid = ${finalBid},
        current_winner_email = ${winner_email},
        current_winner_name = ${winner_name},
        bid_count = bid_count + 1,
        ends_at = ${newEndsAt}
      WHERE id = ${auction_id}
    `;

    return Response.json({
      success: true,
      bid_id: bidId,
      checkout_url: checkoutUrl,
      current_bid: finalBid,
      ends_at: newEndsAt,
      outbid: competing.length > 0,
    });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
